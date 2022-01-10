const moment = require('moment');
const appUtil = require('./../util/app-util');
const socketManager = require('./../util/socket-manager');

const models = require('./../models');
const CryptoJS = require("crypto-js");

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
            // meeting_id: "1620149168",
            status: req.body.status ? req.body.status : "pending"
        }

        const createdMeeting = await models.meetinglist.create(createmeetingparams);
        console.log("Meeting Id: ", createdMeeting.meeting_id)
        await models.meeting_logs.create({
            meeting_id: createdMeeting.meeting_id,
            log_type: "create_meeting",
            log_description: `Meeting created by ${req.body.meeting_host} and parameters are ${JSON.stringify(createmeetingparams)}`
        })

        const encryptedMeetingforstart = CryptoJS.AES.encrypt(createdMeeting.meeting_id, "tlmeet-with-teamlocus");
        // const encryptedMeetingforjoin = appUtil.encryptMeetingId(createdMeeting.meeting_id, "join");
        // response.start_url = `${process.env.URL}:${process.env.HTTPS_PORT}/start/${createdMeeting.meeting_id}/?${encryptedMeetingforstart}`;
        // response.join_url = `${process.env.URL}:${process.env.HTTPS_PORT}/join/${createdMeeting.meeting_id}`;
        response.start_url = `${process.env.URL}/start/${createdMeeting.meeting_id}/?${encryptedMeetingforstart}`;
        response.join_url = `${process.env.URL}/join/${createdMeeting.meeting_id}`;

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

        console.log("Get Meeting Info: ", req.body);
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
 * To check meeting status
 * @param {*} meetingId 
 * @returns 
 */
exports.checkMeetingStatus = async (req, res) => {
    try {
        console.log("Meeting ID: ", req.body)
        const params = {
            meeting_id: req.body.meeting_id
        }

        const meeting = await models.meetinglist.getMeetingByMeetingId(params);

        if (meeting.length == 0) {
            return res.send({
                status: 201,
                message: "Invalid Meeting Id!"
            })
        }

        return res.send({
            status: 200,
            message: "",
            webpage: "",
            meetings: meeting
        })
    } catch (error) {
        console.log("MeetingList Controller || Check Meeting Status", error);
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
            return res.redirect(`${process.env.REDIRECT_URL}/errorpage?${meeting_id}`)
        }

        if (userstatus == "start") {
            await models.meetinglist.update({ status: "started" }, {
                where: {
                    meeting_id: meeting_id
                }
            });

            return res.redirect(`${process.env.REDIRECT_URL}/${meeting.meeting_id}?host=true`)
        } else if (userstatus == "join") {
            if (meeting.status == "started") {
                return res.redirect(`${process.env.REDIRECT_URL}/j/${meeting.meeting_id}`)
            } else {
                return res.redirect(`${process.env.REDIRECT_URL}/waiting/${meeting_id}`);
            }
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
 * @param {*} allow_all 
 */
exports.changeAllowAll = async (req, res) => {
    try {
        let meetingDetails = await models.meetinglist.getMeetingByMeetingId({ meeting_id: req.body.meeting_id });
        const params = {
            allow_all: req.body.allow_all,
            meeting_id: req.body.meeting_id
        }
        await models.meetinglist.changeAllowAllByMeetingId(params);

        return res.send({
            status: "ok",
            message: "",
            webpage: "",
            response: meetingDetails
        })
    } catch (error) {
        console.log("Meeting Controller || Change Allow All Status", error);
        return res.send({
            status: "error",
            message: "Internal server error. Please try again.",
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
        // const keyStatus = await axios.post("https://webservice.teamlocus.com/ChatBotService.svc/chatbotauthorize", { authkey: req.body.authkey });
        // console.log("Key Status: ", keyStatus.data);
        let meetingDetails = await models.meetinglist.getMeetingByMeetingId({ meeting_id: req.body.meeting_id });
        // console.log("Meeting Details: ", meetingDetails);
        // if (keyStatus.data.status == "ok") {

        const params = {
            status: req.body.status,
            allow_all: false,
            meeting_id: req.body.meeting_id
        }
        console.log("Change Meeting Status Params : ", req.body, params);

        await models.meetinglist.changeMeetingStatusByMeetingId(params);

        if (req.body.status === "pending") {
            socketManager.emitOnDisconnect("end_meeting", req.body.meeting_id);
        }

        return res.send({
            status: "ok",
            message: "",
            webpage: "",
            response: meetingDetails
        })
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