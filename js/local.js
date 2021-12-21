var paperButton = document.getElementById('paper-btn')
var rockButton = document.getElementById('rock-btn')
var scissorsButton = document.getElementById('scissors-btn')

var playerSelectionElm = document.getElementById('player-selection')
var opponentSelectionElm = document.getElementById('opponent-selection')

var playerWinsElm = document.getElementById('player-win-count')
var opponentWinsElm = document.getElementById('opponent-win-count')

var roundTextElm = document.getElementById('round-text')

var playerChoice = -1;
var opponentChoice = -1;

var round = 1
var opponentWins = 0
var playerWins = 0

var spinnerHTML = "<div class='spinner-grow' style='width: 3rem; height: 3rem;' role='status'> </div>"

rockButton.onclick = function() {
    diableButtons()
    makeSelection(1)
}

scissorsButton.onclick = function() {
    diableButtons()
    makeSelection(2)
}

paperButton.onclick = function() {
    diableButtons()
    makeSelection(3)
}



function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function endRound(type) {
    if(type == "win") {
        roundTextElm.style.color = "green"
        roundTextElm.innerHTML = "You Won!"
        playerWins += 1
        playerWinsElm.innerHTML = "Wins: " + playerWins
    } else if (type == "lose") {
        roundTextElm.style.color = "red"
        roundTextElm.innerHTML = "You Lost!"
        opponentWins += 1
        opponentWinsElm.innerHTML = "Wins: " + opponentWins
    } else if (type == "tie") {
        roundTextElm.style.color = "DarkOrange"
        roundTextElm.innerHTML = "Tie"
    }

    setTimeout(function() {newRound()}, 3000);
}

function checkWin() {
    if(opponentChoice == playerChoice) {
        endRound("tie")
    } else if(playerChoice == 1) {
        if(opponentChoice == 2) {
            endRound("win")
        } else if(opponentChoice == 3) {
            endRound("lose")
        }
    } else if (playerChoice == 2) {
        if(opponentChoice == 3) {
            endRound("win")
        } else if(opponentChoice == 1) {
            endRound("lose")
        }
    } else if (playerChoice == 3) {
        if(opponentChoice == 1) {
            endRound("win")
        } else if(opponentChoice == 2) {
            endRound("lose")
        }
    }

}

function makeOpponentSelection() {
    const randInt = randomIntFromInterval(1, 3)
    if(randInt == 1) {
        opponentSelectionElm.innerHTML = "<h3>Rock</h3>"
    } else if(randInt == 2) { 
        opponentSelectionElm.innerHTML = "<h3>Scissors</h3>"
    } else if(randInt == 3) {
        opponentSelectionElm.innerHTML = "<h3>Paper</h3>"
    } 

    opponentChoice = randInt

    checkWin()
}
  

function makeSelection(selection) {
    if(selection == 1) {
        playerSelectionElm.innerHTML = "<h3>Rock</h3>"
    } else if(selection == 2) {
        playerSelectionElm.innerHTML = "<h3>Scissors</h3>"
    } else if(selection == 3) {
        playerSelectionElm.innerHTML = "<h3>Paper</h3>"
    } 

    playerChoice = selection

    makeOpponentSelection()
}

function diableButtons() {
    paperButton.disabled = true;
    rockButton.disabled = true;
    scissorsButton.disabled = true;
}

function enableButtons() {
    paperButton.disabled = false;
    rockButton.disabled = false;
    scissorsButton.disabled = false;
}

function newRound() {
    enableButtons()
    playerSelectionElm.innerHTML = spinnerHTML
    opponentSelectionElm.innerHTML = spinnerHTML
    playerChoice = -1;
    opponentChoice = -1;
    round += 1
    roundTextElm.style.color = "black"
    roundTextElm.innerHTML = "Round " + round
}