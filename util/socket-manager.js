const models = require('./../models');
const moment = require('moment');

let socketIO;

exports.openIO = function (io) {
    socketIO = io;

    io.on('connection', async function (socket) {
        socket.on("hangup", (data) => {
            if (data.meeting_id != null && data.meeting_id.length > 0) {
                await models.meeting.update({ status: "ended", actual_end_time: moment().utc().toDate().valueOf() }, {
                    where: {
                        id: data.meeting_id
                    }
                });
    
                socket.emit("end_meeting", { "meeting_id": data.meeting_id });
            }
    
        })

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

exports.getIO = function () {
    return socketIO;
}