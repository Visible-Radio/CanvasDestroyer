(function main() {
  // YAY, this was global but now it's encapsulated!
  let currentPermittedWidth = 0;

  // 'secret' image to get inserted
  const secretImg = new Image();
  secretImg.src = "./skull.png";

  // background image
  const bgImg = new Image();
  bgImg.src = "./rhino_copy.jpg";

  let secretLoaded = false;
  let bgLoaded = false;

  secretImg.addEventListener("load", event => {
    secretLoaded = true;
  });

  bgImg.addEventListener("load", event => {
    bgLoaded = true;
  });

  // make sure both images are loaded
  const loadMonitorTimer = setInterval(() => {
    if (secretLoaded && bgLoaded) {
      clearInterval(loadMonitorTimer);
      backgroundOnload(bgImg, secretImg, currentPermittedWidth);
    }
  }, 100);
})();

function secretOnload(secretImg) {
  // getSourceData draws the skull onto a hidden canvas and returns the raw pixel data
  const secretPixels = getSourceData("skullCanvas", 112, secretImg);
  // create an array of functions
  // each function describes where that pixel should be in a grid given a width
  // width * row + offset gives the index of where that pixel belongs in an image data aray
  functionArr = [];
  secretPixels.pixelArr.forEach((pixel, index) => {
    const row = Math.floor(index / secretPixels.width);
    const offset = index % secretPixels.width;
    functionArr.push(width => width * row + offset);
  });

  return {
    pixelArr: secretPixels.pixelArr,
    functionArr: functionArr,
  };
}

function backgroundOnload(bgImg, secretImg, currentPermittedWidth) {
  // draws the background onto a hidden canvas and returns the raw pixel data
  const sourceData = getSourceData("sourceCanvas", 199, bgImg);

  // set up the destination canvas
  const canvas = document.getElementById("destinationCanvas");
  const ctx = canvas.getContext("2d");
  const pixelScale = 6;
  ctx.canvas.width = sourceData.width * pixelScale;
  ctx.canvas.height = sourceData.height * pixelScale;

  //write the pixel data from the secret image into the background
  applySecretImage(sourceData, 164, secretImg);
  draw(0, sourceData, ctx, pixelScale);
  controls(sourceData, ctx, pixelScale, canvas, currentPermittedWidth);
}

