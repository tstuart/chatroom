

var socket_io = require('socket.io');
var http = require('http');
var express = require('express');
var app = express();

app.use(express.static('public'));
var server = http.Server(app);
var io = socket_io(server);

// keep copy of connected clients
// use socket id, and nickName
var clients = new Object();

io.on('connection', function (socket) {

    // do whatever when a client connects

    socket.on('regUser', function(nickName) {
        clients[socket.id] = nickName;
        socket.broadcast.emit('message', nickName + ' has connected.');
        io.emit('clientsChanged', clients);

    });

    socket.on('message', function(message) {
        console.log('Received Message:', message);
        socket.broadcast.emit('message', message);
    });

    socket.on('disconnect', function() {
        var nickName = clients[socket.id];
        delete clients[socket.id];
        socket.broadcast.emit('message', nickName + ' has disconnected.');
        io.emit('clientsChanged', clients);
    });
});

server.listen(8080);

