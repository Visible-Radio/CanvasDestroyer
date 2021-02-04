IBEW Job Calls Database
I built the front end of my fullstack Job Calls application in React with Chart.js. It displays data relevant to the various classifications of members represented by the union about available jobs, and also serves as an index into the state of the construction sector in the Toronto area. Users can search by date, worker classification and company. Returned results can be filtered further by keywords.

Job Calls API
The API for my Job Calls application started as a Node script that uses Puppeteer to automatically sign into the IBEW Local Union 353 website, parse the DOM and extract information about jobs available to electricians, line workers and communications workers. Each day the script writes the selected HTML elements to a new JSON file. This data is then used to populate a Postgres database. The API returns JSON data after recieving requests at either of two endpoints.

Image Destroyer
When I took CS50 in 2020, I was fascinated by a series of projects related to iterating though information representing image data. My background in photography probably accounts for this fascination. Looping through image data made me feel close to the material of the image itself in a way that was familiar from my days spent in the darkroom and in photoshop.

In one CS50 project, we had to search for jpeg headers in a disk image to recover lost images. In another we implemented a series of filter algorthims which mutated image information pixel by pixel. Doing this in C was exciting due to all the trouble you can get into with pointers or otherwise accessing the wrong area in memory. It felt like being close to the materiality of the machine.

I wanted to try a similar project in Javascript. Image Destroyer reads pixel data from a canvas element, and renders a div element for every pixel. By constraining the divs in a flexible container, they form a grid, and when the width of this flexible container coresponds to the width of the original image, the 'div image' resolves. By manipulating this width, it is possible to scramble the image. The text is rendered in the same grid, by calculating from a string which divs should be assigned a special 'text pixel' class. Obviously this is not the most efficient way of rendering text or images, but I was excited by the visual effect of it.

Canvas Destroyer
What happens when you map pixel data from one source into a new source with a different width? The 'columns' no longer line up properly. If the difference in width is slight, the image is distorted diagonally, though it remains somewhat legible. If the difference in width is great, the image is completely scrambled. Canvas Destroyer is sitting at the top of this page. It is essentially a more performant version of Image Destroyer implemented with canvas elements. Given a source image, it allows the pixels in that image to be drawn into a grid of any width up to the original width of the image.

In thinking about the fact that the new image would only correctly resolve when the width of the new context matched that of the source, I wonded if it would be possible to embed a second image in the array of pixel data which would resolve at a different width. There is a famous 16th century oil painting by Hans Holbein called The Ambassadors. It contains an unsual element - an anamorphic skull. When viewed straight on, this skull is illegible. It looks like a strange, oblique stain accross the painting's surface. When viewed from the correct angle however, the skull can be seen. In the example above an image of a hippo can be seen, over which a strange pattern appears. This pattern is created by the pixels of the second image which resolves at a different width than those of the hippo. Click the yellow button in Canvas Destroyer to check it out!

Implementing this involved a cool exercise in closures. I created a function that given an image, returns an array of functions for every pixel in that image. The purpose of these functions is to determine the the index in an array of pixel data from another image (the hippo) at which point the 'secret' image's pixels should be inserted. In order for this to work the functions close over variables related to the 'secret' image, and at execution time accept other parameters pertaining to the destination hippo image. The resolve point of the 'secret image' isn't hard coded. It can be specified as an argument.

High Voltage Analog
This is the evolution of one of the first things I built with javascript. I love archaic technology and analog electronics. It was a fun exercise in manual DOM manipulation and CSS styling.

Smart Brain
The fullstack final project in the Zero to Mastery Complete Web Developer course.

Ben Eater's SAP-1 8-Bit Breadboard Computer
This is a progammable computer built on breadboards out of rudimentary TTL integrated circuits. It has 16 BYTES of RAM for programs and data.

This was my bridge between an interest in electronics and exposure to programmable logic controllers in the electrical trade on the one hand, and programming on the other. This kit gave me so much insight into how computers work at the hardware level. Building this literally entails defining the bit patterns (ie instructions!!) that the machine responds to.

