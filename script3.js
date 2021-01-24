	// // here's a global I'm not sure how to get out of global
	// let currentPermittedWidth = 0;

	// // 'secret' image to get inserted
	// const secretImg = new Image()
	// secretImg.src = './skull.png'

	// // background image
	// const bgImg = new Image();
	// bgImg.src = './rhino.jpg';


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
	const pixelScale = 4;
	ctx.canvas.width = sourceData.width * pixelScale;
	ctx.canvas.height = sourceData.height * pixelScale;
	applySecretImage(sourceData, 164, secretImg);
	applySecretText(sourceData);

	draw(0, sourceData, ctx, pixelScale);
	controls(sourceData, ctx, pixelScale, canvas, currentPermittedWidth);		
}

function controls(sourceData, ctx, pixelScale, canvas, currentPermittedWidth){	
	let direction = null;
	let timerId = null;
 	canvas.onclick = (e) => {
 		if (timerId !== null) { 			
 			clearInterval(timerId);
 		} 		
 		const seek = Math.round(e.offsetX/pixelScale); 		
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
 	}	
 	//assign functions to keyCodes
	function control(e) {
		if (timerId !== null) { 			
 			clearInterval(timerId);
 		}
		//scrub right		
		if (currentPermittedWidth < canvas.width/pixelScale && e.keyCode === 39) {			
			currentPermittedWidth++;
			draw(currentPermittedWidth, sourceData, ctx, pixelScale);
		//scrub left
		} else if (currentPermittedWidth > 0 && e.keyCode === 37) {
			currentPermittedWidth--;
			draw(currentPermittedWidth, sourceData, ctx, pixelScale);			
		}
	}
	document.addEventListener('keydown', control)
}

function applySecretImage(sourceData, resolveWidth, secretImg) {
	const secretData = secretOnload(secretImg);
	console.log(secretData);
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

function applySecretText(sourceData) {	
	applyChar('A', 5, 0);  // row 1, char 1
	applyChar('B', 5, 40); // row 2, char 1
	applyChar('C', 5, 80); // row 3, char 1

	function applyChar(char, resolveWidth, positionOffset){
		const width = resolveWidth;			
	
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
		

		characterMaps[char].forEach(point => sourceData.pixelArr[point+positionOffset] = 255);	
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




