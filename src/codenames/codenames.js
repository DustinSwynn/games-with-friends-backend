/*
	Class for codenames game
	List of words used taken from: https://github.com/seanlyons/codenames/blob/master/wordlist.txt
*/

const fs = require('fs');

/*
**	Define some values to be used
*/

const word_list_path = 'src/codenames/words_list.txt';

/*
	I can't find a javascript equivalent of memset so hard-coding it is
	Blue  = Blue Agent
	Red   = Red Agent
	Beige = Civilian
	Black = Assassin
*/
const map_arr = [
	'Blue', 'Blue', 'Blue', 'Blue', 'Blue', 'Blue', 'Blue', 'Blue', 'Blue',
	'Red', 'Red', 'Red', 'Red', 'Red', 'Red', 'Red', 'Red',
	'Beige', 'Beige', 'Beige', 'Beige', 'Beige', 'Beige', 'Beige',
	'Black'
]

// To quickly translate from card colour to what the card represents in game
const cardDict = {
	Black: "Assassin",
	Beige: "Civilian",
	Blue: "Blue Agent",
	Red: "Red Agent"
}

// Assign an empty array so I can use it to check if the words have been loaded.
var master_words_list = new Array();

/*
**	Class Definition
*/

// One instance of this object per game
class codenames {
/*
	gameId;
	gameState = new Array(25);
	blueLeft;
	redLeft;
	currTeam;
	hint;
	cardsLeft;
	guessesLeft;
	winner;
*/
	constructor(uid) {

		// Pick 25 words
		var words_cpy = master_words_list.slice();
		shuffle(words_cpy);

		// Shuffle our map
		var map_cpy = map_arr.slice();
		shuffle(map_cpy);

		this.gameState = new Array(25);

		// Copy into gameState
		for(var i =0; i < 25; i++) {
			this.gameState[i] = {
				word: words_cpy[i],
				colour: map_cpy[i],
				chosen: false
			};
		}

		this.gameId = uid;
		this.blueLeft = 9;
		this.redLeft =8;
		this.currTeam = 'Blue';
		this.hint = {word: '', number: -1};
		this.cardsLeft = 25;
		this.guessesLeft = -1;
		this.winner = '';

	}

}

/*
**	Class Methods
*/

// Returns the grid displayed to players as an array of {word: "<word>", colour: "<colour>"}
// The intention of colour is to be directly used as a background-color
codenames.prototype.getGrid = function() {
	
	var retArr = new Array(25);

	for(var i = 0; i < 25; i++) {
		let currCard = this.gameState[i];
		retArr[i] = {
			word: currCard.word,
			colour: (currCard.chosen ? currCard.colour : "None")
		};
	}

	return retArr;

}

// Returns the map as an array of colours
codenames.prototype.getMap = function() {

	var retArr = new Array(25);

	for(var i = 0; i < 25; i++) {
		let currCard = this.gameState[i];
		retArr[i] = {
			type: cardDict[currCard.colour],
			colour: currCard.colour
		};
	}

	return retArr;

}

/*
	Returns the full state of the game as the dict = {
		winner: '' || 'Blue' || 'Red',
		team: "<Team Colour>",
		blueLeft: <blueLeft>,
		redLeft: <blueLeft>,
		phase: "Hinting" || "Guessing",
		hint: {
			word: "<hintWord>",
			number: <hintNum>
		},
		guessesLeft: <guessesLeft>
		grid: 
		map:
	}
*/
codenames.prototype.getGameState = function() {

	var gameInfo = {
		gameId: this.gameId,
		winner: this.winner,
		team: this.currTeam,
		blueLeft: this.blueLeft,
		redLeft: this.redLeft,
		phase: (this.hint.number == -1 ? "Hinting" : "Guessing"),
		hint: this.hint,
		guessesLeft: this.guessesLeft,
		grid: this.getGrid(),
		map: this.getMap()
	};

	return gameInfo;

}

