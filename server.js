

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

// get client id by nickname
var getClientID = function(nickName) {
    var id = null;
    for(var index in clients) {
        if (clients.hasOwnProperty(index)) {
            if (clients[index] === nickName) {
                id = index;
                break;
            }
        }
    }
    return id;
};

io.on('connection', function (socket) {

    // to handle nick name support, clients will
    // emit 'regUser' event after getting nick name
    // from user.  This handler will add client to
    // our list of clients.
    socket.on('regUser', function(nickName) {
        clients[socket.id] = nickName;
        socket.broadcast.emit('message', nickName + ' has connected.');
        io.emit('clientsChanged', clients);

    });

    // This will execute any time a client sends a message
    socket.on('message', function(message) {

        // get nickName of sender
        var nickNameSender = clients[socket.id];

        // determine if this is a private message
        // it is a private message if the message
        // is in pm|{nickname}|{message} format
        var args = message.split('|');
        if (args.length === 3 && args[0] === 'pm') {
            // get socket associated with nickname
            // if there is no associated socket,
            // server will ignore message.
            var socketID = getClientID(args[1]);
            if (socketID) {
                io.sockets.connected[socketID].emit('message', nickNameSender + ': ' + args[2]);
            }
        } else {
            // this is not a private message, emit as normal
            socket.broadcast.emit('message', nickNameSender + ': ' + message);
        }
    });

    // this will execute when a client disconnects
    socket.on('disconnect', function() {
        if (!clients[socket.id]) {
            return;
        }
        var nickName = clients[socket.id];
        delete clients[socket.id];
        socket.broadcast.emit('message', nickName + ' has disconnected.');
        io.emit('clientsChanged', clients);
    });

    // this will execute when a client socket emits a keydown event
    // simply emit this event back to other clients.  This will be
    // use to add {user} is typing functionality
    socket.on('keydown', function() {
        var nickName = clients[socket.id];
        socket.broadcast.emit('keydown', nickName);
    });

    // this will execute when a client socket emits a keyup event
    // simply emit this event back to other clients.  This will be
    // use to add {user} is typing functionality
    socket.on('keyup', function() {
        socket.broadcast.emit('keyup');
    });

});

server.listen(8080);

