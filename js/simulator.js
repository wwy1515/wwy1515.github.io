if (navigator.platform == "Win32"
    ||navigator.platform == "MacIntel"
    || navigator.platform == "MacPPC"
    || navigator.platform == "Mac68K"
    || navigator.platform == "Linux") 
    { 
        var canvas = document.getElementById("canvas-fluid");
        canvas.addEventListener('mousemove', update, false);
  
        var xhr;
        var field = new FluidField();
        var display = new FluidDisplay(field);
        var source;
        var processor;
        var analyser;
        var xhr;
        var start = new Date(); // reset after each fps calculation
        var initial = new Date(); // very beginning
        var frames = 0; // for fps calculation
        var pixelArray;
        var firstFrame=true;
        var imageWidth=0;
        var imageHeight=0;
        var pngImage;
        var initialized=false;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', '../media/name.png', true);
        xhr.responseType = 'arraybuffer';
        
        xhr.onload = function(e){
            if (this.status == 200){
                var reader = new PNGReader(this.response);
                reader.parse(function(err, png){
                    if (err) throw err;
                    this.imageWidth=png.getWidth();
                    this.imageHeight=png.getHeight();
                    
                    var pixelArray=png.getRGBA8Array();
                    
                    var count=0;
                    for(var x=0;x<imageWidth;x++)
                    for(var y=0;y<imageHeight;y++)
                    {   
                        var pixel=png.getPixel(x,y);
                        if(pixel[0]==0&&pixel[3]>0)
                        {
                        count++;
                        }   
                    }
                    this.n=count;

                    this.px=new Float32Array(n);
                    this.py=new Float32Array(n);
                    this.pxArray=new Float32Array(n);
                    this.pyArray=new Float32Array(n);
                    this.pc=new Float32Array(n);
                    this.pl=new Int16Array(n);

                    var index=0;
                    for(var x=0;x<imageWidth;x++)
                    for(var y=0;y<imageHeight;y++)
                    {
                        var pixel=png.getPixel(x,y);
                        if(pixel[0]==0&&pixel[3]>0)
                        {
                        pxArray[index]=x;
                        pyArray[index]=y; 
                        index++;
                        }
                    }
                    this.initialized=true;

                });
            }
        };
        
        xhr.send();



        var time = 0; // time since very beginning
        var offset = 0;
        var interval = 5;
        var running = false;

        var n; // number of particles
        var life = 200; // lifetime of particles in frames
        var px ; // x coordinate of particles
        var py; // y coordinate of particles
        var pxArray; // x coordinate of particles
        var pyArray; // y coordinate of particles
        var pc; // color of particle (hue)
        var pl;   // age of particle

        var showVelocity = false;
        var showParticles = true;

        var theta = 0;
        var velocity = 2;
        var radius = 8;

        var mx = 0; // mouse coordinates
        var my = 0;

        function update(event) {
            event = event || window.event;
            var x = event.pageX - 1100;
            var y = event.pageY;
            x = x / canvas.width;
            y = y / canvas.height;
            x = Math.floor(x * field.width);
            y = Math.floor(y * field.height);
            var dx = x - mx;
            var dy = y - my;
            mx = x;
            my = y;
            var v = 5;
            //var vx = field.getXVelocity(x, y) + v * dx;
            //var vy = field.getYVelocity(x, y) + v * dy;
            field.setVelocity(x, y, 5 * dx, 5 * dy);
        }

        function dragOver(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            return false;
        }
        function dropEvent(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            if (music_playing == true)
                disconnect();
            var droppedFiles = evt.dataTransfer.files;
            var reader = new FileReader();

            reader.onload = function (fileEvent) {
                var data = fileEvent.target.result;
                initAudio(data);
            }

            reader.readAsArrayBuffer(droppedFiles[0]);



        }

        function resetParticle(i) {

           
            /*
            var t = i / n;
            var r = radius + Math.random();
            px[i] = field.width * 0.5 + r * Math.cos(t * 2 * Math.PI);
            py[i] = field.height * 0.5 + r * Math.sin(t * 2 * Math.PI);
            pc[i] = t + offset;
            pc[i] -= Math.floor(pc[i]);
            pl[i] = life;
            */

            //    px[i] = 0.1*field.width + 0.8*Math.random() * field.width;
            //    py[i] = Math.random() * 2+0.85*field.height;
            //    var t = i / n * 0.3 + 0.5;
            //    pc[i] = t + offset;
            //    pc[i] -= Math.floor(pc[i]);
            //    pl[i] = life;


            //px[i] = (i%(n/3))/(n/3)*0.8*field.width + 0.1*field.width;
            //py[i] = Math.floor(i/(n/3))*0.3 + 0.85*field.height ;
            var color = Math.random();
            px[i]=pxArray[i];
            py[i]=pyArray[i];
            // px[i] = 0.1 * field.width + 0.8 * color * field.width;
            // if (Math.random() > 0.5)
            // { py[i] = (80.0 + 0.1 * Math.random() * field.height + y_offset) / 128.0 * field.width; }
            // else {
            //     py[i] = (60 + 0.1 * Math.random() * field.height + y_offset) / 128.0 * field.width;

            // }

            var t = color;
            pc[i] = t + offset;
            pc[i] -= Math.floor(pc[i]);
            pl[i] = life;


        }

        function updateFrame() {
            
            requestAnimationFrame(updateFrame);
            if(!initialized)
            return;
            
            if(firstFrame)
            {   
                for (var i = 0; i < n; i++) 
                {
                resetParticle(i);
                pl[i] = Math.floor(Math.random() * life);
                }
            firstFrame=false;
            }
            
            var end = new Date;
            time = end - initial;
            offset = time * 0.0001;

            // updateVelocities();

            field.update();
            //field.dt = 0.1
            for (var i = 0; i < n; i++) {
                var jitter = (1 - pl[i] / life);
                var inv_h = 1.0 / field.h;
                var vx = field.getXVelocity(px[i] - 0.5, py[i] - 0.5);
                var vy = field.getYVelocity(px[i] - 0.5, py[i] - 0.5);

                if (field.dt < 0.1) {

                    px[i] += field.dt * inv_h * vx;
                    py[i] += field.dt * inv_h * vy;
                }
                else {
                    var mx = px[i] + 0.5 * inv_h * field.dt * vx;
                    var my = py[i] + 0.5 * inv_h * field.dt * vy;
                    var vmx = field.getXVelocity(mx - 0.5, my - 0.5);
                    var vmy = field.getYVelocity(mx - 0.5, my - 0.5);
                    px[i] += field.dt * inv_h * vx;
                    py[i] += field.dt * inv_h * vy;
                }
                pl[i] = pl[i] - 15 * field.dt;
                if (pl[i] < 1 || px[i] < 1 || px[i] > field.width || py[i] < 1 || py[i] > field.height - 1) {
                    resetParticle(i);
                }
            }

            display.clear();
            display.renderParticles(field, 1, px, py, pc, pl);




        }

        window.onload = function () {
            if (navigator.platform == "Win32"
            ||navigator.platform == "MacIntel"
            || navigator.platform == "MacPPC"
            || navigator.platform == "Mac68K"
            || navigator.platform == "Linux") {

                requestAnimationFrame(updateFrame);
            } else {
                var child = document.getElementById("d1");
                child.parentNode.removeChild(child);
            }
            

        }

    } 
    else 
    {
        var child = document.getElementById("d1");
        child.parentNode.removeChild(child);
    }