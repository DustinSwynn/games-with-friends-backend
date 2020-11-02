/*
	Class for codenames game
	List of words used taken from: https://github.com/seanlyons/codenames/blob/master/wordlist.txt
*/

const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

/*
**	Define some values to be used
*/

const word_list_path = 'codenames/words_list.txt';

// Assign an empty array so I can use it to check if the words have been loaded.
master_words_list = new Array();

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

/*
**	Class Definition
*/

// One instance of this object per game
class codenames {

	gameState = new Array(25);
	blueLeft;
	redLeft;
	teamTurn;
	hint;
	cardsLeft;

	constructor() {
		
		// Pick 25 words
		var words_cpy = master_words_list.slice();
		shuffle(words_cpy);

		// Shuffle our map
		var map_cpy = map_arr.slice();
		shuffle(map_cpy);

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

	return {team: this.teamTurn, phase: (this.hint.number == -1 ? "Hinting" : "Guessing")}

}

// Make a guess. Accepts the word that is being guessed as a string
codenames.prototype.makeGuess = function(word) {

	if( thhis.hint.number == -1 ) {
		throw "Error: Expecting a Hint first!"
	}

	// Find the element with property.word == word
	// https://stackoverflow.com/questions/8668174/indexof-method-in-an-object-array
	pos = this.gameState.map(
		function(elem) {
			return elem.word;
		}
	).indexOf(word);

	if( this.gameState[pos].chosen ) {
		throw "Error: Card already chosen!"
	}

	this.gameState[pos].chosen == true;

	if( this.gameState[pos].colour == 'Blue' ) {
		this.blueLeft--;
	}
	
	if( this.gameState[pos].colour == 'Red' ) {
		this.redLeft--;
	}

	if( this.gameState[pos].colour != this.teamTurn ) {
		this.teamTurn = (this.teamTurn == 'Blue' ? 'Red' : 'Blue');
		this.hint = {word: '', number: -1};
	}

	this.cardsLeft--;

	return this.gameState[pos].colour;

}

// Provide a hint. Accepts the hint as a string, and the number associated with the hint as a astring or int
codenames.prototype.giveHint = function(hintWord, hintNum) {

	if( this.hint.number != -1 ) {
		throw "Error: Hint already provided!"
	}

	this.hint = {word: hintWord.toString(), number: pareseInt(hintNumber)};

	//return

}

/*
**	Auxiliary Functions
*/

// Read in the words list from a file. Expect one word per line
// Needs to be called before any objects are created
// https://stackabuse.com/read-files-with-node-js/
readWords = function() {

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
**	Testing Code - To be removed once the class is finished
*/

// To get around the async readWords()
function main() {

	if( master_words_list.length == 0 ) {
		throw "Word list has not be read in yet!"
	}

	var game = new codenames();

	console.log("Object created");

	console.log(game);
	
	while( true ) {

		console.log(game.getGrid());

		var turnState = game.getTurn();

		console.log("It is currently the", turnState.team + "'s turn right now");

		if( turnState.phase == 'Hinting' ) {
			console.log("Waiting for the ", turnState.team + "'s spymaster to give a hint:");

			console.log(game.getMap());

			var hintWord;
			var hintNum;

			rl.question("Please enter the hint word: ", (word) => {
				hintWord = word;
				rl.close();
			});

			rl.question("Please enter the hint number: ", (number) => {
				hintNum = number;
				rl.close();
			})

			setTimeout(game.giveHint(hintWord, hintNum), 5000);

		} else {
			console.log("Waiting for the ", turnState.team, "to make a guess");
			console.log("The hint is:", game.hint.word, ":", game.hint.number);

			console.log("Guess a word (Must be a perfect match of what the game has):");
			
			var guessWord;

			rl.question("Please make a guess (The word must be a perfect match of what the game has): ", (guess) => {
				guessWord = guess;
				rl.close();
			});

			setTimeout(game.nameGuess(guessWord), 5000);

		}

	}

}

readWords();

try {
	setTimeout(main, 1000);	
} catch(err) {
	console.log("Failed to complete main() with error:");
	console.log(err);
}