function controls(sourceData, ctx, pixelScale, canvas, currentPermittedWidth) {
  // button controls
  const resolveImage = document.querySelector("#resolveImage");
  const resolveSecret = document.querySelector("#resolveSecret");
  const scrubber = document.querySelector("#scrubber");
  const scrubLeft = document.querySelector("#scrubLeft");
  const container = document.querySelector("#destinationCanvas");
  const infoButton = document.querySelector("#toggleInfo");
  const textHolder = document.getElementById("littleContainer");
  let infoState = 0;

  const setScrubber = () => {
    // need current true width of the canvas element
    const scrubberScale =
      (currentPermittedWidth * pixelScale) / ctx.canvas.width;
    scrubber.style.left = `${scrubberScale * 100}%`;
  };

  function handleMousemove(e) {
    if (timerId !== null) {
      clearInterval(timerId);
    }
    const percentPosition = e.offsetX / canvas.clientWidth;
    const seek = Math.round((percentPosition * ctx.canvas.width) / pixelScale);
    currentPermittedWidth = seek;
    draw(currentPermittedWidth, sourceData, ctx, pixelScale);
    setScrubber();
  }

  let mousedown = false;
  scrubber.onmousedown = e => {
    mousedown = true;
    container.addEventListener("mousemove", mousedown && handleMousemove);
  };
  document.onmouseup = e => {
    mousedown = false;
    container.removeEventListener("mousemove", handleMousemove);
  };

  scrubLeft.onclick = e => {
    if (timerId !== null) {
      clearInterval(timerId);
    }
    if (currentPermittedWidth > 0) {
      currentPermittedWidth--;
      draw(currentPermittedWidth, sourceData, ctx, pixelScale);
      setScrubber();
    }
  };

  scrubRight.onclick = e => {
    if (timerId !== null) {
      clearInterval(timerId);
    }
    if (currentPermittedWidth < canvas.width / pixelScale) {
      currentPermittedWidth++;
      draw(currentPermittedWidth, sourceData, ctx, pixelScale);
      setScrubber();
    }
  };

  // click controls //
  let direction = null;
  let timerId = null;
  container.onclick = e => {
    if (timerId !== null) {
      clearInterval(timerId);
    }

    const percentPosition = e.offsetX / canvas.clientWidth;
    const seek = Math.round((percentPosition * ctx.canvas.width) / pixelScale);

    if (!e.shiftKey) {
      if (currentPermittedWidth < seek) {
        direction = 1;
      } else {
        direction = -1;
      }
      timerId = setInterval(() => {
        if (currentPermittedWidth === seek) {
          clearInterval(timerId);
        } else {
          currentPermittedWidth += direction;
          draw(currentPermittedWidth, sourceData, ctx, pixelScale);
          setScrubber();
        }
      }, 50);
    } else {
      currentPermittedWidth = seek;
      draw(seek, sourceData, ctx, pixelScale);
      setScrubber();
    }
  };

  // keypress controls
  function control(e) {
    if (timerId !== null) {
      clearInterval(timerId);
    }
    // advance to end
    if (e.keyCode === 38) {
      currentPermittedWidth = canvas.width / pixelScale;
      draw(currentPermittedWidth, sourceData, ctx, pixelScale);
      setScrubber();
    }
    // rewind to beginning
    if (e.keyCode === 40) {
      currentPermittedWidth = 0;
      draw(currentPermittedWidth, sourceData, ctx, pixelScale);
      setScrubber();
    }
    //scrub right
    else if (
      currentPermittedWidth < canvas.width / pixelScale &&
      e.keyCode === 39
    ) {
      currentPermittedWidth++;
      draw(currentPermittedWidth, sourceData, ctx, pixelScale);
      setScrubber();
      //scrub left
    } else if (currentPermittedWidth > 0 && e.keyCode === 37) {
      currentPermittedWidth--;
      draw(currentPermittedWidth, sourceData, ctx, pixelScale);
      setScrubber();
    }
  }
  document.addEventListener("keydown", control);

  resolveImage.onclick = e => {
    if (timerId !== null) {
      clearInterval(timerId);
    }
    if (infoState !== 0) {
      resetStory();
    }
    currentPermittedWidth = canvas.width / pixelScale;
    draw(currentPermittedWidth, sourceData, ctx, pixelScale);
    setScrubber();
  };

  resolveSecret.onclick = e => {
    if (timerId !== null) {
      clearInterval(timerId);
    }
    if (infoState !== 0) {
      resetStory();
    }
    currentPermittedWidth = 164;
    draw(currentPermittedWidth, sourceData, ctx, pixelScale);
    setScrubber();
  };

  const infoText = [
    {
      text: "This is canvas destroyer. It pulls image data from two different images and combines it in a single array, which it draws to a canvas element. The images are configured to resolve at different widths.",
      width: 10,
      hidden: false,
    },
    {
      text: "Imagine taking every pixel from an image, and laying it out in a space that is only 1 pixel wide. You'd end up with a narrow 'picture' 1 pixel wide and n pixels long, where n would be the total number of pixels in the image.",
      width: 34,
      hidden: false,
    },
    {
      text: "Canvas destroyer draws the pixel data of an image into a space of any width from 1, to the original width of the image. When the width of the space is the same as the width of the original image, the image resolves corectly.",
      width: 99,
      hidden: false,
    },
    {
      text: "Imagine your pixels are divs in a flex container. If the width of the container shrinks, the divs wrap onto lines below. If the width grows, the divs lay out horizontally.",
      width: 120,
      hidden: false,
    },
    {
      text: "Canvas Destroyer also embeds a second image, which it configures to resolve at a different width.",
      width: 160,
      hidden: false,
    },
    {
      text: "",
      width: 164,
      hidden: true,
    },
    {
      text: "Did you see it?",
      width: 191,
      hidden: false,
    },
    {
      text: "You can click on the image to redraw the pixel data at a new width. Use the pink square to resolve the background, and the yellow square to resolve the 'secret'",
      width: 199,
      hidden: false,
    },
  ];

  infoButton.onclick = async e => {
    infoButton.firstChild.textContent = infoState;
    if (infoState === infoText.length) {
      resetStory();
      return;
    }

    if (currentPermittedWidth > infoText[infoState].width) {
      currentPermittedWidth = infoText[infoState].width - 10;
      draw(currentPermittedWidth, sourceData, ctx, pixelScale);
      setScrubber();
    }

    textHolder.classList.add("hidden");
    await animateToWidth(infoText[infoState].width);
    textHolder.classList.remove("hidden");

    if (infoText[infoState].hidden === true) {
      textHolder.classList.add("hidden");
    }
    justText(240, 10, "littleCanvas", infoText[infoState].text, [220, 190, 0]);
    infoState++;
  };

  function resetStory() {
    if (timerId !== null) {
      clearInterval(timerId);
    }
    infoState = 0;
    infoButton.firstChild.textContent = "i";
    textHolder.classList.remove("hidden");
    justText(
      120,
      10,
      "littleCanvas",
      "Patrick Kaipainen   Web Developer,      Pixel enthusiast",
      [220, 190, 0]
    );
    currentPermittedWidth = 0;
    draw(currentPermittedWidth, sourceData, ctx, pixelScale);
    setScrubber();
  }

  async function animateToWidth(seek) {
    return new Promise((resolve, reject) => {
      if (timerId !== null) {
        clearInterval(timerId);
      }
      if (currentPermittedWidth < seek) {
        direction = 1;
      } else {
        direction = -1;
      }

      timerId = setInterval(() => {
        if (currentPermittedWidth === seek) {
          clearInterval(timerId);
          resolve("done");
        } else {
          currentPermittedWidth += direction;
          draw(currentPermittedWidth, sourceData, ctx, pixelScale);
          setScrubber();
        }
      }, 10);
    });
  }
}

