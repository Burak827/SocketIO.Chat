var app = require('express')();
var http = require('http');
http = http.Server(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

io.on('connection', function (socket) {
    console.log('Someone connected');
    socket.on("haydar", (msg) => {
        socket.emit("haydar", msg);
    });
});

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