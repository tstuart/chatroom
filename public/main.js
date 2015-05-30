

$(document).ready(function() {

    // prompt for nickname and set to socket
    var nickName = null;
    while (!nickName) {
        nickName = window.prompt("Please enter your nickname:", "");
    }

    var socket = io();
    socket.emit('regUser', nickName);

    var input = $('input');
    var messages = $('#messages');
    var clientCount = $('#clientCount');

    // add message to message area
    var addMessage = function(message) {
        messages.append('<div>' + message + '</div>');
    };

    // update client count
    var updClients = function(clients) {
        clientCount.html('Connected Clients = ' + Object.keys(clients).length);

        $("ul").empty();
        var html = "";
        for(var index in clients) {
            if (clients.hasOwnProperty(index)) {
                html += "<li>" + clients[index] + "</li>";
            }
        }
        $("ul").html(html);
    };


    socket.on('message', addMessage);
    socket.on('clientsChanged', updClients);

    input.on('keydown', function(event) {
        if (event.keyCode != 13) {
            return;
        }

        var message = input.val();
        addMessage(message);
        socket.emit('message', message);
        input.val('');
    });
});