/*
	Class for codenames game
	List of words used taken from: https://github.com/seanlyons/codenames/blob/master/wordlist.txt
*/

const { query } = require('express');
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

const cardDict = {
	Black: "Assassin",
	Beige: "Civilian",
	Blue: "Blue Agent",
	Red: "Red Agent"
}

// Assign an empty array so I can use it to check if the words have been loaded.
var master_words_list = new Array();

var game = null;

/*
**	Class Definition
*/

// One instance of this object per game
class codenames {
/*
	gameState = new Array(25);
	blueLeft;
	redLeft;
	teamTurn;
	hint;
	cardsLeft;
	guessesLeft;
	winner;
*/
	constructor() {
		
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

		this.blueLeft = 9;
		this.redLeft =8;
		this.teamTurn = 'Blue';
		this.hint = {word: '', number: -1};
		this.cardsLeft = 25;
		this.guessesLeft = 0;
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
		retArr[i] = {
			word: this.gameState[i].word,
			colour: (this.gameState[i].chosen ? this.gameState[i].colour : "None")
		};
	}

	return retArr;

}

// Returns the map as an array of colours
codenames.prototype.getMap = function() {

	var retArr = new Array(25);

	for(var i = 0; i < 25; i++) {
		retArr[i] = this.gameState[i].colour;
	}

	return retArr;

}

// Gets the current turn as a dict: {team: "<Team Colour>", phase: "Hinting" || "Guessing"}
codenames.prototype.getTurn = function() {

	return {team: this.teamTurn, phase: (this.hint.number == -1 ? "Hinting" : "Guessing"), guessesLeft: this.guessesLeft};

}

// Returns the hint object
codenames.prototype.getHint = function() {

	return this.hint;

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
			this.winner = (this.teamTurn == 'Blue' ? 'Red' : 'Blue');
			break;
		
		default:

	}

	// Check if we need to end the turn from our side
	if( this.gameState[pos].colour != this.teamTurn || this.guessesLeft < 1 ) {
		this.endTurn();
	}

	// Check for a victory
	if( this.blueLeft == 0 || this.redLeft == 0 ) {
		this.winner = (this.blueLeft == 0 ? 'Blue' : 'Red');
	}

	return this.gameState[pos].colour;

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

// Prematurely end the turn
codenames.prototype.endTurn = function() {

	if( this.guessesLeft == this.hint.number + 1 ) {
		return false;
	}

	this.teamTurn = (this.teamTurn == 'Blue' ? 'Red' : 'Blue');
	this.hint = {word: '', number: -1};
	this.guessesLeft = 0;

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

// Prints the info that would be providede to players to the console
// Not to be used in outside of testing and debugging
codenames.prototype.report = function() {

	var turnState = game.getTurn();

	console.log("\n\n");
	console.log("Game Board:")
	console.log(game.getGrid());
	console.log("Agent Map:")
	console.log(game.getMap());

	if( game.winner != '' ) {
		console.log("The", game.winner, "team has won");
		return;
	}

	console.log("It is currently the", turnState.team, "team's turn");
	console.log("Blue Agents Left:", game.blueLeft);
	console.log("Red Agents Left:", game.redLeft);

	
	if( turnState.phase == 'Hinting' ) {

		console.log("Waiting for the ", turnState.team + "'s spymaster to provide a hint")
		return;

	} else {

		var hintDict = game.getHint();
		console.log("Waiting for the", turnState.team, "to make a guess");
		console.log("The hint is [" + hintDict.word, ":", hintDict.number + "]");
		console.log("The", turnState.team, "has", turnState.guessesLeft, "guesses left");

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

/*
**	Testing code - To be removed
*/

module.exports.runGame = function(queryObj) {

	// Log the full game object for debugging purposes
	console.log("\n\n");
	console.log("Before input");
	console.log(game);
	console.log("\n\n");

	if( queryObj.start || game == null ) {

		game = new codenames();
		console.log("Starting a new game");
		console.log(game);
		console.log("\n\n");
		game.report();
		return;

	}
	
	if( game.winner != '' ) {

		console.log(game.winner, "has already won the game. Please start a new game");
		return;

	}

	var turnState = game.getTurn();

	if( queryObj.endTurn ) {

		var turnEnded = game.endTurn();

		if( !turnEnded ) {
			console.log("Error: You must make at least one guess before ending your turn!");
		} else {
			console.log("Successfully ended turn early");
		}

	} else if( queryObj.guessWord && turnState.phase == 'Guessing' ) {

		console.log("Attempting to guess the card '" + queryObj.guessWord + "'");
		var cardColour = game.makeGuess(queryObj.guessWord);
		console.log("Guessed '" + queryObj.guessWord + "', which turned out to be a", cardDict[cardColour]);

	} else if( queryObj.hintWord && queryObj.hintNum && turnState.phase == 'Hinting' ) {

		console.log("Attempting to provide the hint [" + queryObj.hintWord, ":", queryObj.hintNum + "]");
		var hintValid = game.giveHint(queryObj.hintWord, queryObj.hintNum);

		if( !hintValid ) {
			console.log("Error: The hint [" + queryObj.hintWord, ":", queryObj.hintNum + "] is not legal!");
		} else {
			console.log("Hint [" + queryObj.hintWord, ":", queryObj.hintNum + "] was accepted");
		}

	} else {
		console.log("Was not given a valid set of inputs based on current game state");
	}

	// Report the game state
	game.report();

}
