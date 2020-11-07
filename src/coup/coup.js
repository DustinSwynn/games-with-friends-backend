/*
    Class for Coup game
*/

const { query } = require('express');
const fs = require('fs');

const influence = ['Duke','Assasin', 'Captain','Ambassador','Contessa'] // 3 of each influences in each game

var totalPeople = 0;

document.getElementById("addPlayers").onclick = function(){
    table = document.getElementById("playerTable");
    totalPeople = totalPeople + 1;
    row = table.insertRow();

    var cell1 = row.insertCell(0);

    cell1.innerHTML = document.getElementById("playerName").value;
}

class coup {
    constructor() {
        var numPlayers = document.getElementById(playerTable).rows.length -1;

        if (numPlayers > 2 && numPlayers <7){
            this.availableInfluences = infuence.concat(influence).concat(influence); // amazing code
            this.inplayInfluences = [];
            this.discardedInfluencess =[];

        }
        else{
            console.log("Coup only accomodates a game with 3-6 players")
        }
    }
}

var tempPlayerId = 1; // only for testing

class player{
    constructor(){
        var numPlayers = document.getElementById(playerTable).rows.length -1;

        if (numPlayers > 2 && numPlayers <7){
            this.name = '';
            this.id = tempPlayerId;
            this.influences = [];
            this.coins = 0;
            this.state = '';

            tempPlayerId++;
        }
        else{
            console.log("Coup only accomodates a game with 3-6 players")
        }
    }
}

