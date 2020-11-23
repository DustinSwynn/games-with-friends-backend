const path = require('path');
const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
	projectId: 'second-folio-294223',
	keyFilename: path.join(__dirname, '../../games-with-friends-service-account-key.json')
});

/*
	Adds a game to the user's record

	- userId: The Auth0 key
	- gameName: the name of the game
	- gameWon: true for a win, false for a loss

	WARNING: Not safe when user does not exist in Firebase
*/
async function addGame(userId, gameName, gameWon) {

	var dateStr = Date();

	var recordObj = {
		win: gameWon,
		when: dateStr,
		game: gameName
	};

	const userRef = db.collection('users').doc(userId);

	const recordRes = await userRef.update({
		record: Firestore.FieldValue.arrayUnion(JSON.stringify(recordObj)),
	});

	if( gameWon ) {
		const winRes = await userRef.update({
			wins: Firestore.FieldValue.increment(1)
		});
	} else {
		const lossRes = await userRef.update({
			losses: Firestore.FieldValue.increment(1)
		});
	}

}

module.exports.addGame = addGame;