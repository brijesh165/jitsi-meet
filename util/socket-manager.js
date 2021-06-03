const models = require('./../models');
const moment = require('moment');

let socketIO;


exports.openIO = function (io) {
    socketIO = io;
    let meetingSockets = {};
    let endMeeingSocket = [];

    // setInterval( async () => {
    //     if (endMeeingSocket.length > 0) {
    //         for (let i = 0; i < endMeeingSocket.length; i++) {
    //             if (moment.utc() >= moment(endMeeingSocket[i].disconnectionTime, 'x').add('10', 'seconds')) {
    //                 socketIO.to(endMeeingSocket[i].meetingId).emit("end_meeting", {
    //                     "meetingId": endMeeingSocket[i].meetingId
    //                 })

    //                 await models.meeting.update({ status: "ended", actual_end_time: moment().utc().toDate() }, {
    //                     where: {
    //                         meeting_id: endMeeingSocket[i].meetingId
    //                     }
    //                 });

    //                 await models.meeting_logs.create({
    //                     meeting_id: endMeeingSocket[i].meetingId,
    //                     log_type: "end_meeting",
    //                     log_description: `Ended Meeting. Because host failed to connect in 10 seconds.`
    //                 })

    //                 endMeeingSocket.splice(i, 1);
    //             }
    //         }
    //     }
    // }, 1000)

    io.on('connection', function (socket) {
        socket.on("joinMeeting", (data) => {
            console.log("Join meetings: ", data, socket.id);
            socket.isHost = data.role;
            socket.meetingId = data.meetingId;
            socket.username = data.username;

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
                socket.isHost = data.role;
                socket.username = data.username;            

                models.meeting_logs.create({ 
                    meeting_id: data.meetingId,
                    log_type: "role_change",
                    log_description: `Meeting Host changed for ${data.meetingId}. New Host is ${data.username}`
                })
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

        socket.on("end_meeting", () => {
            meetingSockets[socket.meetingId] = null;
        })

        socket.on("disconnect", () => {
            console.log("Disconnect", socket.isHost, socket.id)
            if (socket.isHost == "host" && meetingSockets[socket.meetingId] == socket.id) {
                socketIO.to(socket.meetingId).emit("end_meeting", {
                    "meetingId": socket.meetingId
                }) 
                
                models.meeting.update({ status: "ended", actual_end_time: moment().utc().toDate() }, {
                    where: {
                        meeting_id: socket.meetingId
                    }
                });

                console.log("End Meeting Socket emit at disconnect");
            }

            models.meeting_logs.create({
                meeting_id: socket.meetingId,
                log_type: "disconnect_user_socket",
                log_description: `Socket disconnect for ${socket.username}.`
            })
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