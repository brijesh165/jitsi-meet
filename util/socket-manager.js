let socketIO;

exports.openIO = function(io) {
    socketIO = io;

    io.on('connection', function(socket) {
        console.log('Socket Connection successful.');
    })
}

exports.emit = function (topic, message, to = null) {
    if (to) {
        socketIO.to(to).emit(topic, message);
    } else {
        socketIO.emit(topic, message);
        console.log('Socket Emmited : ', topic, message);
    }
}

exports.getIO = function() {
    return socketIO;
}