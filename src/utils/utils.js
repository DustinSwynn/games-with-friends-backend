/*
	Miscellaneous functions
*/

const path = require('path');
const Firestore = require('@google-cloud/firestore');

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

	var dateStr = Date();

	var recordObj = {
		win: gameWon,
		when: dateStr,
		game: gameName
	};

	const userRef = db.collection('users').doc(userId);
	const wlKey = gameWon ? 'wins' : 'losses';

	const res = userRef.set({

		record: Firestore.FieldValue.arrayUnion(JSON.stringify(recordObj)),
		[wlKey]: Firestore.FieldValue.increment(1)

	}, {merge: true})

}

module.exports.addGame = addGame;
