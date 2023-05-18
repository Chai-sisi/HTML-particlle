window.addEventListener('load', function () {
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle='#000000'

    class Particle {
        constructor(effect, x, y, color) {
            this.effect = effect
            this.x = Math.random() * this.effect.width;
            this.y = Math.random() * this.effect.height;
            this.originX = Math.floor(x);
            this.originY = Math.floor(y);
            this.color = color;
            this.size = effect.gap;
            // this.size = 3;
            // this.vx = Math.random() * 2 - 1;
            // this.vy = Math.random() * 2 - 1;
            this.vx = 0;
            this.vy = 0;
            this.friction = 0.7;
            this.ease = 0.2
            //控制粒子回到原点速度的

            this.dx = 0;
            this.dy = 0;
            this.force = 0;
            this.distance = 0;
            this.angle = 0;
            this.active = true;
            this.timeout = undefined;

        }

        draw(context) {
            context.fillStyle = this.color
            context.fillRect(this.x, this.y, this.size, this.size)
        }

        update() {

            if(this.active){
                this.dx = this.effect.mouse.x - this.x;
                this.dy = this.effect.mouse.y - this.y;
                //这里是计算出鼠标距离粒子的x轴和y轴距离
                this.distance = Math.sqrt(this.dx*this.dx+this.dy*this.dy);
                //然后根据勾股定理算出粒子距离鼠标的直线距离
                this.force = -this.effect.mouse.radius/this.distance;
      
                
                if(this.distance<this.effect.mouse.radius){
                        this.angle=Math.atan2(this.dy,this.dx);
                        let tx=this.x + Math.cos(this.angle)*this.effect.mouse.radius -this.effect.mouse.x;
                        let ty= this.y + Math.sin(this.angle)*this.effect.mouse.radius-this.effect.mouse.y;
                        this.vx -= tx;
                        this.vy -= ty;
                        // this.vx +=  Math.cos(this.angle)*this.force;
                        // this.vy +=  Math.cos(this.angle)*this.force;
                      
                }
    
                this.vx+=(this.originX - this.x) * this.ease;
                this.vx *= this.friction;
                this.x += this.vx
                // this.x += (this.vx *= this.friction )+ (this.originX - this.x) * this.ease;
                //this.originX - this.x也就是粒子当前位置和原点位置的差值
                //这里是确保粒子最终能够回到初始位置的代码，当前x加上和originX的差值，就是逐渐回到原点的意思，乘以ease是减缓回到原点的速度
                //当回到初始位置后this.originX - this.x等于0，粒子将不再移动
                // this.y += (this.vy *= this.friction )+(this.originY - this.y) * this.ease;
                this.vy+=(this.originY - this.y) * this.ease;
                this.vy *= this.friction;
                this.y += this.vy
            }
        
            
        }
        warp() {
            this.active=true
            this.x = Math.random() * this.effect.width;
            this.y = Math.random() * this.effect.height;
            this.ease = 0.2;
            this.size=3
        }

        block(){
            this.active=true
            this.x = Math.random() * this.effect.width;
            this.y = Math.random()>0.5? 0:this.effect.height;
            this.ease = 0.05;
            this.size=10;
        }

        assemble(){
            clearInterval(this.timeout)
            this.x = Math.random() * this.effect.width;
            this.y = Math.random() * this.effect.height;
            this.ease = 0.2;
            this.size=3;
            this.active=false;
            this.effect.counter++;
            this.timeout= setTimeout(()=>{
                this.active=true;
            },this.effect.counter);
           
        }
        print(){
            clearInterval(this.timeout)
            this.x =  this.effect.width*0.5;
            this.y =  this.effect.height*0.5;
            this.ease = 0.2;
            this.size=6;
            this.active=false;
            this.effect.counter++;
            this.timeout= setTimeout(()=>{
                this.active=true;
            },this.effect.counter*0.5);
        }
    }

    class Effect {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.particlesArray = [];
            this.image = document.getElementById('image1');
            this.centerX = this.width * 0.5 - this.image.width * 0.5;
            this.centerY = this.height * 0.5 - this.image.height * 0.5;
            this.gap = 10;
            this.mouse = {
                radius: 200,
                x: undefined,
                y: undefined
            }
            window.addEventListener('mousemove', event => {
                this.mouse.x = event.x;
                this.mouse.y = event.y
            });
            this.counter = 0;

        }
        init(context) {
            context.drawImage(this.image, this.centerX, this.centerY);
            //调用animate后，第一帧会清除所有图片，之后会调用draw里的方法，所以这张图在刚开始就被清除了，不会被看到，而粒子在draw方法里，每帧都会重新绘制，所以能看到粒子运动
            const pixels = context.getImageData(0, 0, this.width, this.height).data;
            for (let y = 0; y < this.height; y += this.gap) {
                //外层是Y轴循环，逐行处理画布，gap是跳行，降低精度，不然会影响流畅性
                //这个循环并不是遍历pixels这个数组，而是以width height的尺寸以像素为基准进行循环的，所以循环并不需要乘以4或是除以4，只要推算出对应像素的index即可
                for (let x = 0; x < this.width; x += this.gap) {
                    const index = (y * this.width + x) * 4;
                    //代表了当前粒子的索引y*this.width代表了外循环已经走过的行数部分，加上x是当前这一行走过的部分，乘以4是因为每个像素点由四个数字组成
                    const red = pixels[index];
                    const green = pixels[index + 1];
                    const blue = pixels[index + 2];
                    const alpha = pixels[index + 3];
                    const color = 'rgba(' + red + ',' + green + ',' + blue + ')'

                    if (alpha > 0) {
                        this.particlesArray.push(new Particle(this, x, y, color))
                    }

                }

            }

        }

        draw(context) {
            this.particlesArray.forEach(particle => particle.draw(context))

        }

        update() {
            this.particlesArray.forEach(particle => particle.update())
        }

        warp() {
    
            this.particlesArray.forEach(particle => particle.warp())
        }

        block(){
            this.particlesArray.forEach(particle => particle.block())
        }
        assemble(){
            this.counter = 0;
            this.particlesArray.forEach(particle => particle.assemble())
        }
        print(){
            this.counter = 0;
            this.particlesArray.forEach(particle => particle.print())
        }
    }

    const effect = new Effect(canvas.width, canvas.height)
    effect.init(ctx);
    // console.log(effect)
    // effect.draw(ctx);

    function animate() {
       
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // effect.draw(ctx);
        // effect.update();
        for(let i=0;i<effect.particlesArray.length;i++){
            effect.particlesArray[i].draw(ctx);
            effect.particlesArray[i].update();
        }
        // connect();
        requestAnimationFrame(animate);
   
    }

    animate()
    //   connect()

    const warpButton = this.document.getElementById('warpButton');
    warpButton.addEventListener('click', function () {
        effect.warp()
    })

    const blockButton = this.document.getElementById('blockButton');
    blockButton.addEventListener('click', function () {
        effect.block()
    
    })

        const assembleButton = this.document.getElementById('assembleButton');
    assembleButton.addEventListener('click', function () {
        effect.assemble()
    })
    printButton.addEventListener('click', function () {
        effect.print()
    })

    function connect(){
        for(let a = 0 ;a<effect.particlesArray.length;a++){
            for(let b = a; b<effect.particlesArray.length;b++){
                // this.dx = this.effect.mouse.x - this.x;
                // this.dy = this.effect.mouse.y - this.y;
                // this.distance = Math.sqrt(this.dx*this.dx+this.dy*this.dy);
                let dx = effect.particlesArray[a].x - effect.particlesArray[b].x;
                let dy = effect.particlesArray[a].y - effect.particlesArray[b].y;
                let distance=Math.sqrt(dx*dx+dy*dy);

                if(distance<20){
                    // ctx.strokeStyle = 'white';
                    ctx.lineWidth = 2;
                    ctx.moveTo(effect.particlesArray[a].x,effect.particlesArray[a].y);
                    ctx.lineTo(effect.particlesArray[b].x,effect.particlesArray[b].y);
                    ctx.strokeStyle="black";
                    ctx.stroke();
                }
            }
        }
    }
})



