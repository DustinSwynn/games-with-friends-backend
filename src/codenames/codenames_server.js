/*
**	Example server-side logic
**	Primarily for testing, likely to be removed
**	
**	The above is a lie, we are now shipping this
*/

const codenames = require('./codenames');
const my_utils = require('../utils/utils');

const gameIdLength = 5;
const characterPool = 'abcdefghijklmnopqrstuvwxyz0123456789';

/*
activeGames = {
	[gameId]: {
		gameObj: <codenames>,
		players: {}
			userId: {
				username: <username>,
				team: [Blue | Red],
				role: [Agent, Spymaster]
			},
			...
		},
		moveHistory: []
	}
	...
}
*/
var activeGames = {};

function createGame() {

	return {
		game: new codenames.codenames(),
		players: {},
		moveHistory: new Array(),
		updatedWinners: false
	}

}

// Runs the game. Provide the function the query objects
function runGame(gameId, queryObj) {

	console.log("\nGameID:",gameId);

	var gameObj = activeGames[gameId];

	// Log the full game object for debugging purposes
	console.log("\n");
	console.log("Before input");
	console.log(gameObj);
	console.log("\n");

/*
	Start a new game
*/

	// Can't access game member variables if the object doesn't exist
	if( queryObj.action == 'start' || gameObj == null ) {

		if( gameObj == null ) {
			var newId = genGameId();
			activeGames[newId] = createGame();
			console.log("Starting a new game with id=" + newId);
			console.log(activeGames[newId]);
			console.log("\n");
			activeGames[newId].game.report();
			return newId;
		} else {
			activeGames[gameId] = createGame();
			console.log("Starting a new game with id=" + gameId);
			console.log(activeGames[gameId]);
			console.log("\n");
			activeGames[gameId].game.report();
			return gameId;
		}

	}

	var game = gameObj.game;

/*
	Game has ended
*/
	if( game.winner != '' ) {

		console.log(game.winner, "has already won the game. Please start a new game");
		return;

	}

	var turnState = game.getGameState();

/*
	End the current turn
*/

	if( queryObj.action == 'end' ) {

		var turnEnded = game.endTurn();

		if( !turnEnded ) {
			console.log("Error: You must make at least one guess before ending your turn!");
			gameObj['moveHistory'].push(queryObj.team + " " + queryObj.role + " " + queryObj.username + " tried to end the but the turn cannot be ended yet!");
		} else {
			console.log("Successfully ended turn early");
			gameObj['moveHistory'].push(queryObj.team + " " + queryObj.role + " " + queryObj.username + " ended the turn");
		}

/*
	Make a guess
*/

	} else if( queryObj.action == 'guess' && turnState.phase == 'Guessing' ) {

		console.log("Attempting to guess the card '" + queryObj.guessWord + "'");
		var cardGuessed = game.makeGuess(queryObj.guessWord);
		console.log("Guessed '" + queryObj.guessWord + "', which turned out to be a", cardGuessed.type);
		gameObj['moveHistory'].push(queryObj.team + " " + queryObj.role + " " + queryObj.username + " guessed '" + queryObj.guessWord + "' which turned out to be a", cardGuessed);

/*
	Give a hint
*/

	} else if( queryObj.action == 'hint' && turnState.phase == 'Hinting' ) {

		console.log("Attempting to provide the hint [" + queryObj.hintWord, ":", queryObj.hintNum + "]");
		var hintValid = game.giveHint(queryObj.hintWord, queryObj.hintNum);

		if( !hintValid ) {
			console.log("The hint [" + queryObj.hintWord, ":", queryObj.hintNum + "] was not accepted");
			gameObj['moveHistory'].push(queryObj.team + " " + queryObj.role + " " + queryObj.username + " provided the hint [" + queryObj.hintWord + ", " + queryObj.hintNum + "] but it is not valid!");
		} else {
			console.log("The hint [" + queryObj.hintWord, ":", queryObj.hintNum + "] was accepted");
			gameObj['moveHistory'].push(queryObj.team + " " + queryObj.role + " " + queryObj.username + " provided the hint [" + queryObj.hintWord + ", " + queryObj.hintNum + "]");
		}

	} else {
		console.log("Was not given a valid set of inputs based on current game state");
	}

	console.log("\n");
	console.log("After input");
	console.log("\n");

	// Report the game state
	game.report();

	// No this isn't pretty but its an easy spot to put this
	if( game.winner != '' ) {

		// This check shouldn't be needed, but it would be really bad to do this twice
		if( !gameObj['updatedWinners'] ) {

			console.log("Game has ended, updating Firestore");

			for(var key in gameObj['players'] ) {
				console.log("Checking player:", key, " - ", (gameObj['players'][key]['team'] == game.winner));
				my_utils.addGame(key, 'Codenames', (gameObj['players'][key]['team'] == game.winner));
			}

			gameObj['moveHistory'].push("The " + game.winner + " team has won!");
			gameObj['updatedWinners'] = true;
		}

	}

	return gameId;

}

function getGameJSON(gameId, queryObj) {

	var playerObj = {
		username: queryObj.username,
		team: queryObj.team,
		role: queryObj.role
	};

	var gameObj = activeGames[gameId];

	// Add players on update because they may go a long time without making any input
	gameObj['players'][queryObj.userid] = playerObj;

	var game = gameObj[game];
	return JSON.stringify(game.getGameState());

}

function getGameUpdate(gameId, queryObj) {

	var playerObj = {
		username: queryObj.username,
		team: queryObj.team,
		role: queryObj.role
	};

	var gameObj = activeGames[gameId];

	// Add players on update because they may go a long time without making any input
	gameObj['players'][queryObj.userid] = playerObj;

	var retObj = {
		gameId: gameId,
		game: gameObj['game'].getGameState(),
		players: [],
		moveHistory: gameObj['moveHistory']
	};

	for( var key in gameObj['players'] ) {
		retObj.players.push({
			username: gameObj['players'][key].username,
			team: gameObj['players'][key].team,
			role: gameObj['players'][key].role
		});
	}

	return JSON.stringify(retObj);

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

module.exports.runGame = runGame;
module.exports.getGameJSON = getGameJSON;
module.exports.getGameUpdate = getGameUpdate;