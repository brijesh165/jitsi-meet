const moment = require('moment');
const appUtil = require('./../util/app-util');
const models = require('./../models');

/**
 * to create meetings
 * @param {*} meeting_host 
 * @param {*} res 
 */
exports.createMeeting = async (req, res) => {
    try {
        console.log("Create Meeting Params: ", req.body);
        let response = {};
        const currentTimeStamp = moment().utc().unix().toString();
        const createmeetingparams = {
            meeting_id: currentTimeStamp.slice(0, 10),
            status: "pending"
        }

        const createdMeeting = await models.meetinglist.create(createmeetingparams);

        await models.meeting_logs.create({
            meeting_id: createdMeeting.meeting_id,
            log_type: "create_meeting",
            log_description: `Meeting created by ${req.body.meeting_host} and parameters are ${JSON.stringify(createmeetingparams)}`
        })

        const encryptedMeetingforstart = appUtil.encryptMeetingId(createdMeeting.meeting_id, "start");
        const encryptedMeetingforjoin = appUtil.encryptMeetingId(createdMeeting.meeting_id, "join");
        response.start_url = `${process.env.URL}:${process.env.HTTPS_PORT}/join/${encryptedMeetingforstart}`;
        response.join_url = `${process.env.URL}:${process.env.HTTPS_PORT}/join/${encryptedMeetingforjoin}`;

        console.log("Response: ", response);

        return res.send({
            status: "ok",
            message: "",
            webpage: "",
            response: {
                meeting_id: createmeetingparams.meeting_id,
                start_url: response.start_url,
                join_url: response.join_url
            }
        })
    } catch (err) {
        console.log("Error: ", err);
    }
}

/**
 * For getting meeting status of a meeting
 * @param {*} meeting_id
 */
exports.getMeetingInfo = async (req, res) => {
    try {

        const params = {
            meeting_id: req.body.meeting_id
        };

        const meetingInfo = await models.meetinglist.getMeetingByMeetingId(params);
        // console.log("Meeting Info: ", meetingInfo);

        if (meetingInfo == null) {
            return res.send({
                status: "error",
                message: "Invalid meeting id. Please try with valid meeting id.",
                webpage: "",
                response: ""
            })
        }

        return res.send({
            status: "ok",
            message: "",
            webpage: "",
            response: meetingInfo
        })
    } catch (error) {
        console.log("Meeting Controller || Create Meeting", error);
        return res.send({
            status: "error",
            message: "Internal server error. Please try again.",
            webpage: "",
            response: ""
        })
    }
}

/**
 * To start meeting from URL
 */
exports.startMeeting = async (req, res) => {
    try {
        const queryParams = req.params.id;
        const meeting_id = appUtil.decryptMeetingId(queryParams).split("-")[0];
        const userstatus = appUtil.decryptMeetingId(queryParams).split("-")[1];

        const meeting = await models.meetinglist.findOne({
            where: {
                meeting_id: meeting_id
            }
        });

        if (!meeting) {
            // console.log("Condition True", `${process.env.REDIRECT_URL}/errorpage?${meeting_id}`);
            return res.redirect(`${process.env.REDIRECT_URL}/errorpage?${meeting_id}`)
        }

        if (userstatus == "start") {
            await models.meetinglist.update({ status: "started" }, {
                where: {
                    meeting_id: meeting_id
                }
            });

            return res.redirect(`${process.env.REDIRECT_URL}/${meeting.meeting_id}?host=true`)

            // if (meeting && meeting.meeting_type == "nonperiodic") {
            //     if (moment(meeting.end_time).valueOf() > moment().utc().toDate().getTime().valueOf()) {
            //         await models.meetinglist.update({ status: "started", actual_start_time: moment().utc().toDate() }, {
            //             where: {
            //                 meeting_id: meeting_id
            //             }
            //         });

            //         return res.redirect(`${process.env.REDIRECT_URL}/${meeting.meeting_id}?host=true`)
            //     } else {
            //         return res.redirect(`${process.env.REDIRECT_URL}/endmeeting`)
            //     }
            // } else if (meeting && meeting.meeting_type == "periodic") {
            //     if (moment(meeting.repeat_end_date).valueOf() > moment().utc().toDate().valueOf()) {
            //         const check = meetingStatusCheck(meeting)

            //         if (check) {
            //             await models.meetinglist.update({ status: "started", actual_start_time: moment().utc().toDate() }, {
            //                 where: {
            //                     meeting_id: meeting_id
            //                 }
            //             });
            //             return res.redirect(`${process.env.REDIRECT_URL}/${meeting.meeting_id}?host=true`)
            //         } else {
            //             return res.redirect(`${process.env.REDIRECT_URL}/endmeeting`)
            //         }
            //     } else {
            //         return res.redirect(`${process.env.REDIRECT_URL}/endmeeting`)
            //     }
            // } else {
            //     return res.redirect(`${process.env.REDIRECT_URL}/errorpage?${meeting.meeting_id}`);
            // }

        } else if (userstatus == "join") {
            if (meeting.status == "started") {
                return res.redirect(`${process.env.REDIRECT_URL}/${meeting.meeting_id}`)
            } else {
                return res.redirect(`${process.env.REDIRECT_URL}/waiting/${meeting_id}`);
            }

            // if (meeting && meeting.meeting_type == "nonperiodic") {
            //     // console.log("In Non periodic meeting");
            //     if (meeting.status == "started") {
            //         // console.log("If Meeting ID: ", meeting.meeting_id)

            //         return res.redirect(`${process.env.REDIRECT_URL}/${meeting.meeting_id}`)
            //     } else if (meeting.status == "ended") {
            //         return res.redirect(`${process.env.REDIRECT_URL}/endmeeting`)
            //     } else {
            //         // console.log("Else Meeting ID: ", meeting_id)
            //         return res.redirect(`${process.env.REDIRECT_URL}/waiting/${meeting_id}`);
            //     }
            // }

            // if (meeting && meeting.meeting_type == "periodic") {
            //     // console.log("In Periodic meeting");
            //     if (meeting.status == "started"
            //         && moment(meeting.repeat_end_date).valueOf() > moment().utc().toDate().valueOf()) {
            //         // console.log("Repeat event until: ", meeting.repeat_event_until)
            //         const check = meetingStatusCheck(meeting)

            //         if (check) {
            //             return res.redirect(`${process.env.REDIRECT_URL}/${meeting.meeting_id}`)
            //         } else {
            //             return res.redirect(`${process.env.REDIRECT_URL}/waiting/${meeting.meeting_id}`)
            //         }

            //     } else {
            //         return res.redirect(`${process.env.REDIRECT_URL}/waiting/${meeting.meeting_id}`)
            //     }
            // }
        }

    } catch (error) {
        console.log("Meeting Controller || Start Meeting", error);
        return res.json({
            code: 401,
            message: "Something went wrong! Please try again.",
            webpage: "",
            response: ""
        })
    }
}