// Make a guess. Accepts the word that is being guessed as a string
codenames.prototype.makeGuess = function(word) {

	if( this.hint.number == -1 ) {
		throw "Error: Expecting a Hint first!"
	}

	// Find the element with property.word == word
	// https://stackoverflow.com/questions/8668174/indexof-method-in-an-object-array
	pos = this.gameState.map(
		function(elem) {
			return elem.word;
		}
	).indexOf(word);

	// Add a check for non-existance

	if( this.gameState[pos].chosen ) {
		throw "Error: Card already chosen!"
	}

	this.gameState[pos].chosen = true;
	this.cardsLeft--;
	this.guessesLeft--;

	switch(this.gameState[pos].colour) {
		
		case 'Blue':
			this.blueLeft--;
			break;
		
		case 'Red':
			this.redLeft--;
			break;

		case 'Black':
			this.winner = (this.currTeam == 'Blue' ? 'Red' : 'Blue');
			break;
		
		default:

	}

	// Check if we need to end the turn from our side
	if( this.gameState[pos].colour != this.currTeam || this.guessesLeft < 1 ) {
		this.endTurn();
	}

	// Check for a victory
	if( this.blueLeft == 0 || this.redLeft == 0 ) {
		this.winner = (this.blueLeft == 0 ? 'Blue' : 'Red');
	}

	return {type: cardDict[this.gameState[pos].colour], colour: this.gameState[pos].colour};

}

// Provide a hint. Accepts the hint as a string, and the number associated with the hint as a astring or int
codenames.prototype.giveHint = function(hintWord, hintNum) {

	if( this.hint.number != -1 ) {
		throw "Error: Hint already provided!"
	}

	var checkRes = this.checkHint(hintWord.toString());

	if( !checkRes || parseInt(hintNum) < 1 ) {
		return false;
	}

	this.hint = {word: hintWord.toString(), number: parseInt(hintNum)};

	this.guessesLeft = this.hint.number + 1;

	return true;

}

// Ends the turn, properly setting member variables
codenames.prototype.endTurn = function() {

	if( this.guessesLeft == this.hint.number + 1 ) {
		return false;
	}

	this.currTeam = (this.currTeam == 'Blue' ? 'Red' : 'Blue');
	this.hint = {word: '', number: -1};
	this.guessesLeft = -1;

	return true;

}

// Checks if the hint provided is one of the words in the game, or is a substring of the words
codenames.prototype.checkHint = function(candidate) {

	for(var i = 0; i < 25; i++) {
		let currWord = this.gameState[i].word;
		if( currWord.toUpperCase().includes(candidate.toUpperCase()) || candidate.toUpperCase().includes(currWord.toUpperCase()) ) {
			return false;
		}
	}

	return true;

}

// Prints the info that would be provided to players to the console
codenames.prototype.report = function() {

	console.log("\n");
	console.log("gameId:");
	console.log(this.gameId);
	console.log("Game Board:")
	console.log(this.getGrid());
	console.log("Agent Map:")
	console.log(this.getMap());

	if( this.winner != '' ) {
		console.log("The", this.winner, "team has won");
		return;
	}

	console.log("It is currently the", this.currTeam, "team's turn");
	console.log("Blue Agents Left:", this.blueLeft);
	console.log("Red Agents Left:", this.redLeft);

	
	if( this.hint.number == -1 ) {

		console.log("Waiting for the", this.currTeam, "team's spymaster to provide a hint")
		return;

	} else {

		console.log("Waiting for the", this.currTeam, "to make a guess");
		console.log("The hint is [" + this.hint.word, ":", this.hint.number + "]");
		console.log("The", this.currTeam, " team has", this.guessesLeft, "guess(es) left");

	}

}

/*
**	Auxiliary Functions
*/

// Read in the words list from a file. Expect one word per line
// Needs to be called before any objects are created
// https://stackabuse.com/read-files-with-node-js/
function readWords() {

	fs.readFile(word_list_path, 'ascii', (err, data) => {
		if( err ) throw err;
		// Regex to find newline on all operating systems
		master_words_list = data.split(/[\r\n]+/);
	})

}

// Shuffles the elements of the array using Knuth Shuffle, directly copied from:
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

/*
**	Export everything needed
*/

module.exports = {
	codenames: codenames
};

module.exports.readWords = readWords;
