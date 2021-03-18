/**
 * * Photobooth class 
 * 
 * * This is a self contained class dealing with the photobooth application
 */
class PhotoBooth{
    /**
     * * constructor function
     * 
     * * sets up:
     * * - screen references
     * * - filter booleans(which filter is active)
     */
    constructor(){
        // * our 3 filters that can be applied to our image
        this.red = false;
        this.split = false;
        this.greenScreen = false;
        // * video feed, canvas and the context for the canvas
        this.video = document.querySelector('.player');
        this.canvas = document.querySelector('.photo');
        this.ctx = this.canvas.getContext('2d');
        // * image strip, shutter button and the snap sound effect
        this.strip = document.querySelector('.strip');
        this.snap = document.querySelector('.snap');
        this.shutter = document.querySelector("#camButton");
        //*control buttons here
        this.redBtn = document.querySelector("#redEffect");
        this.splitBtn = document.querySelector("#splitEffect");
        this.greenScreenBtn = document.querySelector("#greenScreenEffect");
        // * on selecting a filter, we turn the other two filters off
        this.redBtn.addEventListener("click", ()=>{
            this.greenScreen = false;
            this.split = false;
            this.red = !this.red;
        });
        this.splitBtn.addEventListener("click", ()=>{
            this.greenScreen = false;
            this.red = false;
            this.split = !this.split;
        });
        this.greenScreenBtn.addEventListener("click", ()=>{
            this.greenScreen = !this.greenScreen;
            this.red = false;
            this.split = false;
        });
        // * when the shutter button is pressed we take the photo
        camButton.addEventListener("click", ()=>this.takePhoto());
        // * getVideo pulls the video stream from the computers camera
        this.getVideo();
        // * when video is available we paint the frames to the canvas
        this.video.addEventListener("canplay", () => {
            this.paintToCanvas();
        });

    }
    /**
     * * getVideo
     * 
     * * In this fucntion we gather video but not audio
     * * The video becomes a stream which we play
     * * this.video represents the video tag in the html
     */
    getVideo() {
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
    /**
     * * paintToCanvas
     * @returns an interval that writes image data to the canvas every 16milliseconds
     * * takes the dimensions of the video feed and adjusts the canvas size
     * * returns an interval that updates the canvas data with video and filter info
     * * then writes that data to the canvas
     */
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
            if(this.red==true){
                pixels = this.redEffect(pixels);
            }
            if(this.split==true){
                pixels = this.rgbSplit(pixels);
            }
            if(this.greenScreen==true){
                pixels = this.greenScreenEffect(pixels);
            }
            this.ctx.putImageData(pixels, 0, 0);
        }, 16)
    }
    
    /**
     * redEffect
     * @param {*} pixels - the feed of image data from the camera
     * @returns an array of image data
     * *takes the red pixel data and adds 200
     * *reduced the green by 50 and halves the blue values
     */
    redEffect(pixels) {
        for (let i = 0; i < pixels.data.length; i += 4) {
            pixels.data[i + 0] = pixels.data[i + 0] + 200; // RED
            pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
            pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
        }
        return pixels;
    }
    
    /**
     * rgbSplit
     * @param {*} pixels - an array of video feed data
     * @returns - an array of modified pixel data
     * * This funtion changes the relative position of where the pixel colours appear
     * * The effect is a splitting of the colour channels
     */
    rgbSplit(pixels) {
        for (let i = 0; i < pixels.data.length; i += 4) {
            pixels.data[i + 0] = pixels.data[i + 100]; // RED
            pixels.data[i + 1] = pixels.data[i + 1]; // GREEN
            pixels.data[i + 2] = pixels.data[i + 202]; // Blue
        }
        return pixels;
    }
    
    /**
     * greenScreenEffect
     * @param {*} pixels - an array of video feed data
     * @returns - an array of video data modified by the function
     * 
     * * This function works with the onscreen sliders, which have a min and a max
     * * In each set of 4 values, we check to see if the value of red, green, and blue
     * * fall between the min and max of the sliders for that colour.
     * 
     * * If they fall between the min and max values, the colour value is reset to 0 for alpha
     * * Alpha is the fourth value of each set of 4 taken in.  If it is set to 0, the pixel is 
     * * transparent
     */
    greenScreenEffect(pixels) {
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
    
    /**
     * * takePhoto
     * 
     * * This function takes the data from the canvas and turns it into a jpg
     * * the jpg data is stored as the src for the image tag that is written to the screen
     */
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
// * creating an instance of photobooth
let myPhotoBooth = new PhotoBooth();