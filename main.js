var app = require('express')();
var http = require('http');
http = http.Server(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

var generalInfo = io.of("/generalInfo");

var users = [];
var rooms = [];

generalInfo.on('connection', (socket) => {
    console.log(socket.client.id + " connected");

    users.push({ id: socket.client.id, name: socket.client.id });
    generalInfo.emit("userInfo", users);
    generalInfo.emit("roomInfo", rooms);

    socket.on('disconnect', () => {
        console.log(socket.client.id + " disconnected");
        users.splice(getUser(socket.client.id), 1);
        generalInfo.emit("userInfo", users);
    });
});

io.on('connection', (socket) => {
    socket.on('message', (msg) => {
        var textSplitted = msg.split(" ");
        if (textSplitted[0][0] == "/") {
            var command = textSplitted[0].slice(1, textSplitted[0].length);
            switch (command.toUpperCase()) {
                case "newroom".toUpperCase():
                    var roomName = textSplitted[1];
                    addRoom(roomName);
                    break;
                case "closeroom".toUpperCase():
                    var roomName = textSplitted[1];
                    closeRoom(roomName);
                    break;
                case "nickname".toUpperCase():
                    users[getUser(socket.id)].name = textSplitted[1];
                    generalInfo.emit("userInfo", users);
                    break;
            }
        }
        else if (textSplitted[0][0] == "@") {
            var command = textSplitted[0].slice(1, textSplitted[0].length);
            var restOfTheMessage = "";
            var username = users[getUser(socket.id)].name;

            for (var i = 1; i < textSplitted.length; i++) {
                restOfTheMessage += textSplitted[i];
                if (!(i == textSplitted.length - 1)) {
                    restOfTheMessage += " ";
                }
            }
            io.to(command).emit("newMessage", { channel: command, messageText: restOfTheMessage, writtenBy: socket.id, userName: username, date: Date.now() });
        }
        else {
            var username = users[getUser(socket.id)].name;
            io.emit("newMessage", { channel: "Public", messageText: msg, writtenBy: socket.id, userName: username, date: Date.now() });
        }
    });

    socket.on('joinRoom', (roomName) => {
        socket.join(roomName);
    });

    socket.on('leaveRoom', (roomName) => {
        socket.leave(roomName);
    });
});

function addRoom(roomName) {
    let roomFound = false;
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].name == roomName) {
            roomFound = true
        }
    }

    if (!roomFound) {
        rooms.push({ name: roomName });
        generalInfo.emit("roomInfo", rooms);
        return 1;
    } else {
        return null;
    }
}

function closeRoom(roomName) {
    let roomFound = false;
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].name == roomName) {
            roomFound = true
        }
    }

    if (roomFound) {
        rooms.splice(getRoom(roomName), 1);
        generalInfo.emit("roomInfo", rooms);
        return 1;
    } else {
        return null;
    }
}
function getRoom(name) {
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].name == name) {
            return i;
        }
    }
    return null;
}
function getUser(id) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == id) {
            return i;
        }
    }
    return null;
}

// io.on('connection', function (socket) {
//     console.log('Someone connected');
// });

/*var nsp = io.of('/burak');
nsp.on('connection', function (socket) {
    console.log('someone connected to ' + socket.nsp.name);
    socket.join('some room');
    socket.join('some room2');
    // synchronousSpam(socket, 111);
});*/

var synchronousSpam = (socket, length, i) => {
    if (i === undefined) {
        i = 0;
    }

    var promise1 = new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve('foo');
        }, 30);
    });

    promise1.then(function (value) {
        socket.emit('def', socket.nsp.name + ' ' + i);
        if (i < length) {
            synchronousSpam(socket, length, i + 1);
        }
    });
}

http.listen(827, () => {

});