function applySecretImage(sourceData, resolveWidth, secretImg) {
  const secretData = secretOnload(secretImg);
  // reduce brightness of background
  for (let i = 0; i < sourceData.pixelArr.length; i++) {
    sourceData.pixelArr[i] -= 50;
  }
  for (let i = 0; i < functionArr.length; i += 3) {
    // don't apply black pixels
    if (secretData.pixelArr[i] === 0) continue;
    // using the functions in the function array to supply indicies
    // insert the pixels from the secret image into the background image
    sourceData.pixelArr[functionArr[i](resolveWidth) - 270] =
      secretData.pixelArr[i] + 5;
  }
}

function draw(permittedWidth, sourceData, ctx, pixelScale) {
  // draw	a frame at a given permitted width
  const length = sourceData.pixelArr.length;
  const pixelsToDraw = sourceData.height * permittedWidth - 1;

  let counter = 0;

  outer: for (let column = 0; column < sourceData.height; column++) {
    for (let row = 0; row < permittedWidth; row++) {
      // which pixel do I select from sourceData based on column and row?
      let pixelIndex = row + column * permittedWidth;
      if (pixelIndex > pixelsToDraw) break outer;
      let pixel = sourceData.pixelArr[pixelIndex];
      ctx.fillStyle = `rgba(0,0,0,0)`;
      ctx.fillRect(
        row * pixelScale,
        column * pixelScale,
        pixelScale,
        pixelScale
      );
      ctx.fillStyle = `rgba(${pixel - 25},${pixel - 25},${pixel + 10},1)`;
      ctx.fillRect(
        row * pixelScale,
        column * pixelScale,
        pixelScale,
        pixelScale - 3
      );

      counter++;
    }
  }

  // use the remaining pixels to "fill in" the empty part of the canvas
  let remaining = length - counter;

  for (let column = 0; column < sourceData.height; column++) {
    for (let row = permittedWidth; row < sourceData.width; row++) {
      let pixel = sourceData.pixelArr[length - remaining] / 2;
      ctx.fillStyle = `rgb(${pixel - 25},${pixel - 25},${pixel},1)`;
      ctx.fillRect(
        row * pixelScale,
        column * pixelScale,
        pixelScale,
        pixelScale - 3
      );
      remaining--;
    }
  }
}

function getSourceData(sourceName, targetWidth, imageRef) {
  // get the canvas context
  const source_ctx = document.getElementById(sourceName).getContext("2d");
  const scaleFactor = imageRef.width / targetWidth;
  const targetHeight = imageRef.height / scaleFactor;

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
    scaleFactor,
  };
}

function bitReduce(channel) {
  return parseInt((channel / 255) * 127) * 2;
}

function bitReduceChannels(channels) {
  return channels.map(channel => bitReduce(channel));
}

function avgChannels(channels) {
  return parseInt(channels.reduce((acc, channel) => (acc += channel), 0) / 3);
}

function destroyImg(imageData) {
  let destroyedImg = [];
  for (let i = 0; i < imageData.data.length; i += 4) {
    const channels = bitReduceChannels([
      imageData.data[i],
      imageData.data[i + 1],
      imageData.data[i + 2],
    ]);
    destroyedImg.push(avgChannels(channels));
  }
  return destroyedImg;
}

