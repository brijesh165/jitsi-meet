const models = require('./../models');
const moment = require('moment');

let socketIO;

function delay(t, val) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(val);
        }, t);
    });
}

exports.openIO = function (io) {
    socketIO = io;
    let meetingSockets = {};
    let endMeeingSocket = [];
    let joinMeetingSocket = {};

    setInterval(async () => {
        if (endMeeingSocket.length > 0) {
            for (let i = 0; i < endMeeingSocket.length; i++) {
                if (moment.utc() >= moment(endMeeingSocket[i].disconnectionTime, 'x').add('10', 'seconds')) {
                    socketIO.to(endMeeingSocket[i].meetingId).emit("end_meeting", {
                        "meetingId": endMeeingSocket[i].meetingId
                    })

                    await models.meetinglist.update({ status: "pending", allow_all: false, actual_end_time: moment().utc().toDate() }, {
                        where: {
                            meeting_id: endMeeingSocket[i].meetingId
                        }
                    });

                    await models.meeting_logs.create({
                        meeting_id: endMeeingSocket[i].meetingId,
                        log_type: "end_meeting",
                        log_description: `Ended Meeting. Because host failed to connect in 10 seconds.`
                    })

                    endMeeingSocket.splice(i, 1);
                }
            }
        }
    }, 1000)

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
        })

        socket.on("add_log", (data) => {
            console.log("Add Log Socket: ", data);
            models.meeting_logs.create({
                meeting_id: data.meeting_id,
                log_type: data.log_type,
                log_description: data.log_description
            })
        })

        // Socket for waiting room
        socket.on('joinSocket', (data) => {
            console.log(`Join Socket Data :`, data)
            const { meetingId, username } = data;
            socket.meetingId = meetingId;

            socket.socketId = socket.id;

            let findId = Object.keys(joinMeetingSocket).find((item) => item === meetingId);
            console.log("Find Id: ", findId);

            if (findId) {
                console.log("Join Meeting Members: ", joinMeetingSocket[meetingId]);
                if (joinMeetingSocket[meetingId].allow_all) {
                    joinMeetingSocket[meetingId].members.push({ id: socket.id, name: username, allowed: true });
                    // console.log('Test ----------------------------------------------------- \n', joinMeetingSocket[meetingId].members)
                    socketIO.to(socket.socketId).emit('allowOneTrue');
                    // joinMeetingSocket[data.meetingId].members = [];
                } else {
                    joinMeetingSocket[meetingId].members.push({ id: socket.id, name: username, allowed: false })
                    io.emit("person_waiting", {
                        "meetingId": data.meetingId,
                        "username": data.username,
                        "role": "participant",
                        "id": socket.socketId,
                    });
                }
            } else {
                joinMeetingSocket[meetingId] = {
                    members: [{ id: socket.id, name: username, allowed: false }],
                    allow_all: false
                }
                io.emit("person_waiting", {
                    "meetingId": data.meetingId,
                    "username": data.username,
                    "role": "participant",
                    "id": socket.socketId,
                });
            }

            console.log(`joinMeetingSocket :`, joinMeetingSocket, "\n Members :", joinMeetingSocket[meetingId].members, "\n Socket id :", socket.id)
        })

        socket.on('allowOne', (data) => {
            console.log('allowOne :', data);
            // const allowedMember = joinMeetingSocket[data.meetingId].members.length > 0 ? joinMeetingSocket[data.meetingId].members.find((item) => item.id == data.socketId) : false;
            // console.log("Allowed Member: ", allowedMember);

            // if (allowedMember) {
            //     const afterRemove = joinMeetingSocket[data.meetingId].members.filter((item) => item.id !== data.socketId);
            //     console.log("After Remove: ", afterRemove);
            //     joinMeetingSocket[data.meetingId].members = afterRemove;
            // }
            const allowedMember = joinMeetingSocket[data.meetingId].members.find((item) => item.id === data.socketId);
            allowedMember.allowed = true;

            console.log("Join Meeting Socket: ", joinMeetingSocket[data.meetingId]);
            console.log("Allow One Join Socket: ", joinMeetingSocket[data.meetingId].members);
            socketIO.to(data.socketId).emit('allowOneTrue', data)

        })

        socket.on('AllowAllfromWaiting', (data) => {
            console.log("from WaitingList", data, joinMeetingSocket[data.meetingId].members.length)

            if (data.allow_all && joinMeetingSocket[data.meetingId].members.length > 0) {
                for (let i = 0; i < joinMeetingSocket[data.meetingId].members.length; i++) {
                    joinMeetingSocket[data.meetingId].members[i].allowed = true;
                    // console.log('Allow All Without Waiting:', joinMeetingSocket[data.meetingId].members);
                    socketIO.to(joinMeetingSocket[data.meetingId].members[i].id).emit('allowOneTrue')
                }
                // joinMeetingSocket[data.meetingId].members = [];
                joinMeetingSocket[data.meetingId].allow_all = true;
            } else {
                for (let i = 0; i < joinMeetingSocket[data.meetingId].members.length; i++) {
                    joinMeetingSocket[data.meetingId].members[i].allowed = true;
                    // console.log('Allow All :', joinMeetingSocket[data.meetingId].members);
                    socketIO.to(joinMeetingSocket[data.meetingId].members[i].id).emit('allowOneTrue')
                }
                // joinMeetingSocket[data.meetingId].members = [];
            }
        })

        socket.on('kickout', (data) => {
            console.log("Kick out: ", data);
            socketIO.to(data.socketId).emit("end_meeting", {
                "meetingId": data.meetingId
            })
        })

        socket.on('CheckWaitList', (data) => {
            console.log("--------------- CheckWaitList All Users : --------------- \n", joinMeetingSocket[data.meetingId])
            if (joinMeetingSocket[data.meetingId] !== undefined) {
                if (joinMeetingSocket[data.meetingId].members.length > 0) {
                    socketIO.to(socket.id).emit('WaitingMembers', joinMeetingSocket[data.meetingId].members)
                } else {
                    socketIO.to(socket.id).emit('WaitingMembers', 'blank');
                }
            }
        })

        socket.on('backToWaiting', (data) => {
            console.log('backToWaiting :', data);
            const allowedMember = joinMeetingSocket[data.meetingId].members.find((item) => item.id === data.socketId);
            allowedMember.allowed = false;

            socketIO.to(data.socketId).emit('sendToWaiting', data)
        })

        socket.on('end_meeting_for_waiting_member', (data) => {
            console.log('end_meeting_for_waiting_member :', data);
            socketIO.emit('end_meeting_for_waiting_member', data);
        })

        socket.on('reconnectUser', (data) => {
            console.log('reconnectUser :', data);
            const { meetingId, username } = data;
            socket.meetingId = meetingId;
            socket.socketId = socket.id;
            joinMeetingSocket[meetingId].members.push({ id: socket.id, name: username, allowed: true });
            const UniqueIdMembers = joinMeetingSocket[meetingId].members.length > 0 && joinMeetingSocket[meetingId].members.filter((item) => item.id !== socket.id);
            const SameMembers = joinMeetingSocket[meetingId].members.length > 0 && joinMeetingSocket[meetingId].members.filter((item) => item.id !== socket.id);
            // if (UniqueIdMembers) {
            //     joinMeetingSocket[socket.meetingId].members = UniqueIdMembers;
            // }
            console.log('UniqueIdMembers :', UniqueIdMembers, '\nSame Members :', SameMembers);
        })

        socket.on("disconnect", async () => {
            console.log("Disconnect", socket.isHost, meetingSockets, socket.meetingId, socket.id)

            if (socket.isHost != "host" && socket.meetingId) {
                try {
                    if (joinMeetingSocket[socket.meetingId] != null) {
                        const afterremoverdParticipant = joinMeetingSocket[socket.meetingId].members.length > 0 && joinMeetingSocket[socket.meetingId].members.filter((item) => item.id !== socket.id);
                        console.log("Removed Participant: ", afterremoverdParticipant);

                        if (afterremoverdParticipant) {
                            joinMeetingSocket[socket.meetingId].members = afterremoverdParticipant;
                        }
                    }
                } catch (e) {
                    console.log("Error: ", e)
                }
            }

            if (socket.isHost == "host" && meetingSockets[socket.meetingId] == socket.id) {
                console.log("Socket Meeting Id: ", socket.meetingId);

                socketIO.to(socket.meetingId).emit("end_meeting", {
                    "meetingId": socket.meetingId
                })

                await delay(1000);
                socketIO.to(socket.meetingId).emit("end_meeting", {
                    "meetingId": socket.meetingId
                })

                await delay(1000);
                socketIO.to(socket.meetingId).emit("end_meeting", {
                    "meetingId": socket.meetingId
                })

                delete joinMeetingSocket[socket.meetingId];

                await models.meetinglist.changeMeetingStatusByMeetingId({
                    status: "pending",
                    allow_all: false,
                    meeting_id: socket.meetingId
                });

                console.log("End Meeting Socket emit at disconnect");
            }

            // models.meeting_logs.create({
            //     meeting_id: socket.meetingId,
            //     log_type: "disconnect_user_socket",
            //     log_description: `Socket disconnect for ${socket.username}.`
            // })
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