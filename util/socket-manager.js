const models = require('./../models');

let socketIO;

exports.openIO = function (io) {
    socketIO = io;
    let meeting_id;

    io.on('connection', async function (socket) {
        socket.on("hangup", (data) => {
            meeting_id = data.meeting_id
        })

        if (meeting_id !== null || meeting_id !== '') {
            await models.meeting.update({ status: "ended", actual_end_time: moment().utc().toDate().valueOf() }, {
                where: {
                    id: meeting.id
                }
            });

            socket.emit("end_meeting", { "meeting_id": meeting_id });
        }
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