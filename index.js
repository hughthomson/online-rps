const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 3001
var uuid = require('uuid')



app.get('/js/local.js', (req, res) => {
    res.sendFile(__dirname + '/js/local.js');
})

app.use("/static", express.static('./static/'));

app.get('/js/online.js', (req, res) => {
    res.sendFile(__dirname + '/js/online.js');
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

app.get('/online-game', (req, res) => {
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
            roomInfo.set(room, {host: socket.id, guest: -1, hostSelection: -1, guestSelection: -1})
            io.to(socket.id).emit('client role', 'host');
            socket.broadcast.to(room).emit('connect to room', 'host');
        } else {
            if(roomInfo.get(room).host == -1) {
                let tempObj = roomInfo.get(room)
                tempObj.host = socket.id
                roomInfo.set(room, tempObj)
                io.to(socket.id).emit('client role', 'host');
                socket.broadcast.to(room).emit("connect to room", "host");
            } else if(roomInfo.get(room).guest == -1) {
                let tempObj = roomInfo.get(room)
                tempObj.guest = socket.id
                roomInfo.set(room, tempObj)
                io.to(socket.id).emit('client role', 'guest');
                socket.broadcast.to(room).emit("connect to room", "guest");
            } else {
                io.to(socket.id).emit('client role', 'spectator');
                socket.broadcast.to(room).emit("connect to room", "spectator");
            }
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

    socket.on('reset round', () => {
        let tempObj = roomInfo.get(roomID)
        tempObj.hostSelection = -1
        tempObj.guestSelection = -1
        roomInfo.set(roomID, tempObj)
    })
    

    socket.on('disconnect', () => {
        try {
            if(roomInfo.get(roomID).host == socket.id) {
                let tempObj = roomInfo.get(roomID)
                tempObj.host = -1
                roomInfo.set(roomID, tempObj)
                io.to(roomID).emit("disconnected from room", "host");
            } else if(roomInfo.get(roomID).guest == socket.id) {
                let tempObj = roomInfo.get(roomID)
                tempObj.guest = -1
                roomInfo.set(roomID, tempObj)
                io.to(roomID).emit("disconnected from room", "guest");
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