//====================================================================================
/*
width, pixelScale, canvas element id, input text string, optional array of 3 rgb values
*/
justText(
  218,
  3,
  "displayInstructionsCanvas",
  "Shift click to jump, click to seek",
  [190, 0, 90]
);
justText(47, 7, "portfolioCanvas", "Projects");
justText(50, 7, "aboutCanvas", "About Me", [220, 190, 0]);
justText(6 * 9, 7, "stackCanvas", "My Skills");
justText(
  70,
  4,
  "textRendererDemo",
  "Its good its bad its ugly, its a pixel text renderer"
);

justText(
  120,
  10,
  "littleCanvas",
  "Patrick Kaipainen   Web Developer,      Pixel enthusiast",
  [220, 190, 0]
);

function justText(
  width,
  pixelScale,
  canvasName,
  inputText,
  color,
  scramble = false,
  locked = true
) {
  const remainder = width % 6;
  if (remainder === 0) {
    width = width - 1;
  } else if (remainder === 5) {
    width = width;
  } else if (remainder !== 0) {
    width = width - remainder - 1;
  }

  // calculate how many rows needed for the given input text
  const horizontalChars = parseInt(width / 6 + 1, 10);
  const rows = Math.ceil(inputText.length / horizontalChars);
  // calculate pixel grid height based on input text
  const height = rows * 5 + (rows - 1);

  // set up the text layer canvas
  const canvas = document.getElementById(canvasName);
  if (canvas === null) {
    console.log("couldn't get canvas element");
    return;
  }
  const ctx = canvas.getContext("2d");
  ctx.canvas.width = width * pixelScale;
  ctx.canvas.height = height * pixelScale;

  // character grid coordinates
  const characterMaps = {
    0: [
      0,
      1,
      2,
      3,
      4,
      width,
      width + 3,
      width + 4,
      width * 2,
      width * 2 + 2,
      width * 2 + 4,
      width * 3,
      width * 3 + 1,
      width * 3 + 4,
      width * 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
      width * 4 + 4,
    ],
    1: [
      1,
      2,
      width + 2,
      width * 2 + 2,
      width * 3 + 2,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
    ],
    2: [
      0,
      1,
      2,
      3,
      4,
      width + 4,
      width * 2,
      width * 2 + 1,
      width * 2 + 2,
      width * 2 + 3,
      width * 2 + 4,
      width * 3,
      width * 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
      width * 4 + 4,
    ],
    3: [
      0,
      1,
      2,
      3,
      4,
      width + 4,
      width * 2 + 2,
      width * 2 + 3,
      width * 2 + 4,
      width * 3 + 4,
      width * 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
      width * 4 + 4,
    ],
    4: [
      0,
      4,
      width,
      width + 4,
      width * 2,
      width * 2 + 1,
      width * 2 + 2,
      width * 2 + 3,
      width * 2 + 4,
      width * 3 + 4,
      width * 4 + 4,
    ],
    5: [
      0,
      1,
      2,
      3,
      4,
      width,
      width * 2,
      width * 2 + 1,
      width * 2 + 2,
      width * 2 + 3,
      width * 3 + 3,
      width * 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
    ],
    6: [
      0,
      1,
      2,
      3,
      4,
      width,
      width * 2,
      width * 2 + 1,
      width * 2 + 2,
      width * 2 + 3,
      width * 2 + 4,
      width * 3,
      width * 3 + 4,
      width * 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
      width * 4 + 4,
    ],
    7: [0, 1, 2, 3, 4, width + 4, width * 2 + 4, width * 3 + 4, width * 4 + 4],
    8: [
      0,
      1,
      2,
      3,
      4,
      width,
      width + 4,
      width * 2,
      width * 2 + 1,
      width * 2 + 2,
      width * 2 + 3,
      width * 2 + 4,
      width * 3,
      width * 3 + 4,
      width * 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
      width * 4 + 4,
    ],
    9: [
      0,
      1,
      2,
      3,
      4,
      width,
      width + 4,
      width * 2,
      width * 2 + 1,
      width * 2 + 2,
      width * 2 + 3,
      width * 2 + 4,
      width * 3 + 4,
      width * 4 + 4,
    ],
    " ": [],
    ".": [width * 4 + 1],
    ",": [width * 4 + 1, width * 5 + 1],
    "'": [1, width + 1],
    "?": [
      1,
      2,
      3,
      width,
      width + 4,
      width * 2 + 3,
      width * 3 + 2,
      width * 4 + 2,
    ],
    A: [
      2,
      width + 1,
      width + 3,
      width * 2,
      width * 2 + 4,
      width * 3,
      width * 3 + 1,
      width * 3 + 2,
      width * 3 + 3,
      width * 3 + 4,
      width * 4,
      width * 4 + 4,
    ],
    B: [
      0,
      1,
      2,
      3,
      width,
      width + 4,
      width * 2,
      width * 2 + 1,
      width * 2 + 2,
      width * 2 + 3,
      width * 2 + 4,
      width * 3,
      width * 3 + 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
    ],
    C: [
      0,
      1,
      2,
      3,
      4,
      width,
      width * 2,
      width * 3,
      width * 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
      width * 4 + 4,
    ],
    D: [
      0,
      1,
      2,
      3,
      width,
      width + 4,
      width * 2,
      width * 2 + 4,
      width * 3,
      width * 3 + 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
    ],
    E: [
      0,
      1,
      2,
      3,
      4,
      width,
      width * 2,
      width * 2,
      width * 2 + 1,
      width * 2 + 2,
      width * 3,
      width * 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
      width * 4 + 4,
    ],
    F: [
      0,
      1,
      2,
      3,
      4,
      width,
      width * 2,
      width * 2,
      width * 2 + 1,
      width * 2 + 2,
      width * 3,
      width * 4,
      width * 4,
    ],
    G: [
      0,
      1,
      2,
      3,
      4,
      width,
      width * 2,
      width * 2 + 2,
      width * 2 + 3,
      width * 2 + 4,
      width * 3,
      width * 3 + 4,
      width * 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
      width * 4 + 4,
    ],
    H: [
      0,
      4,
      width,
      width + 4,
      width * 2,
      width * 2 + 1,
      width * 2 + 2,
      width * 2 + 3,
      width * 2 + 4,
      width * 3,
      width * 3 + 4,
      width * 4,
      width * 4,
      width * 4 + 4,
    ],
    I: [
      0,
      1,
      2,
      3,
      4,
      width + 2,
      width * 2 + 2,
      width * 3 + 2,
      width * 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
      width * 4 + 4,
    ],
    J: [
      width + 4,
      width * 3,
      width * 2 + 4,
      width * 3 + 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
      width * 4 + 4,
    ],
    K: [
      0,
      4,
      width,
      width + 3,
      width * 2,
      width * 2 + 1,
      width * 2 + 2,
      width * 3,
      width * 3 + 3,
      width * 4,
      width * 4,
      width * 4 + 4,
    ],
    L: [
      0,
      width,
      width * 2,
      width * 3,
      width * 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
      width * 4 + 4,
    ],
    M: [
      0,
      4,
      width,
      width + 1,
      width + 3,
      width + 4,
      width * 2,
      width * 2 + 2,
      width * 2 + 4,
      width * 3,
      width * 3 + 4,
      width * 4,
      width * 4,
      width * 4 + 4,
    ],
    N: [
      0,
      4,
      width,
      width + 1,
      width + 4,
      width * 2,
      width * 2 + 2,
      width * 2 + 4,
      width * 3,
      width * 3 + 3,
      width * 3 + 4,
      width * 4,
      width * 4,
      width * 4 + 4,
    ],
    O: [
      0,
      1,
      2,
      3,
      4,
      width,
      width + 4,
      width * 2,
      width * 2 + 4,
      width * 3,
      width * 3 + 4,
      width * 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
      width * 4 + 4,
    ],
    P: [
      0,
      1,
      2,
      3,
      width,
      width + 4,
      width * 2,
      width * 2 + 1,
      width * 2 + 2,
      width * 2 + 3,
      width * 2 + 4,
      width * 3,
      width * 4,
    ],
    Q: [
      0,
      1,
      2,
      3,
      4,
      width,
      width + 4,
      width * 2,
      width * 2 + 4,
      width * 3,
      width * 3 + 4,
      width * 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
      width * 4 + 4,
      width * 5 + 2,
      width * 3 + 2,
    ],
    R: [
      0,
      1,
      2,
      3,
      width,
      width + 4,
      width * 2,
      width * 2 + 1,
      width * 2 + 2,
      width * 2 + 3,
      width * 2 + 4,
      width * 3,
      width * 3 + 3,
      width * 4,
      width * 4 + 4,
    ],
    S: [
      0,
      1,
      2,
      3,
      4,
      width,
      width * 2,
      width * 2 + 4,
      width * 2 + 1,
      width * 2 + 2,
      width * 2 + 3,
      width * 3 + 4,
      width * 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
      width * 4 + 4,
    ],
    T: [0, 1, 2, 3, 4, width + 2, width * 2 + 2, width * 3 + 2, width * 4 + 2],
    U: [
      0,
      4,
      width,
      width + 4,
      width * 2,
      width * 2 + 4,
      width * 3,
      width * 3 + 4,
      width * 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
      width * 4 + 4,
    ],
    V: [
      0,
      4,
      width,
      width + 4,
      width * 2,
      width * 2 + 4,
      width * 3 + 1,
      width * 3 + 3,
      width * 4 + 2,
    ],
    W: [
      0,
      4,
      width,
      width + 4,
      width * 2,
      width * 2 + 4,
      width * 3,
      width * 3 + 1,
      width * 3 + 3,
      width * 3 + 4,
      width * 2 + 2,
      width * 4,
      width * 4 + 4,
    ],
    X: [
      0,
      4,
      width + 1,
      width + 3,
      width * 2 + 2,
      width * 3 + 1,
      width * 3 + 3,
      width * 2 + 2,
      width * 4,
      width * 4 + 4,
    ],
    Y: [
      0,
      4,
      width,
      width + 4,
      width * 2,
      width * 2 + 1,
      width * 2 + 2,
      width * 2 + 3,
      width * 2 + 4,
      width * 3 + 2,
      width * 4 + 2,
    ],
    Z: [
      0,
      1,
      2,
      3,
      4,
      width + 3,
      width * 2 + 2,
      width * 3 + 1,
      width * 4,
      width * 4,
      width * 4 + 1,
      width * 4 + 2,
      width * 4 + 3,
      width * 4 + 4,
    ],
  };

  let textPixels = [];
  let remaining = horizontalChars;

  writeString(inputText, textPixels);
  if (scramble) width -= 6;
  draw(width, textPixels, ctx, pixelScale);
  if (!locked) {
    control();
  }

  let currentPermittedWidth = 0;
  function control() {
    let timerId = null;
    let direction = null;
    canvas.onclick = e => {
      if (timerId !== null) {
        clearInterval(timerId);
      }
      const seek = Math.round(e.offsetX / pixelScale);
      if (!e.shiftKey) {
        if (currentPermittedWidth < seek) {
          direction = 1;
        } else {
          direction = -1;
        }
        timerId = setInterval(() => {
          if (currentPermittedWidth === seek) {
            clearInterval(timerId);
          } else {
            currentPermittedWidth += direction;
            draw(currentPermittedWidth, textPixels, ctx, pixelScale);
          }
        }, 50);
      } else {
        currentPermittedWidth = seek;
        draw(seek, textPixels, ctx, pixelScale);
      }
    };
  }

  function writeString(inputText, textPixels) {
    let position = 0;
    let char;
    let channels;
    for (let i = 0; i < inputText.length; i++) {
      char = `${inputText[i].toUpperCase()}`;

      if (characterMaps.hasOwnProperty(char)) {
        if (!color) {
          channels = generateRandomColors();
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
    characterMaps[char.toUpperCase()].forEach(
      charPixel => (textPixels[charPixel + position] = color)
    );
  }

  function draw(permittedWidth, textPixels, ctx, pixelScale) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw	a frame at a given permitted width
    const length = textPixels.length;
    const pixelsToDraw = height * permittedWidth - 1;

    let counter = 0;
    outer: for (let column = 0; column < height; column++) {
      for (let row = 0; row < permittedWidth; row++) {
        // which pixel do I select from textPixels based on column and row?
        let pixelIndex = row + column * permittedWidth;
        if (pixelIndex > pixelsToDraw) break outer;
        if (textPixels[pixelIndex] !== undefined) {
          ctx.fillStyle = textPixels[pixelIndex];
          ctx.fillRect(
            row * pixelScale,
            column * pixelScale,
            pixelScale,
            pixelScale
          );
          counter++;
        }
      }
    }
  }

  function generateRandomColors() {
    const random = () => {
      const num = Math.floor(Math.random() * (350 - 50) + 50);
      return num > 255 ? 255 : num;
    };
    const R = random();
    const G = random();
    const B = random();
    const A = 0.0;
    const color = `rgb(${R}, ${G}, ${B})`;
    return color;
  }
}
