var roleAlertElm = document.getElementById('roleAlert')
var connectionAlertElm = document.getElementById('connectionAlerts')

var socket = io();

socket.on("room connected", function(connected) {
    console.log(connected)
    if(connected == "true") {
        enableButtons()
        playerSelectionElm.innerHTML = spinnerHTML
        opponentSelectionElm.innerHTML = spinnerHTML
        playerChoice = -1;
        opponentChoice = -1;
        roundTextElm.style.color = "black"
        roundTextElm.innerHTML = "Round " + round
    } else {
        disableButtons()
        playerSelectionElm.innerHTML = spinnerHTML
        opponentSelectionElm.innerHTML = spinnerHTML
        playerChoice = -1;
        opponentChoice = -1;
        roundTextElm.style.color = "black"
        roundTextElm.innerHTML = "Round " + round
    }
})

let roomID = document.location.pathname.substring(document.location.pathname.lastIndexOf('/') + 1)
document.getElementById('url').value = window.location.href
document.getElementById('url').onclick = function() {
    selectText()
}
function selectText() {
    const input = document.getElementById('url');
    input.focus();
    input.select();
}
let roleGlobal = ""
socket.emit('join room', roomID)

socket.on('client role', function(data) {
    console.log(data)
    if(data.role == "host") {
        roleAlertElm.innerHTML = "<div class='alert alert-primary' role='alert'>You are the Host</div>"

        if(data.roomInfo.guest == -1) {
            connectionAlertElm.innerHTML = "<div class='alert alert-danger' role='alert'>Guest Not Connected</div>"
        } else {
            connectionAlertElm.innerHTML = "<div class='alert alert-success' role='alert'>Guest Connected</div>"
        }
        
        playerWinsElm.innerHTML = "Wins: " + data.roomInfo.hostWins
        playerWins = data.roomInfo.hostWins
        opponentWinsElm.innerHTML = "Wins: " + data.roomInfo.guestWins
        opponentWins = data.roomInfo.guestWins
        round = data.roomInfo.round
        roundTextElm.innerHTML = "Round " + data.roomInfo.round
    } else if(data.role == "guest") {
        roleAlertElm.innerHTML = "<div class='alert alert-primary' role='alert'>You are the Guest</div>"
        
        if(data.roomInfo.host == -1) {
            connectionAlertElm.innerHTML = "<div class='alert alert-danger' role='alert'>Host Not Connected</div>"
        } else {
            connectionAlertElm.innerHTML = "<div class='alert alert-success' role='alert'>Host Connected</div>"
        }
        
        playerWinsElm.innerHTML = "Wins: " + data.roomInfo.guestWins
        playerWins = data.roomInfo.guestWins
        opponentWinsElm.innerHTML = "Wins: " + data.roomInfo.hostWins
        opponentWins = data.roomInfo.hostWins
        round = data.roomInfo.round
        roundTextElm.innerHTML = "Round " + data.roomInfo.round
    } else if(data.role == "spectator") {
        roleAlertElm.innerHTML = "<div class='alert alert-primary' role='alert'>You are a Spectator</div>"
        
        playerWinsElm.innerHTML = "Wins: " + data.roomInfo.hostWins
        playerWins = data.roomInfo.hostWins
        opponentWinsElm.innerHTML = "Wins: " + data.roomInfo.guestWins
        opponentWins = data.roomInfo.guestWins
        round = data.roomInfo.round
        roundTextElm.innerHTML = "Round " + data.roomInfo.round
    }
    roleGlobal = data.role
    if(data.role == "spectator") {
        let guestCard = document.getElementById('guestCard')
        let hostCard = document.getElementById('hostCard')

        guestCard.innerHTML = "<h3>Guest</h3>"
        hostCard.innerHTML = "<h3>Host</h3>"
    }
})

socket.on('connect to room', function(data) {
    console.log(data)


    if(data.role == "host") {
        connectionAlertElm.innerHTML = "<div class='alert alert-success' role='alert'>Host Connected</div>"
    } else if(data.role == "guest"){
        connectionAlertElm.innerHTML = "<div class='alert alert-success' role='alert'>Guest Connected</div>"
    }

    console.log(data.role + " connected")
})

socket.on('disconnected from room', function(role) {
    if(role == "host") {
        connectionAlertElm.innerHTML = "<div class='alert alert-danger' role='alert'>Host Disconnected</div>"
    } else if(role == "guest"){
        connectionAlertElm.innerHTML = "<div class='alert alert-danger' role='alert'>Guest Disconnected</div>"
    }
    console.log(role + " disconnected")
})

/* OLD LOCAL GAME */
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
var tempSelection = -1;
rockButton.onclick = function() {
    disableButtons()
    // makeSelection(1)
    tempSelection = 1
    playerSelectionElm.innerHTML = "<h1>✔</h1>"
    socket.emit('selection made', {role: roleGlobal, selection: 1})
}

scissorsButton.onclick = function() {
    disableButtons()
    // makeSelection(2)
    tempSelection = 2
    playerSelectionElm.innerHTML = "<h1>✔</h1>"
    socket.emit('selection made', {role: roleGlobal, selection: 2})

}

paperButton.onclick = function() {
    disableButtons()
    // makeSelection(3)
    tempSelection = 3
    playerSelectionElm.innerHTML = "<h1>✔</h1>"
    socket.emit('selection made', {role: roleGlobal, selection: 3})
}

socket.on('selection made', function(role) {
    if(roleGlobal == "spectator") {
        if(role == "host") {
            playerSelectionElm.innerHTML = "<h1>✔</h1>"
        } else {
            opponentSelectionElm.innerHTML = "<h1>✔</h1>"
        }
    } else {
        opponentSelectionElm.innerHTML = "<h1>✔</h1>"
    }
    
    console.log("here")
})

socket.on('selections complete', function(selections) {
    if(roleGlobal == "host") {
        makeSelection(selections.host)
        makeOpponentSelection(selections.guest)
    } else if (roleGlobal == "guest") {   
        makeSelection(selections.guest)
        makeOpponentSelection(selections.host)
    } else {
        makeSelection(selections.host)
        makeOpponentSelection(selections.guest)
    }
    console.log("selections complete")

    checkWin()
})


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

function makeOpponentSelection(selection) {
    if(selection == 1) {
        opponentSelectionElm.innerHTML = "<h3>Rock</h3>"
    } else if(selection == 2) { 
        opponentSelectionElm.innerHTML = "<h3>Scissors</h3>"
    } else if(selection == 3) {
        opponentSelectionElm.innerHTML = "<h3>Paper</h3>"
    } 

    opponentChoice = selection
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
}

function disableButtons() {
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
    roundTextElm.style.color = "black"
    round += 1
    roundTextElm.innerHTML = "Round " + round
    if(roleGlobal == "host") {
        tempObj = {round: round, hostWins: playerWins, guestWins: opponentWins}
        console.log(tempObj)
        socket.emit('set round', {round: round, hostWins: playerWins, guestWins: opponentWins})
    }
}

/* END OLD LOCAL GAME */