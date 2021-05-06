const models = require('./../models');
const moment = require('moment');

let socketIO;


exports.openIO = function (io) {
    socketIO = io;
    let meetingSockets = {};
    let endMeeingSocket = [];

    setInterval(() => {
        if (endMeeingSocket.length > 0) {
            for (let i = 0; i < endMeeingSocket.length; i++) {
                if (moment.utc() >= moment(endMeeingSocket[i].disconnectionTime, 'x').add('15', 'seconds')) {
                    socketIO.to(endMeeingSocket[i].meetingId).emit("end_meeting", {
                        "meetingId": endMeeingSocket[i].meetingId
                    })

                    models.meeting.update({ status: "ended", actual_end_time: moment().utc().toDate().valueOf() }, {
                        where: {
                            meeting_id: endMeeingSocket[i].meetingId
                        }
                    });
                    endMeeingSocket.splice(i, 1);
                }
            }
        }
    }, 1000)

    io.on('connection', function (socket) {
        // socket.on("hangup", async (data) => {
        //     console.log("Socket Hangup: ", data)
        //     if (data.meeting_id != null && data.meeting_id.length > 0) {
        //         await models.meeting.update({ status: "ended", actual_end_time: moment().utc().toDate().valueOf() }, {
        //             where: {
        //                 meeting_id: data.meeting_id
        //             }
        //         });
        //         socketIO.emit("end_meeting", { "meeting_id": data.meeting_id });
        //     }

        // })

        socket.on("joinMeeting", (data) => {
            console.log("Join meetings: ", data, socket.id);
            socket.isHost = data.role;
            socket.meetingId = data.meetingId;

            if (data.role === "host") {
                meetingSockets[data.meetingId] = socket.id;

                // push meeting into into endMeetingSocket array
                endMeeingSocket = endMeeingSocket.filter(item => {
                    item.meetingId != data.meetingId
                })
            }

            models.meeting_logs.create({
                meeting_id: data.meetingId,
                log_type: "join_meeting",
                log_description: `${data.username} joined Meeting. Role is ${data.role}.`
            })

            socket.join(data.meetingId)
        })

        socket.on("roleChange", (data) => {
            console.log("Role Change: Meeting Socket: ", data, socket.id, meetingSockets);
            if (data.role === "host") {
                meetingSockets[data.meetingId] = socket.id;
            }
            // meetingSockets.push({ isHost: data.role, meetingId: data.meetingId })
        })

        socket.on("add_log", (data) => {
            console.log("Add Log Socket: ", data);
            models.meeting_logs.create({ 
                meeting_id: data.meeting_id,
                log_type: data.log_type,
                log_description: data.log_description
            })
        })

        socket.on("disconnect", () => {
            console.log("Disconnect", socket.isHost, socket.id)
            if (meetingSockets[socket.meetingId] == socket.id) {
                endMeeingSocket.push({
                    "meetingId": socket.meetingId,
                    "disconnectionTime": moment.utc()
                })
                console.log("End Meeting Socket: ", endMeeingSocket)

                // socketIO.to(socket.meetingId).emit("end_meeting", {
                //     "meetingId": socket.meetingId
                // })
            }
        });

        console.log(`Socket Connection successful ${socket.id}`);
    })
}

exports.emitOnDisconnect = function (topic, message) {
    console.log("Emit Socket on disconnect: ", message);
    socketIO.to(message).emit(topic, {
        "meetingId": message
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