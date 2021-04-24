const models = require('./../models');
const moment = require('moment');

let socketIO;

exports.openIO = function (io) {
    socketIO = io;
    let isHost;
    let meetingId;
    
    io.on('connection', function (socket) {
        socket.on("hangup", async (data) => {
            console.log("Socket Hangup: ", data)
            if (data.meeting_id != null && data.meeting_id.length > 0) {
                await models.meeting.update({ status: "ended", actual_end_time: moment().utc().toDate().valueOf() }, {
                    where: {
                        meeting_id: data.meeting_id
                    }
                });
                socketIO.emit("end_meeting", { "meeting_id": data.meeting_id });
            }
    
        })

        socket.on("isHost", async (data) => {
            console.log("IsHost Data: ", data)
            isHost = data.role;
            meetingId = data.meeting_id;

            console.log("isHost: ", isHost);
            console.log("meetingId: ", meetingId);
        });

        socket.on("disconnect", () => {
            console.log("Socket closed", isHost, meetingId);
            socket.emit("end_meeting", {
                "role": isHost,
                "meetingId": meetingId
            })
        });

        console.log(`Socket Connection successful ${socket.id}`);
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