  
// sweet, got this working with a canvas
// now maybe make it interactive! allow the user to scrub over the image
// to control the permitted rendering width
// ok did that
// what about text that renders correctly when the rest of the image is scrambled???
// shit, what about a SKULL like in Holbein's Ambasadors!?

// we'd need another source canvas
// ok...sweet, did that too
// what about advancing or reversing one 'frame' at a time with the arrow keys
// what about advancing automatically to the next hidden image?
let functionArr =[];
let skullPixels =[];
const skull = new Image()
skull.src = './skull.png'
skull.onload = function() {
	// get the canvas context
	const skull_ctx = document.getElementById('skullCanvas').getContext('2d');
	const targetWidth = 164;
	const scaleFactor = Math.round(img.width / targetWidth);
	const targetHeight = Math.round(img.height / scaleFactor);

	// input scaling happens here based on second pair of args
	// this draws the image onto the source canvas, which is hidden using CSS
	skull_ctx.drawImage(skull, 0, 0, targetWidth, targetHeight);

	// retrieve the pixel data from the source canvas
  const imageData = skull_ctx.getImageData(0, 0, targetWidth, targetHeight);
  const destroyedSkull = destroyImg(imageData);	
  console.log(imageData);
  console.log(destroyedSkull);
  expressionArray = [];
  destroyedSkull.forEach((pixel, index) => {
  	const row = Math.floor(index/targetWidth);
  	const offset = index % targetWidth;
  	// function storeMe(width) {
  	// 	return (width * row) + offset;
  	// }
  	expressionArray.push((width) => (width*row + offset));
  });
  skullPixels = destroyedSkull;
  functionArr = expressionArray;  
}
// we're going to make an array like the ones used to describe the alphabet in terms of
// (width*n + y)
// soooooo sweet!
// for each index in the array of pixels describing the skull that we get from
// skull_ctx.getImageData, we create a new element in a a new array
// row = math.floor(index/width)
// (row * width) + (index % width)
// the array will literally contain expressions



const img = new Image();
img.src = './rhino.jpg';

img.onload = function() {
	// setup
	const sourceData = (getSourceData());
	const canvas = document.getElementById('destinationCanvas')
	const ctx = canvas.getContext('2d');
	const pixelScale = 4;
	ctx.canvas.width = sourceData.width * pixelScale;
	ctx.canvas.height = sourceData.height * pixelScale;	
	console.log(sourceData);	

	//==============for inscribing text or another image into the canvas==================
	//==============pass sourceData.destroyedImage to a function that will================
	//==============modify it's values and return the modified array======================

	let width = 10; // based on the definition of A below, it will render correctly at this value
	const height = sourceData.height;
	const A = [2, width+1, width+3, width*2, (width*2)+4, width*3, (width*3)+1, (width*3)+2, (width*3)+3,(width*3)+4, (width*4), (width*4)+4];
	A.forEach(point => sourceData.destroyedImage[point + height-1]  = 255);
	width = 11;
	const M = [0, 4, width, width+1, width+3, width+4, (width*2), (width*2)+2, (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4),(width*4)+4];
	
	M.forEach(point => sourceData.destroyedImage[point + height*2-5]  = 255);
	
	for (let i = 0; i < sourceData.destroyedImage.length; i++) {
		sourceData.destroyedImage[i] -= 50;		
	}

	for (let i = 0; i < functionArr.length; i+=3) {
		if (skullPixels[i] === 0) continue;
		sourceData.destroyedImage[functionArr[i](164)+1980] = skullPixels[i]+5;
	}
	
	//====================================================================================

	// for (let frames=1; frames < sourceData.width+1; frames++) {
	// 	setTimeout(draw, frames*100, frames);
	// }
	draw(164);


 	canvas.onmousemove = handleMouseMove;
 		function handleMouseMove(event) {
 			if (event.offsetX % pixelScale === 0) {
 				draw(event.offsetX/4);
 			}
 		}

	let drawIndex = 0;
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
	
	function draw(permittedWidth) {
	// draw	a frame at a given permitted width
			
			const length = sourceData.destroyedImage.length;		
			const pixelsToDraw = (sourceData.height * permittedWidth)-1;
			
			let counter = 0;

			outer: for (let column = 0; column < sourceData.height; column++) {
								for (let row = 0; row < permittedWidth; row++){
									// which pixel do I select from sourceData based on column and row?
									let pixelIndex = row + (column*permittedWidth)
									if (pixelIndex > pixelsToDraw) break outer;
									const pixel = sourceData.destroyedImage[pixelIndex]-10;			
									ctx.fillStyle = `rgba(${pixel},${pixel},${pixel},1)`;
									ctx.fillRect(row*pixelScale, column*pixelScale, pixelScale, pixelScale);
									counter++;		
								}
			}

		let remaining = length - counter;			

		let counter2 = 0;
		for (let column = 0; column < sourceData.height; column++) {
			for (let row = permittedWidth; row < sourceData.width; row++) {
				let pixel = sourceData.destroyedImage[length-remaining]/4;		
				ctx.fillStyle = `rgb(${pixel},${pixel},${pixel})`;
				ctx.fillRect(row*pixelScale, column*pixelScale, pixelScale, pixelScale);
				remaining--;		
				counter2++;
			}
		}						
	}

};

function getSourceData() {
	// get the canvas context
	const source_ctx = document.getElementById('sourceCanvas').getContext('2d');
	const targetWidth = 199;
	const scaleFactor = (img.width / targetWidth);
	const targetHeight = (img.height / scaleFactor);

	// input scaling happens here based on second pair of args
	// this draws the image onto the source canvas, which is hidden using CSS
	source_ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

	// retrieve the pixel data from the source canvas
  const imageData = source_ctx.getImageData(0, 0, targetWidth, targetHeight);
  
  // run the functions that reduce the bit depth and convert to grayscale  
  const destroyedImg = destroyImg(imageData);	

  return {
  	destroyedImage: destroyedImg,  	
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




