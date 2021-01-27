(function main(){

	// YAY, this was global but now it's encapsulated!
	let currentPermittedWidth = 0;

	// 'secret' image to get inserted
	const secretImg = new Image()
	secretImg.src = './skull.png'

	// background image
	const bgImg = new Image();
	bgImg.src = './rhino.jpg';

	let secretLoaded = false;
	let bgLoaded = false;
	let textLoaded = false;

	secretImg.addEventListener('load', (event) => {	
		secretLoaded = true;
	});

	bgImg.addEventListener('load', (event) => {	
		bgLoaded = true;	
	});

	const loadMonitorTimer = setInterval(()=> {
		if (secretLoaded && bgLoaded) {
			clearInterval(loadMonitorTimer);
			backgroundOnload(bgImg, secretImg, currentPermittedWidth);
		}
	},100);

}());

function secretOnload(secretImg){	
  const secretPixels = getSourceData('skullCanvas', 112, secretImg);  
  // create an array of functions
  // each function describes where that pixel should be in a grid given a width
  functionArr = [];
  secretPixels.pixelArr.forEach((pixel, index) => {
  	const row = Math.floor(index/secretPixels.width);
  	const offset = index % secretPixels.width;  	
  	functionArr.push((width) => (width*row + offset));
  });
  
  return {
  	pixelArr: secretPixels.pixelArr,
  	functionArr: functionArr,
  }
}

function backgroundOnload(bgImg, secretImg, currentPermittedWidth) {	
	// get the pixel information for the background image
	const sourceData = (getSourceData("sourceCanvas", 199, bgImg));

	// set up the destination canvas
	const canvas = document.getElementById('destinationCanvas')
	const ctx = canvas.getContext('2d');
	const pixelScale = 6;
	ctx.canvas.width = sourceData.width * pixelScale;
	ctx.canvas.height = sourceData.height * pixelScale;
	applySecretImage(sourceData, 164, secretImg);	
	// applyText(sourceData, pixelScale);
	draw(199, sourceData, ctx, pixelScale);
	controls(sourceData, ctx, pixelScale, canvas, currentPermittedWidth);		
}

function controls(sourceData, ctx, pixelScale, canvas, currentPermittedWidth){
	// button controls
	const resolveImage = document.querySelector('#resolveImage');
	const resolveSecret = document.querySelector('#resolveSecret');	

	// click controls	
	const container = document.querySelector('#destinationCanvas');
	let direction = null;
	let timerId = null;
 	container.onclick = (e) => {
 	console.log("click!");
 		if (timerId !== null) { 			
 			clearInterval(timerId);
 		} 		
 		const seek = Math.round(e.offsetX/pixelScale);
 		if (!e.shiftKey) { 		
	 		if (currentPermittedWidth < seek) {
	 			direction = 1;
	 		} else {
	 			direction = -1
	 		} 		  		
			timerId = setInterval(() => { 			 					
	 			if (currentPermittedWidth === seek) { 				
	 				clearInterval(timerId);	 				
	 			} else {	 				
	 				currentPermittedWidth+=direction;
	 				draw(currentPermittedWidth, sourceData, ctx, pixelScale);
	 			}
	 		},50)
 		} else {
 			currentPermittedWidth = seek;
 			draw(seek, sourceData, ctx, pixelScale);
 		} 		 		
 	}	

 	// keypress controls
	function control(e) {		
		if (timerId !== null) { 			
 			clearInterval(timerId);
 		}
 		// advance to end
 		if (e.keyCode === 38) {
 			currentPermittedWidth = canvas.width/pixelScale;
 			draw(currentPermittedWidth, sourceData, ctx, pixelScale);
 		}
 		// rewind to beginning
 		if (e.keyCode === 40) {
 			currentPermittedWidth = 0;
 			draw(currentPermittedWidth, sourceData, ctx, pixelScale);
 		}  		
		//scrub right	
		else if (currentPermittedWidth < canvas.width/pixelScale && e.keyCode === 39) {						
			currentPermittedWidth++;			
			draw(currentPermittedWidth, sourceData, ctx, pixelScale);
		//scrub left
		} else if (currentPermittedWidth > 0 && e.keyCode === 37) {
			currentPermittedWidth--;
			draw(currentPermittedWidth, sourceData, ctx, pixelScale);			
		}
	}
	document.addEventListener('keydown', control);

	resolveImage.onclick = (e) => {
		if (timerId !== null) { 			
 			clearInterval(timerId);
 		}		
		currentPermittedWidth = canvas.width/pixelScale;
 		draw(currentPermittedWidth, sourceData, ctx, pixelScale);
	}

	resolveSecret.onclick = (e) => {
		if (timerId !== null) { 			
 			clearInterval(timerId);
 		}		
		currentPermittedWidth = 164;
 		draw(currentPermittedWidth, sourceData, ctx, pixelScale);
	}
}

