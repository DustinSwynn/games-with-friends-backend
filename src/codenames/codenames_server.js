/*
**	Example server-side logic
**	Primarily for testing, likely to be removed
*/

const codenames = require('./codenames');

const gameIdLength = 10;
const characterPool = 'abcdefghijklmnopqrstuvwxyz0123456789';

var activeGames = {};

// Runs the game. Provide the function the query objects
module.exports.runGame = function(queryObj) {

	console.log("\nGameID:", genGameId());

	// Log the full game object for debugging purposes
	console.log("\n");
	console.log("Before input");
	console.log(game);
	console.log("\n");

	// Can't access game member variables if the object doesn't exist
	if( queryObj.start || game == null ) {

		game = new codenames.codenames();
		console.log("Starting a new game");
		console.log(game);
		console.log("\n");
		game.report();
		return;

	}

	if( game.winner != '' ) {

		console.log(game.winner, "has already won the game. Please start a new game");
		return;

	}

	var turnState = game.getGameState();

	if( queryObj.endTurn ) {

		var turnEnded = game.endTurn();

		if( !turnEnded ) {
			console.log("Error: You must make at least one guess before ending your turn!");
		} else {
			console.log("Successfully ended turn early");
		}

	} else if( queryObj.guessWord && turnState.phase == 'Guessing' ) {

		console.log("Attempting to guess the card '" + queryObj.guessWord + "'");
		var cardGuessed = game.makeGuess(queryObj.guessWord);
		console.log("Guessed '" + queryObj.guessWord + "', which turned out to be a", cardGuessed.type);

	} else if( queryObj.hintWord && queryObj.hintNum && turnState.phase == 'Hinting' ) {

		console.log("Attempting to provide the hint [" + queryObj.hintWord, ":", queryObj.hintNum + "]");
		var hintValid = game.giveHint(queryObj.hintWord, queryObj.hintNum);

		if( !hintValid ) {
			console.log("The hint [" + queryObj.hintWord, ":", queryObj.hintNum + "] was not accepted");
		} else {
			console.log("The hint [" + queryObj.hintWord, ":", queryObj.hintNum + "] was accepted");
		}

	} else {
		console.log("Was not given a valid set of inputs based on current game state");
	}

	console.log("\n");
	console.log("After input");
	console.log("\n");

	// Report the game state
	game.report();

}

module.exports.getGameJSON = function() {

	return JSON.stringify(game.getGameState());

}

// Generates a random string to be used as a game id
// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript?page=1&tab=votes#tab-top
function genGameId() {

	var result;
	var keyExists = true;
	var characterPoolLength = characterPool.length;  // Not sure why this doesn't work directly in the loop

	while( keyExists ) {

		result = '';

		for(var i = 0; i < gameIdLength; i++) {
			result += characterPool.charAt(Math.floor(Math.random() * characterPoolLength))
		}

		keyExists = result in activeGames;

	}

	return result;

}

var game = new codenames.codenames();