// URL of the update page. Should change to not be localhost and also be modular when ajaxSend() works
const updateURL = "http://localhost:8080/codenames/update";

console.log("Loaded scripts");

// Updates the page with the info pulled from the server
// GameData should be what is returned from updateURL, parsed with JSON.parse()
function updateScreen( gameData ) {
	
	// Get all the elements on the page that we need to possibly update
	var gridElm = document.querySelectorAll('#grid td');
	var mapElm = document.querySelectorAll('#map td');
	var winnerStr = document.getElementById('winner');
	var teamTurnStr = document.getElementById('team');
	var blueLeftStr = document.getElementById('blueLeft');
	var redLeftStr = document.getElementById('redLeft');
	var phaseStr = document.getElementById('phase');
	var hintStr = document.getElementById('hint');
	var guessesStr = document.getElementById('guessesLeft');

	// Update the map and grid
	for(var i = 0; i < 25; i++) {
		gridElm[i].innerText = gameData.grid[i].word;
		gridElm[i].style.backgroundColor = (gameData.grid[i].colour == 'None' ? 'white' : gameData.grid[i].colour);
		if( gameData.grid[i].colour == 'Black' ) {
			gridElm[i].style.color = 'White';
		} else {
			gridElm[i].style.color = 'Black';
		}

		mapElm[i].innerText = gameData.map[i].type;
		mapElm[i].style.backgroundColor = gameData.map[i].colour;
		if( gameData.map[i].colour == 'Black' ) {
			mapElm[i].style.color = 'White';
		} else {
			mapElm[i].style.color = 'Black';
		}
	}

	// Special case for if there is a winner
	if( gameData.winner != '' ) {
		winnerStr.innerText = "The " + gameData.winner + " team has won";
		winnerStr.hidden = false;
		teamTurnStr.hidden = true;
		blueLeftStr.hidden = true;
		redLeftStr.hidden = true;
		phaseStr.hidden = true;
		hintStr.hidden = true;
		guessesStr.hidden = true;
		return;
	} else {
		winnerStr.hidden = true;
		teamTurnStr.hidden = false;
		blueLeftStr.hidden = false;
		redLeftStr.hidden = false;
		phaseStr.hidden = false;
	}

	teamTurnStr.innerText = "It is currently the " + gameData.team + " team's turn";
	blueLeftStr.innerText = "Blue Agents Left: " + gameData.blueLeft;
	redLeftStr.innerText = "Red Agents Left: " + gameData.redLeft;

	if( gameData.phase == 'Hinting' ) {
		phaseStr.innerText = "Waiting for the " + gameData.team + " team's spymaster to give a hint";
		hintStr.hidden = true;
		guessesStr.hidden = true;

	} else {
		phaseStr.innerText = "Waiting for the " + gameData.team + " team to make a guess";
		hintStr.innerText = "The hint is: [" + gameData.hint.word + ", " + gameData.hint.number + "]";
		hintStr.hidden = false;
		guessesLeft.innerText = "The " + gameData.team + " team has " + gameData.guessesLeft + " guesses left";
		guessesStr.hidden = false;
	}

}

// Uses ajax to ask the server for the current game state, and then updating the page
function ajaxUpdate() {

	// https://www.w3schools.com/whatis/whatis_ajax.asp
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if( this.readyState == 4 && this.status == 200 ) {
			updateScreen(JSON.parse(this.responseText));
		}
	};
	xhttp.open('GET', updateURL, true);
	xhttp.send();

}

/*
	Non functional

	The current input.html page reloads the page each time the user sends any input
	This will be used instead once it is complete to avoid reloading the page

*/
function ajaxSend() {

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if( this.readyState == 4 && this.status == 200 ) {
			updateScreen(JSON.parse(this.responseText));
		}
	};

}

// Immediately try to update our board
// Needed for the current implementation where each input reloads the page
ajaxUpdate();

// Start polling, currently at once every second
setInterval(ajaxUpdate, 1000);