function applySecretImage(sourceData, resolveWidth, secretImg) {
	const secretData = secretOnload(secretImg);	
	// reduce brightness of background
	for (let i = 0; i < sourceData.pixelArr.length; i++) {
		sourceData.pixelArr[i] -= 50;		
	}
	for (let i = 0; i < functionArr.length; i+=3) {
		// don't apply black pixels
		if (secretData.pixelArr[i] === 0) continue;
		// using the functions in the function array to supply indicies
		// insert the pixels from the secret image into the background image
		sourceData.pixelArr[functionArr[i](resolveWidth)-270] = secretData.pixelArr[i]+5;
	}	
}		

function applyText(sourceData, pixelScale) {		
 	// set up the text layer canvas
	const canvas = document.getElementById('textLayer')
	const ctx = canvas.getContext('2d');	
	ctx.canvas.width = sourceData.width * pixelScale;
	ctx.canvas.height = sourceData.height * pixelScale;
	const width = sourceData.width;
				
	const characterMaps = {
		'0' : [0, 1, 2, 3, 4, width, width+3, width+4, (width*2), (width*2)+2, (width*2)+4, (width*3), (width*3)+1, (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4], 
		'1': [1, 2, width+2, (width*2)+2, (width*3)+2, (width*4)+1, (width*4)+2, (width*4)+3],
		'2': [0, 1, 2, 3, 4, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4], 
		'3': [0, 1, 2, 3, 4, width+4, (width*2)+2, (width*2)+3, (width*2)+4, (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4], 
		'4': [0, 4, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3)+4, (width*4)+4], 
		'5': [0, 1, 2, 3, 4, width, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*3)+3, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3],
		'6': [0, 1, 2, 3, 4, width, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],      
		'7': [0, 1, 2, 3, 4, width+4, (width*2)+4, (width*3)+4, (width*4)+4],
		'8': [0, 1, 2, 3, 4, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],   
		'9': [0, 1, 2, 3, 4, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3)+4, (width*4)+4],
		' ': [],
		'.': [width*4+1],
		',': [width*4+1, (width*5)+1],
		"'": [1, width+1],
		'A' : [2, width+1, width+3, width*2, (width*2)+4, width*3, (width*3)+1, (width*3)+2, (width*3)+3,(width*3)+4, (width*4), (width*4)+4],
		'B' : [0,1,2,3, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*3)+4, width*4, (width*4)+1, (width*4)+2, (width*4)+3],
		'C' : [0, 1, 2, 3, 4, width, (width*2), (width*3), (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'D' : [0, 1, 2, 3, width, width+4, (width*2), (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4)+1, (width*4)+2, (width*4)+3],
		'E' : [0, 1, 2, 3, 4, width, (width*2), (width*2), (width*2)+1, (width*2)+2, (width*3), (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'F' : [0, 1, 2, 3, 4, width, (width*2), (width*2), (width*2)+1, (width*2)+2, (width*3), (width*4), (width*4)],
		'G' : [0, 1, 2, 3, 4, width, (width*2), (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'H' : [0, 4, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4),(width*4)+4],
		'I' : [0, 1, 2, 3, 4, width+2, (width*2)+2, (width*3)+2, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'J' : [width+4, width*3, (width*2)+4, (width*3)+4, (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'K' : [0, 4, width, width+3, (width*2), (width*2)+1, (width*2)+2, (width*3), (width*3)+3, (width*4), (width*4),(width*4)+4],
		'L' : [0, width, (width*2), (width*3), (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'M' : [0, 4, width, width+1, width+3, width+4, (width*2), (width*2)+2, (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4),(width*4)+4],
		'N' : [0, 4, width, width+1, width+4, (width*2), (width*2)+2, (width*2)+4, (width*3), (width*3)+3, (width*3)+4, (width*4), (width*4),(width*4)+4],
		'O' : [0, 1, 2, 3, 4, width, width+4, (width*2), (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'P' : [0,1,2,3, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), width*4],
		'Q' : [0, 1, 2, 3, 4, width, width+4, (width*2), (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4, (width*5)+2, (width*3)+2],
		'R' : [0,1,2,3, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, width*3, (width*3)+3, width*4, (width*4)+4],
		'S' : [0, 1, 2, 3, 4, width, (width*2), (width*2)+4, (width*2)+1, (width*2)+2, (width*2)+3, (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'T' : [0, 1, 2, 3, 4, width+2, (width*2)+2, (width*3)+2, (width*4)+2],
		'U' : [0, 4, width, width+4, (width*2), (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'V' : [0, 4, width, width+4, (width*2), (width*2)+4, (width*3)+1, (width*3)+3, (width*4)+2],
		'W' : [0, 4, width, width+4, (width*2), (width*2)+4, width*3, (width*3)+1, (width*3)+3, (width*3)+4, (width*2)+2, width*4, (width*4)+4],
		'X' : [0, 4, width+1, width+3, (width*2)+2, (width*3)+1, (width*3)+3, (width*2)+2, width*4, (width*4)+4],
		'Y' : [0, 4, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3)+2, (width*4)+2],
		'Z' : [0, 1, 2, 3, 4, width+3, (width*2)+2, (width*3)+1, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
	}

	drawString("Patrick Kaipainen",1+width*21, true);
	drawString("Web developer,",1+width*22, true);
	drawString("pixel enthusiast",1+width*23, true);
	
	function drawString(string, start, mono) {
		const chars = Array.from(string.toUpperCase());
		let counter = 0;
		chars.forEach((char, i) => drawChar(char, ((i+start) * pixelScale), mono));
	}

	function drawChar(char, offset, mono) {		
		let textPixels = [];		
		characterMaps[char.toUpperCase()].forEach(point => {
			textPixels[point+offset] = 255;
		})
		if (mono) {
			ctx.fillStyle = `rgba(240,170,0,1)`;
		} else {
			ctx.fillStyle = generateRandomColors();
		}		
		textPixels.forEach((textPixel,i) => {			
			const x = Math.floor(i % width) * pixelScale;
			const y = Math.floor(i / width) * pixelScale;						
			ctx.fillRect(x, y, pixelScale, pixelScale);
		})		
	}

	function generateRandomColors(){
    const random = () => {
        const num = Math.floor(Math.random() * (350 - 50) + 50);
        return num > 255 ? 255 : num;           
    } 
      const R = random();
      const G = random();
      const B = random();
      const A = 0.0      
      const color = `rgb(${R}, ${G}, ${B})`;      
      return color;          
  }
}

function draw(permittedWidth, sourceData, ctx, pixelScale) {
// draw	a frame at a given permitted width		
	const length = sourceData.pixelArr.length;		
	const pixelsToDraw = (sourceData.height * permittedWidth)-1;
	
	let counter = 0;

	outer: for (let column = 0; column < sourceData.height; column++) {
						for (let row = 0; row < permittedWidth; row++){
							// which pixel do I select from sourceData based on column and row?
							let pixelIndex = row + (column*permittedWidth)
							if (pixelIndex > pixelsToDraw) break outer;
							let pixel = sourceData.pixelArr[pixelIndex]-10;
							if (pixel > 200) pixel -= 50;
							ctx.fillStyle = `rgba(0,0,0,0)`;
							ctx.fillRect(row*pixelScale, column*pixelScale, pixelScale, pixelScale);			
							ctx.fillStyle = `rgba(${pixel-25},${pixel-25},${pixel+10},1)`;
							ctx.fillRect(row*pixelScale, column*pixelScale, pixelScale, pixelScale-4);
							
							counter++;		
						}
	}

	// use the remaining pixels to "fill in" the empty part of the canvass
	
	let remaining = length - counter;			

	let counter2 = 0;
	for (let column = 0; column < sourceData.height; column++) {
		for (let row = permittedWidth; row < sourceData.width; row++) {
			let pixel = sourceData.pixelArr[length-remaining]/2;		
			ctx.fillStyle = `rgb(${pixel-25},${pixel-25},${pixel},1)`;
			ctx.fillRect(row*pixelScale, column*pixelScale, pixelScale, pixelScale-4);
			remaining--;		
			counter2++;
		}
	}						
}

function getSourceData(sourceName, targetWidth, imageRef) {
	// get the canvas context
	const source_ctx = document.getElementById(sourceName).getContext('2d');	
	const scaleFactor = (imageRef.width / targetWidth);
	const targetHeight = (imageRef.height / scaleFactor);

	// input scaling happens here based on second pair of args
	// this draws the image onto the source canvas, which is hidden using CSS
	source_ctx.drawImage(imageRef, 0, 0, targetWidth, targetHeight);

	// retrieve the pixel data from the source canvas
  const imageData = source_ctx.getImageData(0, 0, targetWidth, targetHeight);  
  // run the functions that reduce the bit depth and convert to grayscale  
  const destroyedImg = destroyImg(imageData);	

  return {
  	pixelArr: destroyedImg,  	
  	width: imageData.width,
  	height: imageData.height,
  	scaleFactor
  }
}

function bitReduce(channel) {
	return parseInt((channel / 255) * 127)*2;
}

function bitReduceChannels(channels) {
	return channels.map(channel => bitReduce(channel));
}

function avgChannels(channels) {
	return parseInt(channels.reduce((acc, channel) => acc += channel, 0) /3);	
}

function destroyImg(imageData) {
	let destroyedImg = [];
	for (let i=0; i < imageData.data.length; i+=4) {
	const channels = bitReduceChannels([
		imageData.data[i],
		imageData.data[i+1],
		imageData.data[i+2]
		]);
		destroyedImg.push(avgChannels(channels));
	}
	return destroyedImg;
}



//====================================================================================
/*
width, pixelScale, canvas element id, input text string, optional array of 3 rgb values
*/

justText(120, 10, 'littleCanvas', 'Patrick Kaipainen   Web Developer,      Pixel enthusiast',[220,190,0]);
//justText(160, 10, 'littleCanvas', 'it me, hello world patrick k;jahdkjlahdfh;iua kjhasekjrhasldkfh');

function justText(width, pixelScale, canvasName, inputText, color) {
	if (color) {
		console.log('color parameter is here, it is', color);
	}
	if (!color) {
		console.log('no color parameter')
	}
	/* each character is defined in a 5x5 grid
	after each write a space of one pixel is added
	so the canvas width should be a multiple of 6
	to avoid any extra space at the edges of the canvas */

	// calculate the closest appropriate width based on the input width
	const remainder = width % 6;
	console.log(remainder);
	if (remainder === 0) {
		width = width - 1;
	} else if (remainder === 5) {
		width = width;
	}	else if (remainder !== 0) {
		width = width - remainder -1
	}	

	// calculate how many rows needed for the given input text
	const horizontalChars = parseInt(width/(6)+1,10);	
	const rows = Math.ceil(inputText.length / horizontalChars);
	// calculate pixel grid height based on input text
	const height = (rows * 5) + (rows - 1);	
	
 	// set up the text layer canvas
	const canvas = document.getElementById(canvasName)
	const ctx = canvas.getContext('2d');	
	ctx.canvas.width = width * pixelScale;
	ctx.canvas.height = height * pixelScale;
	
	// character grid coordinates
	const characterMaps = {
		'0' : [0, 1, 2, 3, 4, width, width+3, width+4, (width*2), (width*2)+2, (width*2)+4, (width*3), (width*3)+1, (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4], 
		'1': [1, 2, width+2, (width*2)+2, (width*3)+2, (width*4)+1, (width*4)+2, (width*4)+3],
		'2': [0, 1, 2, 3, 4, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4], 
		'3': [0, 1, 2, 3, 4, width+4, (width*2)+2, (width*2)+3, (width*2)+4, (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4], 
		'4': [0, 4, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3)+4, (width*4)+4], 
		'5': [0, 1, 2, 3, 4, width, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*3)+3, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3],
		'6': [0, 1, 2, 3, 4, width, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],      
		'7': [0, 1, 2, 3, 4, width+4, (width*2)+4, (width*3)+4, (width*4)+4],
		'8': [0, 1, 2, 3, 4, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],   
		'9': [0, 1, 2, 3, 4, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3)+4, (width*4)+4],
		' ': [],
		'.': [width*4+1],
		',': [width*4+1, (width*5)+1],
		"'": [1, width+1],
		'A' : [2, width+1, width+3, width*2, (width*2)+4, width*3, (width*3)+1, (width*3)+2, (width*3)+3,(width*3)+4, (width*4), (width*4)+4],
		'B' : [0,1,2,3, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*3)+4, width*4, (width*4)+1, (width*4)+2, (width*4)+3],
		'C' : [0, 1, 2, 3, 4, width, (width*2), (width*3), (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'D' : [0, 1, 2, 3, width, width+4, (width*2), (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4)+1, (width*4)+2, (width*4)+3],
		'E' : [0, 1, 2, 3, 4, width, (width*2), (width*2), (width*2)+1, (width*2)+2, (width*3), (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'F' : [0, 1, 2, 3, 4, width, (width*2), (width*2), (width*2)+1, (width*2)+2, (width*3), (width*4), (width*4)],
		'G' : [0, 1, 2, 3, 4, width, (width*2), (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'H' : [0, 4, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4),(width*4)+4],
		'I' : [0, 1, 2, 3, 4, width+2, (width*2)+2, (width*3)+2, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'J' : [width+4, width*3, (width*2)+4, (width*3)+4, (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'K' : [0, 4, width, width+3, (width*2), (width*2)+1, (width*2)+2, (width*3), (width*3)+3, (width*4), (width*4),(width*4)+4],
		'L' : [0, width, (width*2), (width*3), (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'M' : [0, 4, width, width+1, width+3, width+4, (width*2), (width*2)+2, (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4),(width*4)+4],
		'N' : [0, 4, width, width+1, width+4, (width*2), (width*2)+2, (width*2)+4, (width*3), (width*3)+3, (width*3)+4, (width*4), (width*4),(width*4)+4],
		'O' : [0, 1, 2, 3, 4, width, width+4, (width*2), (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'P' : [0,1,2,3, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), width*4],
		'Q' : [0, 1, 2, 3, 4, width, width+4, (width*2), (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4, (width*5)+2, (width*3)+2],
		'R' : [0,1,2,3, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, width*3, (width*3)+3, width*4, (width*4)+4],
		'S' : [0, 1, 2, 3, 4, width, (width*2), (width*2)+4, (width*2)+1, (width*2)+2, (width*2)+3, (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'T' : [0, 1, 2, 3, 4, width+2, (width*2)+2, (width*3)+2, (width*4)+2],
		'U' : [0, 4, width, width+4, (width*2), (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'V' : [0, 4, width, width+4, (width*2), (width*2)+4, (width*3)+1, (width*3)+3, (width*4)+2],
		'W' : [0, 4, width, width+4, (width*2), (width*2)+4, width*3, (width*3)+1, (width*3)+3, (width*3)+4, (width*2)+2, width*4, (width*4)+4],
		'X' : [0, 4, width+1, width+3, (width*2)+2, (width*3)+1, (width*3)+3, (width*2)+2, width*4, (width*4)+4],
		'Y' : [0, 4, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3)+2, (width*4)+2],
		'Z' : [0, 1, 2, 3, 4, width+3, (width*2)+2, (width*3)+1, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
	}

	let textPixels = [];
	let remaining = horizontalChars;	

	writeString(inputText, textPixels);
	draw(width, textPixels, ctx, pixelScale)
	control();

	let currentPermittedWidth = 0;
	function control() {
		let timerId = null;
		let direction = null;
		canvas.onclick = (e) => { 		 		
 		if (timerId !== null) { 			
 			clearInterval(timerId);
 		} 		
 		const seek = Math.round(e.offsetX/pixelScale);
 		if (!e.shiftKey) { 		
	 		if (currentPermittedWidth < seek) {
	 			direction = 1;
	 		} else {
	 			direction = -1
	 		} 		  		
			timerId = setInterval(() => { 			 					
	 			if (currentPermittedWidth === seek) { 				
	 				clearInterval(timerId);	 				
	 			} else {	 				
	 				currentPermittedWidth+=direction;
	 				draw(currentPermittedWidth, textPixels, ctx, pixelScale);
	 			}
	 		},50)
 		} else {
 			currentPermittedWidth = seek;
 			draw(seek, textPixels, ctx, pixelScale);
 		} 		 		
 	}	
	}



	function writeString(inputText, textPixels) {
		let position = 0;
		let char;
		let channels;
		for (let i = 0; i < inputText.length; i++) {
			char = `${inputText[i].toUpperCase()}`;

			if (characterMaps.hasOwnProperty(char)) {
				if (!color) {
					channels = generateRandomColors()
				} else {					
					channels = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
				}						
				writeChar(char, textPixels, position, channels);	
			} else {
				writeChar(" ", textPixels, position);	
			}
			remaining--;
			if (remaining === 0) {				
				remaining = horizontalChars;
				position += (width + +1) * 5;					
			} else {
				position += 6;
			}
		}
	}

function writeChar(char, textPixels, position, color) {	
	characterMaps[char.toUpperCase()].forEach(charPixel => textPixels[charPixel + position] = color);			
}

function draw(permittedWidth, textPixels, ctx, pixelScale) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
// draw	a frame at a given permitted width		
	const length = textPixels.length;		
	const pixelsToDraw = (height * permittedWidth)-1;
	
	let counter = 0;
	outer: for (let column = 0; column < height; column++) {
						for (let row = 0; row < permittedWidth; row++){
							// which pixel do I select from textPixels based on column and row?
							let pixelIndex = row + (column*permittedWidth)
							if (pixelIndex > pixelsToDraw) break outer;
							if (textPixels[pixelIndex] !== undefined) {
								ctx.fillStyle = textPixels[pixelIndex];
								ctx.fillRect(row*pixelScale, column*pixelScale, pixelScale, pixelScale);
								counter++;
							}		
						}
	}

}

	function generateRandomColors(){
    const random = () => {
        const num = Math.floor(Math.random() * (350 - 50) + 50);
        return num > 255 ? 255 : num;           
    } 
      const R = random();
      const G = random();
      const B = random();
      const A = 0.0      
      const color = `rgb(${R}, ${G}, ${B})`;      
      return color;          
  }
}



