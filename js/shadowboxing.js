/**
 * Shadowboxing: CS 247 P2
 * -----------------------
 * Questions go to Piazza: https://piazza.com/stanford/winter2013/cs247/home
 * Performs background subtraction on a webcam or kinect driver to identify
 * body outlines. Relies on HTML5: <video> <canvas> and getUserMedia().
 * Feel free to configure the constants below to your liking.
 * 
 * Created by Michael Bernstein 2013
 */

// Student-configurable options below...

// show the after-gaussian blur camera input
SHOW_RAW = false;
// show the final shadow
SHOW_SHADOW = true;
// input option: kinectdepth (kinect depth sensor), kinectrgb (kinect camera), 
// or webcam (computer camera)
var INPUT = "webcam"; 
// A difference of >= SHADOW_THRESHOLD across RGB space from the background
// frame is marked as foreground
var SHADOW_THRESHOLD = 8;
// Between 0 and 1: how much memory we retain of previous frames.
// In other words, how much we let the background adapt over time to more recent frames
var BACKGROUND_ALPHA = 0.05;
// We run a gaussian blur over the input image to reduce random noise 
// in the background subtraction. Change this radius to trade off noise for precision 
var STACK_BLUR_RADIUS = 10; 

var TRIGGER_THRESHOLD = 0.50;

var TRIGGER_TRIGGERED = false;

var COUNTDOWN_LENGTH = 3;

/*
 * Begin shadowboxing code
 */
var mediaStream, video, rawCanvas, rawContext, shadowCanvas, shadowContext, background = null;
var kinect, kinectSocket = null;
var shadowCanvases, shadowContexts = null;

var started = false;

$(document).ready(function() {
    initializeDOMElements();

    $("#background").attr('disabled', true);
	if (INPUT == "kinectdepth" || INPUT == "kinectrgb") {
		setUpKinect();
	} else if (INPUT == "webcam") {
		setUpWebCam();
	}

    $('#background').click(function() {
        setBackground();
        if (!started) {
            renderShadow();
        }
    });

    $('#take-photo').submit(function() {
        var canvas = document.createElement('canvas');
        canvas.setAttribute('width', 2*640);
        canvas.setAttribute('height', 2*480);
        var context = canvas.getContext('2d');

        context.drawImage(document.getElementById('shadowCanvas0'), 0, 0, 640, 480);
        context.drawImage(document.getElementById('shadowCanvas1'), 640, 0, 640, 480);
        context.drawImage(document.getElementById('shadowCanvas2'), 0, 480, 640, 480);
        context.drawImage(document.getElementById('shadowCanvas3'), 640, 480, 640, 480);

        var img = canvas.toDataURL('image/jpeg');
        console.log(img);

        $('#image-data').val(img);
        return true; 
    })
});

/*
 * Creates the video and canvas elements
 */
function initializeDOMElements() {
    video = document.createElement('video');
    video.setAttribute('autoplay', true);
    video.style.display = 'none';
    
    rawCanvas = document.createElement('canvas');
    rawCanvas.setAttribute('id', 'rawCanvas');
    rawCanvas.setAttribute('width', 640);
    rawCanvas.setAttribute('height', 480);
    rawCanvas.style.display = SHOW_RAW ? 'block' : 'none';
    document.getElementById('capture').appendChild(rawCanvas);
    rawContext = rawCanvas.getContext('2d');
    // mirror horizontally, so it acts like a reflection
    rawContext.translate(rawCanvas.width, 0);
    rawContext.scale(-1,1);

    shadowContexts = [];
    shadowCanvases = [];
    
    for (var i = 0; i < 4; i++) {
        var canvas = document.createElement('canvas');
        canvas.setAttribute('id', 'shadowCanvas' + i);
        canvas.setAttribute('width', 640);
        canvas.setAttribute('height', 480);
        canvas.setAttribute('class', 'shadowCanvas');
        // canvas.setAttribute('position', 'absolute');
        switch(i) {
            case 0: 
                canvas.style.display = SHOW_SHADOW ? 'block' : 'none';
                document.getElementById('top-left').appendChild(canvas);
                shadowCanvases.push(canvas);
                shadowContexts.push(canvas.getContext('2d')); 
                break;
            case 1:
                canvas.style.display = SHOW_SHADOW ? 'block' : 'none';
                document.getElementById('top-right').appendChild(canvas);
                shadowCanvases.push(canvas);
                shadowContexts.push(canvas.getContext('2d')); 
                break;
            case 2:
                canvas.style.display = SHOW_SHADOW ? 'block' : 'none';
                document.getElementById('bottom-left').appendChild(canvas);
                shadowCanvases.push(canvas);
                shadowContexts.push(canvas.getContext('2d')); 
                break;
            case 3:
                canvas.style.display = SHOW_SHADOW ? 'block' : 'none';
                document.getElementById('bottom-right').appendChild(canvas);
                shadowCanvases.push(canvas);
                shadowContexts.push(canvas.getContext('2d')); 
                break;
        }
        //canvas.style.display = SHOW_SHADOW ? 'block' : 'none';
        //document.getElementById('capture').appendChild(canvas);
        //shadowCanvases.push(canvas);
        //shadowContexts.push(canvas.getContext('2d'));  
    };
    // shadowCanvas = document.createElement('canvas');
    // shadowCanvas.setAttribute('id', 'shadowCanvas');
    // shadowCanvas.setAttribute('width', 640);
    // shadowCanvas.setAttribute('height', 480);
    // shadowCanvas.style.display = SHOW_SHADOW ? 'block' : 'none';
    // document.getElementById('capture').appendChild(shadowCanvas);
    // shadowContext = shadowCanvas.getContext('2d');  
}


