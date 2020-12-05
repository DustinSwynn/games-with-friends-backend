/*
	Miscellaneous functions
*/

const path = require('path');
const Firestore = require('@google-cloud/firestore');

// For the genGameId()
const gameIdLength = 10;
const characterPool = 'abcdefghijklmnopqrstuvwxyz0123456789';

// Initialize connection to FireStore database
const db = new Firestore({
	projectId: 'second-folio-294223',
	keyFilename: path.join(__dirname, '../../games-with-friends-service-account-key.json')
});

/*
	Adds a game to the user's record

	- userId: The Auth0 key
	- gameName: the name of the game
	- gameWon: true for a win, false for a loss

	If the user does not exist, create the user, but only add record and [wins | losses] fields
*/
function addGame(userId, gameName, gameWon) {

	var usrId;

	if( userId.length < 1 || typeof userId == 'undefined' ) {
		console.log("Error: User ID invalid, setting to 'Guest'");
		usrId = 'Guest';
	} else {
		usrId = userId;
	}

	var recordObj = {
		'win': gameWon,
		'when': Date(),
		'game': gameName
	};

	const userRef = db.collection('users').doc(usrId);
	const wlKey = gameWon ? 'wins' : 'losses';

	const res = userRef.set({

		record: Firestore.FieldValue.arrayUnion(recordObj),
		[wlKey]: Firestore.FieldValue.increment(1)

	}, {merge: true})

}

// Generates a random string to be used as a game id
// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript?page=1&tab=votes#tab-top
// Either feed the code an array of keys currently in use, or null to do no checking
function genGameId(keysInUse) {

	var result = '';
	var keyExists = false;
	var characterPoolLength = characterPool.length;  // Not sure why this doesn't work directly in the loop

	do {

		result = '';

		for(var i = 0; i < gameIdLength; i++) {
			result += characterPool.charAt(Math.floor(Math.random() * characterPoolLength))
		}

		keysInUse ? keyExists = result in keysInUse : keyExists = false;

	} while( keyExists );

	return result;

}

module.exports.addGame = addGame;
module.exports.genGameId = genGameId;
