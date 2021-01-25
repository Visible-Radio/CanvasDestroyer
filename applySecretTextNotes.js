	// currentPermittedWidth = row width
	// row width * char grid height = the offset to bump a char down one row
	// chars are plotted on a 5x5 grid

	// nth row offset
	// nth row offset = currentPermittedWidth * 6 * desired row / column index + 1
	// this is for column position 0
	// nth column = desired column * 6 ???
	// postion = row offset + column offset 

	applyChar('A', 5, 0);  // 
	applyChar('B', 5, 30); // 
	applyChar('C', 5, 60); // 
	applyChar('D', 5, 90); //
	
	applyChar('A', 11, 132);  
	applyChar('B', 11, 132+6); 
	applyChar('C', 11, 198);
	applyChar('D', 11, 198+6); 

	applyChar('A', 17, 272);  
	applyChar('B', 17, 272+6); 
	applyChar('C', 17, 272+12);
	applyChar('D', 17, 374);

	// row = 21 currentPermittedWidth = 23
	// rowStart = currentPermittedWidth
	applyChar('A', 23, 483);  
	applyChar('B', 23, 483+6); 
	applyChar('C', 23, 483+12);
	applyChar('D', 23, 483+18);


	const alphabet = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
	console.log(alphabet);
	const resolvePoints = alphabet.map((letter, index) => {
		return ((index+1)*6)-1;
	})
	console.log('resolvePoints:', resolvePoints);

	const rowHeads = [0];
	let rowHead = 4	
	for (let i = 1; i < resolvePoints.length; i++) {
		rowHeads.push(rowHead*resolvePoints[i]);
		rowHead+=3;
	}
	console.log('rowHeads:', rowHeads);

	resolvePoints.forEach((point, index) => {
		// how many chars at this resolve point?
		// index + 1
			for (let i = 0; i < index+1; i++) {
				if (i < 25 && index % 5 === 0)	{
					
					applyChar(alphabet[i], point, rowHeads[index]+(6*i));
					

				}
				
			}

	});