/*
 * Starts the connection to the Kinect
 */
function setUpKinect() {
	kinect.sessionPersist()
		  .modal.make('css/knctModal.css')
		  .notif.make();
		  
	kinect.addEventListener('openedSocket', function() {
		startKinect();
	});
}

/*
 * Starts the socket for depth or RGB messages from KinectSocketServer
 */
function startKinect() {
	if (INPUT != "kinectdepth" && INPUT != "kinectrgb") {
		console.log("Asking for incorrect socket from Kinect.");
		return;
	}
	
	if(kinectSocket)
	{
		kinectSocket.send( "KILL" );
		setTimeout(function() {
			kinectSocket.close();
			kinectSocket.onopen = kinectSocket.onmessage = kinectSocket = null;
		}, 300 );
		return false;
	}
	
	// Web sockets
	if (INPUT == "kinectdepth") {
		kinectSocket = kinect.makeDepth(null, true, null);
	} else if (INPUT == "kinectrgb") {
		kinectSocket = kinect.makeRGB(null, true, null);
	}

	kinectSocket.onopen = function() {
	};
	
	kinectSocket.onclose = kinectSocket.onerror = function() {
		kinectSocket.onclose = kinectSocket.onerror = null;
		return false;
	};

	kinectSocket.onmessage = function( e ) {
		if (e.data.indexOf("data:image/jpeg") == 0) {
			var image = new Image();
			image.src = e.data;
			image.onload = function() {
				rawContext.drawImage(image, 0, 0, 640, 480);
			}
			return false;
		}
	};
}

/*
 * Starts webcam capture
 */
function setUpWebCam() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    if (!navigator.getUserMedia) { 
        console.log("Browser does not support getUserMedia. Try a latest version of Chrome/Firefox");
    }
    window.URL = window.URL || window.webkitURL;
    
    video.addEventListener('canplay', function() {
        if ($('#background').attr('disabled')) {
            $('#background').attr('disabled', false);
        }
    }, false);
    
    var failVideoStream = function(e) {
      console.log('Failed to get video stream', e);
    };
    
    navigator.getUserMedia({video: true, audio:false}, function(stream) {
        mediaStream = stream;
        
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
          video.play();
        } else {
          video.src = window.URL.createObjectURL(stream);
        }        
      }, failVideoStream);
}

/*
 * Gets an array of the screen pixels. The array is 4 * numPixels in length,
 * with [red, green, blue, alpha] for each pixel.
 */
function getCameraData() {
    if (mediaStream || kinect) {
        rawContext.drawImage(video, 0, 0, rawCanvas.width, rawCanvas.height);
        stackBlurCanvasRGB('rawCanvas', 0, 0, rawCanvas.width, rawCanvas.height, STACK_BLUR_RADIUS);        
        var pixelData = rawContext.getImageData(0, 0, rawCanvas.width, rawCanvas.height);
        return pixelData;
    }    
}

/*
 * Remembers the current pixels as the background to subtract.
 */
function setBackground() {
    var pixelData = getCameraData();
    background = pixelData;
}

/*
 * In a loop: gets the current frame of video, thresholds it to the background frames,
 * and outputs the difference as a shadow.
 */
function renderShadow() {
  if (!background) {
    return;
  }
  
 
  for (var i = 0; i < shadowContexts.length; i++) {
        pixelData = getShadowData(i);
        var context = shadowContexts[i];
        context.putImageData(pixelData, 0, 0);
  };
  setTimeout(renderShadow, 0);
}

/*
 * Returns an ImageData object that contains black pixels for the shadow
 * and white pixels for the background
 */

