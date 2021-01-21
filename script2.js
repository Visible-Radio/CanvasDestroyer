// what about cleaning this mess up?

// globals i'd like to get out of the global space
// let functionArr =[];
// let skullPixels =[];

// 'secret' image to get inserted
const secretImg = new Image()
secretImg.src = './skull.png'

// background image
const bgImg = new Image();
bgImg.src = './rhino.jpg';

(function main() {
	// set up the destination canvas
	const canvas = document.getElementById('destinationCanvas')
	const ctx = canvas.getContext('2d');
	const pixelScale = 4;

	// get the pixel information for the secret image
	const { functionArr, secretPixelArr } = getSecretImageData();	

	// get the pixel information for the background image
	const sourceData = (getSourceData("sourceCanvas", 199, bgImg));
	ctx.canvas.width = sourceData.width * pixelScale;
	ctx.canvas.height = sourceData.height * pixelScale;

	draw(164, sourceData, ctx, pixelScale);
}());





function getSecretImageData() {
secretImg.onload = function() {
  const secretPixels = getSourceData('skullCanvas', 112, secretImg);  
  // create an array of functions
  // each function describes where that pixel should be in a grid given a width
  functionArr = [];
  secretPixels.pixelArr.forEach((pixel, index) => {
  	const row = Math.floor(index/secretPixels.width);
  	const offset = index % secretPixels.width;  	
  	functionArr.push((width) => (width*row + offset));
  });
  skullPixels = secretPixels.pixelArr;
  return {
  	secretPixelArr: secretPixels.pixelArr,
  	functionArr: functionArr,
  }
  });
}


function oldOnLoadFunc() {		

	//==============for inscribing text or another image into the canvas==================
	//==============pass sourceData.pixelArr to a function that will================
	//==============modify it's values and return the modified array======================

	let width = 10; // based on the definition of A below, it will render correctly at this value
	const height = sourceData.height;
	const A = [2, width+1, width+3, width*2, (width*2)+4, width*3, (width*3)+1, (width*3)+2, (width*3)+3,(width*3)+4, (width*4), (width*4)+4];
	A.forEach(point => sourceData.pixelArr[point + height-1]  = 255);
	width = 11;
	const M = [0, 4, width, width+1, width+3, width+4, (width*2), (width*2)+2, (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4),(width*4)+4];
	
	M.forEach(point => sourceData.pixelArr[point + height*2-5]  = 255);
	
	for (let i = 0; i < sourceData.pixelArr.length; i++) {
		sourceData.pixelArr[i] -= 50;		
	}

	for (let i = 0; i < functionArr.length; i+=3) {
		if (skullPixels[i] === 0) continue;
		sourceData.pixelArr[functionArr[i](164)-270] = skullPixels[i]+5;
	}
	
	//====================================================================================

	// for (let frames=1; frames < sourceData.width+1; frames++) {
	// 	setTimeout(draw, frames*100, frames);
	// }
	draw(164);

	let drawIndex = 0;
 	canvas.onmousemove = handleMouseMove;
 		function handleMouseMove(event) {
 			if (event.offsetX % pixelScale === 0) {
 				drawIndex = event.offsetX/4;
 				draw(drawIndex);
 			}
 		}
	
 	//assign functions to keyCodes
	function control(e) {		
		if (e.keyCode === 39) {
			drawIndex++;
			draw(drawIndex);
		} else if (e.keyCode === 37) {
			drawIndex--;
			draw(drawIndex);
			
		}
	}
	document.addEventListener('keydown', control)
	

//==================================================================================================//
// still inside img.onload function here....
//==================================================================================================//
}; // end of old img.onload function....


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
							const pixel = sourceData.pixelArr[pixelIndex]-10;			
							ctx.fillStyle = `rgba(${pixel},${pixel},${pixel},1)`;
							ctx.fillRect(row*pixelScale, column*pixelScale, pixelScale, pixelScale);
							counter++;		
						}
	}

	let remaining = length - counter;			

	let counter2 = 0;
	for (let column = 0; column < sourceData.height; column++) {
		for (let row = permittedWidth; row < sourceData.width; row++) {
			let pixel = sourceData.pixelArr[length-remaining]/4;		
			ctx.fillStyle = `rgb(${pixel},${pixel},${pixel})`;
			ctx.fillRect(row*pixelScale, column*pixelScale, pixelScale, pixelScale);
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
  console.log(imageData);
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




