class PhotoBooth{
    constructor(){
        this.video = document.querySelector('.player');
        this.canvas = document.querySelector('.photo');
        this.ctx = this.canvas.getContext('2d');
        this.strip = document.querySelector('.strip');
        this.snap = document.querySelector('.snap');
        this.shutter = document.querySelector("#camButton");
        camButton.addEventListener("click", ()=>this.takePhoto());
        this.getVideo();
        this.video.addEventListener("canplay", () => {
            this.paintToCanvas();
        });
    }

    getVideo() {
        console.log("inside of getVideo");
        navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            })
            .then(localMediaStream => {
                this.video.srcObject = localMediaStream;
                this.video.play();
            })
            .catch(error => {
                console.error("Egad!  You don't want video!", error);
            })
    }
    paintToCanvas() {
        const width = this.video.videoWidth;
        const height = this.video.videoHeight;
        console.log(width, height);
        this.canvas.width = width;
        this.canvas.height = height;
    
        return setInterval(() => {
            this.ctx.drawImage(this.video, 0, 0, width, height);
            // *take pixels out
            let pixels = this.ctx.getImageData(0, 0, width, height);
            //crazy huge array that goes[r,g,b,a,r,g,b,a,r,g,b,a.....]
            //console.log(pixels);
            //debugger;
            //mess with pixels
            //pixels = rgbSplit(pixels);
            //now for trippy trails
            //ctx.globalAlpha = 0.1;
            //trying green screen
            this.greenScreen(pixels);
            //put pixels back
            this.ctx.putImageData(pixels, 0, 0);
        }, 16)
    }
    
    redEffect(pixels) {
        for (let i = 0; i < pixels.data.length; i += 4) {
            pixels.data[i + 0] = pixels.data[i + 0] + 200; // RED
            pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
            pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
        }
        return pixels;
    }
    
    rgbSplit(pixels) {
        for (let i = 0; i < pixels.data.length; i += 4) {
            pixels.data[i + 0] = pixels.data[i + 100]; // RED
            pixels.data[i + 1] = pixels.data[i + 1]; // GREEN
            pixels.data[i + 2] = pixels.data[i + 202]; // Blue
        }
        return pixels;
    }
    
    greenScreen(pixels) {
        const levels = {};
    
        document.querySelectorAll('.rgb input').forEach((input) => {
            levels[input.name] = input.value;
        });
    
        for (let i = 0; i < pixels.data.length; i = i + 4) {
            let red = pixels.data[i + 0];
            let green = pixels.data[i + 1];
            let blue = pixels.data[i + 2];
            let alpha = pixels.data[i + 3];
    
            if (red >= levels.rmin &&
                green >= levels.gmin &&
                blue >= levels.bmin &&
                red <= levels.rmax &&
                green <= levels.gmax &&
                blue <= levels.bmax) {
                // take it out!
                pixels.data[i + 3] = 0;
            }
        }
    
        return pixels;
    }
    
    takePhoto() {
        this.snap.currentTime = 0;
        this.snap.play();
        const data = this.canvas.toDataURL('image/jpg');
        //console.log(data);
        const link = document.createElement('a');
        link.href = data;
        link.setAttribute("download", "zaphod");
        link.textContent = "Download Image";
        link.innerHTML = `<img src=${data} alt="Still no tentacles"/>`;
        this.strip.insertBefore(link, this.strip.firstChild);
    }
}

let myPhotoBooth = new PhotoBooth();