function getShadowData(canvasNum) {
    var pixelData = getCameraData();

    var numForegroundPixels = 0;
    var numPixels = 0;

    // Each pixel gets four array indices: [r, g, b, alpha]
    for (var i=0; i<pixelData.data.length; i=i+4) {
        var rCurrent = pixelData.data[i];
        var gCurrent = pixelData.data[i+1];
        var bCurrent = pixelData.data[i+2];
        
        var rBackground = background.data[i];
        var gBackground = background.data[i+1];
        var bBackground = background.data[i+2];
        		
        var distance = pixelDistance(rCurrent, gCurrent, bCurrent, rBackground, gBackground, bBackground); 

        var backgroundColor = [];
        var foregroundColor = [];

        switch(canvasNum) {
            case 0:
                backgroundColor[0] = 248;
                backgroundColor[1] = 178;
                backgroundColor[2] = 78;
                backgroundColor[3] = 1;
                foregroundColor[0] = 126;
                foregroundColor[1] = 50;
                foregroundColor[2] = 124;
                foregroundColor[3] = 1;
                break;
            case 1:
                backgroundColor[0] = 116;
                backgroundColor[1] = 207;
                backgroundColor[2] = 70;
                backgroundColor[3] = 1;
                foregroundColor[0] = 11;
                foregroundColor[1] = 50;
                foregroundColor[2] = 110;
                foregroundColor[3] = 1;
                break;
            case 2:
                backgroundColor[0] = 30;
                backgroundColor[1] = 176;
                backgroundColor[2] = 225;
                backgroundColor[3] = 1;
                foregroundColor[0] = 235;
                foregroundColor[1] = 51;
                foregroundColor[2] = 61;
                foregroundColor[3] = 1;
                break;
            case 3:
                backgroundColor[0] = 247;
                backgroundColor[1] = 215;
                backgroundColor[2] = 19;
                backgroundColor[3] = 1;
                foregroundColor[0] = 28;
                foregroundColor[1] = 129;
                foregroundColor[2] = 271;
                foregroundColor[3] = 1;
                break;

        }       
        
        if (distance >= SHADOW_THRESHOLD) {
            // foreground, show shadow
            pixelData.data[i] = foregroundColor[0];
            pixelData.data[i+1] = foregroundColor[1];
            pixelData.data[i+2] = foregroundColor[2];

            numForegroundPixels += 1;
        } else {
            // background
            
            //  update model of background, since we think this is in the background
            updateBackground(i, rCurrent, gCurrent, bCurrent, rBackground, gBackground, bBackground);
            
            // now set the background color
            pixelData.data[i] = backgroundColor[0];
            pixelData.data[i+1] = backgroundColor[1];
            pixelData.data[i+2] = backgroundColor[2];
        }        
        numPixels += 1;
    }
    if ((numForegroundPixels / numPixels) > TRIGGER_THRESHOLD && TRIGGER_TRIGGERED != true) {
        TRIGGER_TRIGGERED = true;
        CreateTimer("timer", COUNTDOWN_LENGTH);
    }
    
    return pixelData; 
}

function updateBackground(i, rCurrent, gCurrent, bCurrent, rBackground, gBackground, bBackground) {
    background.data[i] = Math.round(BACKGROUND_ALPHA * rCurrent + (1-BACKGROUND_ALPHA) * rBackground);
    background.data[i+1] = Math.round(BACKGROUND_ALPHA * gCurrent + (1-BACKGROUND_ALPHA) * gBackground);
    background.data[i+2] = Math.round(BACKGROUND_ALPHA * bCurrent + (1-BACKGROUND_ALPHA) * bBackground);
}

/*
 * Returns the distance between two pixels in grayscale space
 */
function pixelDistance(r1, g1, b1, r2, g2, b2) {
    return Math.abs((r1+g1+b1)/3 - (r2+g2+b2)/3);
}

var Timer;
var TotalSeconds;

function CreateTimer(TimerID, Time) {
        Timer = document.getElementById(TimerID);
        TotalSeconds = Time;
        
        UpdateTimer()
        window.setTimeout("Tick()", 1000);
}

function Tick() {
        if (TotalSeconds <= 0) {
                $('#take-photo').submit();
                return;
        }

        TotalSeconds -= 1;
        UpdateTimer()
        window.setTimeout("Tick()", 1000);
}

function UpdateTimer() {
        var Seconds = TotalSeconds;
        
        var Days = Math.floor(Seconds / 86400);
        Seconds -= Days * 86400;

        var Hours = Math.floor(Seconds / 3600);
        Seconds -= Hours * (3600);

        var Minutes = Math.floor(Seconds / 60);
        Seconds -= Minutes * (60);


        var TimeStr = ((Days > 0) ? Days + " days " : "") + LeadingZero(Hours) + ":" + LeadingZero(Minutes) + ":" + LeadingZero(Seconds)

        Timer.innerHTML = TotalSeconds;
}
function LeadingZero(Time) {

        return (Time < 10) ? "0" + Time : + Time;

}