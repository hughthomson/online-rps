const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 3001
var uuid = require('uuid')
var favicon = require('serve-favicon');

app.use(favicon(__dirname + '/assets/rock.png'));



app.get('/js/local.js', (req, res) => {
    res.sendFile(__dirname + '/js/local.js');
})

app.get('/online-game/js/online.js', (req, res) => {
    res.sendFile(__dirname + '/js/online.js');
})

app.get('/assets/rock.png', (req, res) => {
    res.sendFile(__dirname + '/assets/rock.png');
})

app.get('/assets/bot.png', (req, res) => {
    res.sendFile(__dirname + '/assets/bot.png');
})


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.get('/local-game', (req, res) => {
    res.sendFile(__dirname + '/local.html')
})

app.get('/online-game/', (req, res) => {
    res.redirect('/online-game/' + uuid.v4())
    // res.sendFile(__dirname + '/online.html')
})

app.get('/online-game/:id', (req, res) => {
    console.log(req.params.id)
    res.sendFile(__dirname + '/online.html')
})

let roomInfo = new Map()

io.on('connection', (socket) => {
    let roomID;
    console.log("User Connected: " + socket.id)

    

    socket.on('join room', (room)=> {
        roomID = room
        socket.join(room)

        if(!roomInfo.has(room)) {
            roomInfo.set(room, {host: socket.id, guest: -1, hostSelection: -1, guestSelection: -1, round: 1, guestWins: 0, hostWins: 0})
            io.to(socket.id).emit('client role', {role: "host", roomInfo: roomInfo.get(room)});
            socket.to(room).emit('connect to room', {role: "host", roomInfo: roomInfo.get(room)});
        } else {
            if(roomInfo.get(room).host == -1) {
                let tempObj = roomInfo.get(room)
                tempObj.host = socket.id
                roomInfo.set(room, tempObj)
                io.to(socket.id).emit('client role', {role: "host", roomInfo: roomInfo.get(room)});
                socket.to(room).emit("connect to room", {role: "host", roomInfo: roomInfo.get(room)});
            } else if(roomInfo.get(room).guest == -1) {
                let tempObj = roomInfo.get(room)
                tempObj.guest = socket.id
                roomInfo.set(room, tempObj)
                io.to(socket.id).emit('client role', {role: "guest", roomInfo: roomInfo.get(room)});
                socket.to(room).emit("connect to room", {role: "guest", roomInfo: roomInfo.get(room)});
            } else {
                io.to(socket.id).emit('client role', {role: "spectator", roomInfo: roomInfo.get(room)});
                socket.to(room).emit("connect to room", {role: "spectator", roomInfo: roomInfo.get(room)});
            }
        }

        if(roomInfo.get(room).host != -1 && roomInfo.get(room).guest != -1) {
            io.in(room).emit("room connected", "true");
        } else {
            io.in(room).emit("room connected", "false");
        }
    })

    socket.on('selection made', (data) => {
        console.log(data)
        if(data.role == "host") {
            let tempObj = roomInfo.get(roomID)
            tempObj.hostSelection = data.selection
            roomInfo.set(roomID, tempObj)
        } else if (data.role == "guest") {
            let tempObj = roomInfo.get(roomID)
            tempObj.guestSelection = data.selection
            roomInfo.set(roomID, tempObj)
        }

        let guestSelection = roomInfo.get(roomID).guestSelection
        let hostSelection = roomInfo.get(roomID).hostSelection

        console.log("Host: " + hostSelection + ", Guest: " + guestSelection)

        if(hostSelection > 0 && guestSelection > 0) {
            io.in(roomID).emit("selections complete", {guest: guestSelection, host: hostSelection})
        } else {
            socket.to(roomID).emit("selection made", data.role);
        }

    })

    socket.on('set round', (data) => {
        let tempObj = roomInfo.get(roomID)
        tempObj.hostSelection = -1
        tempObj.guestSelection = -1
        tempObj.round = data.round
        tempObj.hostWins = data.hostWins
        tempObj.guestWins = data.guestWins
        roomInfo.set(roomID, tempObj)
    })
    

    socket.on('disconnect', () => {
        try {
            if(roomInfo.get(roomID).host == socket.id) {
                let tempObj = roomInfo.get(roomID)
                tempObj.host = -1
                tempObj.hostSelection = -1
                tempObj.guestSelection = -1
                roomInfo.set(roomID, tempObj)
                io.to(roomID).emit("disconnected from room", "host");
                io.in(roomID).emit("room connected", "false");

            } else if(roomInfo.get(roomID).guest == socket.id) {
                let tempObj = roomInfo.get(roomID)
                tempObj.guest = -1
                tempObj.hostSelection = -1
                tempObj.guestSelection = -1
                roomInfo.set(roomID, tempObj)
                io.to(roomID).emit("disconnected from room", "guest");
                io.in(roomID).emit("room connected", "false");
            }
        } catch (error) {
            roomInfo.delete(roomID)
        }



        console.log('User Disconnected: ' + socket.id);
    });
})

server.listen(port, () => {
    console.log('listening on *:' + port);
}); 