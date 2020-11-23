// URL of the update page. Should change to not be localhost and also be modular when ajaxSend() works
const baseURL = "http://localhost:8080/codenames";

// Placeholder id. Let server auto-start a game and generate a proper ID for us
var gameId = '';

// Updates the page with the info pulled from the server
// GameData should be what is returned from updateURL, parsed with JSON.parse()
function updateScreen( gameData ) {

	gameId = gameData.gameId;
	
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
	var gameStr = document.getElementById("game");

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

	gameStr.innerText = "Game ID: " + gameId;

}

// Uses ajax to ask the server for the current game state, and then updating the page
function ajaxUpdate() {

	// https://www.w3schools.com/whatis/whatis_ajax.asp
	var xhttp = new XMLHttpRequest();
	xhttp.open('POST', baseURL + '/game/' + gameId, true);
	xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

	xhttp.onreadystatechange = function() {
		if( this.readyState == 4 && this.status == 200 ) {
			updateScreen(JSON.parse(this.responseText));
		}
	};
	
	xhttp.send("action=update");

}

// Sends the GET requests with ajax instead of reloading the page
function ajaxSend(inputType) {

	var queryStr = 'action=input&';

	switch(inputType) {

		case 0:  // Start a new game
			queryStr = queryStr + 'start=start';
			break;
		case 1:  // Give a hint
			let hintWord = document.getElementById("hintWord").value;
			let hintNum = document.getElementById("hintNum").value;
			queryStr = queryStr + "hintWord=" + hintWord + "&hintNum=" + hintNum;
			break;
		case 2:  // Make a guess
			let guessWord = document.getElementById("guessWord").value;
			queryStr = queryStr + "guessWord=" + guessWord;
			break;
		case 3:  // End the turn
			queryStr = queryStr + "endTurn=1";
			break;
		default:
			alert("Invalid input");
			return;
	}

	console.log(queryStr);

	document.getElementById("hintWord").value = '';
	document.getElementById("hintNum").value = '';
	document.getElementById("guessWord").value = '';

	var xhttp = new XMLHttpRequest();
	xhttp.open('POST', baseURL + '/game/' + gameId, true);
	xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

	xhttp.onreadystatechange = function() {
		if( this.readyState == 4 && this.status == 200 ) {
			updateScreen(JSON.parse(this.responseText));
		}
	};
	
	xhttp.send(queryStr);

}

function joinGame() {

	gameId = document.getElementById("joinId").value;

}

// Immediately try to update our board
// Needed for the current implementation where each input reloads the page
ajaxUpdate();

// Start polling, currently at once every second
setInterval(ajaxUpdate, 1000);