/**
 * 
 * @param {*} meeting_id 
 * @param {*} status
 * @param {*} authkey (optional)
 */
exports.changeMeetingStatus = async (req, res) => {
    try {
        // console.log("Change Meeting Status Params : ", req.body);
        // const keyStatus = await axios.post("https://webservice.teamlocus.com/ChatBotService.svc/chatbotauthorize", { authkey: req.body.authkey });
        // console.log("Key Status: ", keyStatus.data);
        let meetingDetails = await models.meetinglist.getMeetingByMeetingId({ meeting_id: req.body.meeting_id });
        // console.log("Meeting Details: ", meetingDetails);
        // if (keyStatus.data.status == "ok") {
        if (req.body.status == "started") {
            // console.log("Started");
            const params = {
                status: req.body.status,
                meeting_id: req.body.meeting_id
            }
            await models.meetinglist.changeMeetingStatusByMeetingId(params);

            return res.send({
                status: "ok",
                message: "",
                webpage: "",
                response: meetingDetails
            })
        }
        else if (req.body.status == "ended") {
            // console.log("Meeting Details: ", meetingDetails)
            // console.log("Ended");
            if (meetingDetails.meeting_type === "periodic") {
                // console.log("Periodic");
                const params = {
                    status: "pending",
                    meeting_id: req.body.meeting_id
                }

                await models.meetinglist.changeMeetingStatusByMeetingId(params);

            } else if (meetingDetails.meeting_type === "onetime") {
                // console.log("one time");
                const params = {
                    status: req.body.status,
                    meeting_id: req.body.meeting_id
                }

                await models.meetinglist.changeMeetingStatusByMeetingId(params);
            } else if (meetingDetails.meeting_type === "nonperiodic") {
                // console.log("Non Periodic");
                const params = {
                    status: req.body.status,
                    meeting_id: req.body.meeting_id
                }

                await models.meetinglist.changeMeetingStatusByMeetingId(params);
            }

            socketManager.emitOnDisconnect("end_meeting", req.body.meeting_id);

            return res.send({
                status: "ok",
                message: "",
                webpage: "",
                response: ""
            })
        }
        else if (req.body.status == "pending") {
            const params = {
                status: req.body.status,
                meeting_id: req.body.meeting_id
            }

            await models.meetinglist.changeMeetingStatusByMeetingId(params);

            return res.send({
                status: "ok",
                message: "",
                webpage: "",
                response: ""
            })
        }
        // }
        else {
            return res.send({
                status: keyStatus.data.status,
                message: keyStatus.data.message,
                webpage: keyStatus.data.webpage,
                response: keyStatus.data.response
            })
        }
    } catch (error) {
        console.log("Meeting Controller || Change Meeting Status", error);
        return res.send({
            status: "error",
            message: "Internal server error. Please try again.",
            webpage: "",
            response: ""
        })
    }
}