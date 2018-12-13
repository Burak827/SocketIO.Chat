var app = require('express')();
var http = require('http');
http = http.Server(app);
var io = require('socket.io')(http);

app.set('view engine', 'pug')
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

var generalInfo = io.of("/generalInfo");

var users = [];

io.on('connection', (socket) => {
    console.log(socket.client.id + " connected");
    users.push({ id: socket.client.id, name : socket.client.id });
    generalInfo.emit("userInfo", users);

    socket.on('disconnect', () => {
        console.log(socket.client.id + " disconnected");
        users.pop(getUser(socket.client.id));
        generalInfo.emit("userInfo",users);
    });
});




function getUser(id){
    for(let i = 0;i<users.length;i++){
        if(users[i].id==id){
            return i;
        }else {
            return null;
        }
    }
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

// var synchronousSpam = (socket, length, i) => {
//     if (i === undefined) {
//         i = 0;
//     }

//     var promise1 = new Promise(function (resolve, reject) {
//         setTimeout(function () {
//             resolve('foo');
//         }, 30);
//     });

//     promise1.then(function (value) {
//         socket.emit('def', socket.nsp.name + ' ' + i);
//         if (i < length) {
//             synchronousSpam(socket, length, i + 1);
//         }
//     });
// }

http.listen(827, () => {

});