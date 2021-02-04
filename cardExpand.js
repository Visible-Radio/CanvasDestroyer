const cards = document.querySelectorAll('.projectCard');
const blank = document.querySelector('.blankCard');
const portfolio = document.querySelector('#portfolio');
cards.forEach(card => card.addEventListener('click', handleCardClick));

let openCard=null;
function handleCardClick(e) {
	if (openCard !== this && openCard !== null) {
		openCard.addEventListener('click', handleCardClick);
	}
	// find any previously hidden cards and make them visible again
	const hiddens = document.querySelectorAll('.clicked');
	hiddens.forEach(hidden => hidden.classList.toggle('clicked'));

	// disable clicking on the hidden card
	this.removeEventListener('click', handleCardClick);

	// remove any previous clones
	const clones = document.querySelectorAll('.clone');
	clones.forEach(clone => clone.remove());

	// deep clone the clicked card
	const cardClone = this.cloneNode(true);

	// hide the original card
	this.classList.toggle('clicked');	

	// get the position of the CARD relative to viewport
	// console.log('card to top of viewport:', this.getBoundingClientRect().top);
	// get the position of the GALLERY relative to viewport
	// console.log('portfolio height:', portfolio.getBoundingClientRect().height);
	// get the position of the CARD relative to the GALLERY
	// console.log('card to top of portfolio: ', this.offsetTop);

	// convert card position to percentage
	const portfolioHeight = portfolio.getBoundingClientRect().height;
	const cardPosition = this.offsetTop;
	const percentPosition = Math.floor(cardPosition/portfolioHeight*100);
	// console.log('percentPosition', percentPosition);

	//	set position of expanded card
	cardClone.style.top = `${percentPosition + 4}%`;

	// pop the clone out of document flow
	cardClone.classList.add('absolute');	

	// assign a clone class for cleanup later
	cardClone.classList.add('clone');		

	// insert the clone into the gallery
	portfolio.appendChild(cardClone);

	// add the expand class to transition the card's width
	setTimeout(() => cardClone.classList.add('expanded'),0);

	openCard = this;

	// add event listener to clone to close it
	cardClone.addEventListener('click', () => {
		this.classList.toggle('clicked');		
		this.addEventListener('click', handleCardClick);
		// remove the clone
		cardClone.remove();
	});
}