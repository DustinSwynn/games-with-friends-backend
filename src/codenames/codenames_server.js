/*
**	Example server-side logic
**	Primarily for testing, likely to be removed
*/

const codenames = require('./codenames');

const gameIdLength = 5;
const characterPool = 'abcdefghijklmnopqrstuvwxyz0123456789';

var activeGames = {};

// Runs the game. Provide the function the query objects
module.exports.runGame = function(gameId, queryObj) {

	console.log("\nGameID:",gameId);

	var game = activeGames[gameId];

	// Log the full game object for debugging purposes
	console.log("\n");
	console.log("Before input");
	console.log(game);
	console.log("\n");

	// Can't access game member variables if the object doesn't exist
	if( queryObj.start || game == null ) {

		/*
		var newId = genGameId();
		game = new codenames.codenames(newId);
		activeGames[newId] = game;
		console.log("Starting a new game with id=" + newId);
		console.log(game);
		console.log("\n");
		game.report();
		return newId;
		*/

		if( game == null ) {
			var newId = genGameId();
			activeGames[newId] = new codenames.codenames(newId);
			console.log("Starting a new game with id=" + newId);
			game = activeGames[newId];
		} else {
			activeGames[gameId] = new codenames.codenames(gameId);
			console.log("Restarting the game with id=" + gameId);
			game = activeGames[gameId];
		}

		console.log(game);
		console.log("\n");
		game.report();
		return newId;

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

	return gameId;

}

module.exports.getGameJSON = function(gameId) {

	var game = activeGames[gameId];
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