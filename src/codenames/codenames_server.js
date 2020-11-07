/*
**	Example server-side logic
**	Primarily for testing, likely to be removed
*/

const codenames = require('./codenames');

var game = new codenames.codenames();

// Runs the game. Provide the function the query objects
module.exports.runGame = function(queryObj) {

	console.log("Query received");
	console.log(queryObj);

	// Log the full game object for debugging purposes
	console.log("\n\n");
	console.log("Before input");
	console.log(game);
	console.log("\n\n");

	// Can't access game member variables if the object doesn't exist
	if( queryObj.start || game == null ) {

		game = new codenames.codenames();
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

	// Report the game state
	game.report();

}

module.exports.getGameJSON = function() {

	return JSON.stringify(game.getGameState());

}
