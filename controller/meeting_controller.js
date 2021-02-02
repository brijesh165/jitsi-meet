const moment = require('moment');
const appUtil = require('./../util/app-util');
const constants = require('./../util/constants');
const models = require('./../models');

/**
 * 
 * @param {*} meeting_id 
 */
exports.getMeeting = async (params, cb) => {
    try {
        console.log("Get Meeting Params : ", params);
        let response = {};
        // let meeting_id = appUtil.decryptMeetingId(params.meeting_id).split("-")[0];

        const meeting = await models.meeting.findAll({
            where: {
                meeting_id: params.meeting_id
            }
        });

        console.log("Meeting: ", meeting);
        response.meeting_details = meeting;
        const encryptedMeetingforstart = appUtil.encryptMeetingId(meeting[0].dataValues.meeting_id, "start");
        const encryptedMeetingforjoin = appUtil.encryptMeetingId(meeting[0].dataValues.meeting_id, "join");

        console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforstart));
        console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforjoin));
        response.start_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforstart}`;
        response.join_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforjoin}`;

        if (!meeting.length) {
            return cb(null, appUtil.createErrorResponse({
                code: 400,
                message: "Invalid meeting id. Please try with valid meeting id."
            }))
        }

        return cb(null, appUtil.createSuccessResponse(constants.responseCode.SUCCESS, meeting));
    } catch (error) {
        console.log("Meeting Controller || Create Meeting", error);
        return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
    }
}

exports.getMeetingInfo = async (params, cb) => {
    try {
        console.log("Params: ", params);

        const meetingInfo = await models.meeting.findOne({
            where: {
                id: params.meeting_id
            }
        });
        // console.log("Meeting Info: ", meetingInfo);
        return cb(null, appUtil.createSuccessResponse(constants.responseCode.SUCCESS, meetingInfo));
    } catch (error) {
        console.log("Meeting Controller || Create Meeting", error);
        return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
    }
}

/**
 * 
 * @param {*} application(teamlocus, tlchat) 
 * @param {*} meeting_host
 * @param {*} status
 * @param {*} meeting_type(non-periodic, periodic)
 * @param {*} subject
 * @param {*} start_time(UTC)
 * @param {*} end_time(UTC)
 * @param {*} meeting_schedule
 */
exports.createmeeting = async (req, res) => {
    const params = req.body;
    const currentTimeStamp = moment().utc().unix().toString();
    try {
        if (params.meeting_type == 'nonperiodic') {
            let response = {};
            const currentTimeStamp = moment().utc().unix().toString();

            const createmeetingparams = {
                meeting_id: currentTimeStamp.slice(0,3) + "-" + currentTimeStamp.slice(3, 6) + "-" + currentTimeStamp.slice(6, currentTimeStamp.length),
                application: params.application,
                meeting_host: params.meeting_host,
                subject: params.subject,
                status: params.meeting_status ? params.meeting_status :"pending",
                meeting_type: params.meeting_type,
                start_time: moment(params.start_time, 'x').toDate(),
                end_time: moment(params.end_time, 'x').toDate()
            };

            console.log("Create Meeting Params : ", createmeetingparams)
            const createdMeeting = await models.meeting.create(createmeetingparams);
            console.log("Created Meeting: ", createdMeeting.meeting_id);

            const encryptedMeetingforstart = appUtil.encryptMeetingId(createdMeeting.meeting_id, "start");
            const encryptedMeetingforjoin = appUtil.encryptMeetingId(createdMeeting.meeting_id, "join");

            console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforstart));
            console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforjoin));
            response.start_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforstart}`;
            response.join_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforjoin}`;

            res.send({ 
                status: "ok",
                message: {
                    meeting_id: createmeetingparams.meeting_id,
                    start_url: response.start_url,
                    join_url: response.join_url
                }
            })
        } else if (params.meeting_type == 'periodic') {
            let response = {};
            console.log("Params: ", params)
            const createmeetingparams = {
                meeting_id: currentTimeStamp.slice(0,3) + "-" + currentTimeStamp.slice(3, 6) + "-" + currentTimeStamp.slice(6, currentTimeStamp.length),
                application: params.application,
                meeting_host: params.meeting_host,
                status: params.meeting_status ? params.meeting_status :"pending",
                meeting_type: params.meeting_type,
                subject: params.subject,
                start_time: moment(params.start_time, 'x').toDate(),
                end_time: moment(params.end_time, 'x').toDate(),
                repeat_event_until: params.meeting_schedule.repeat_event_until,
                repeat_interval: params.meeting_schedule.repeat_interval,
                repeat_start_date: moment(params.start_time, 'x').toDate(),
                repeat_end_date: moment(params.meeting_schedule.repeat_end_time, 'x').toDate(),
                repeat_frequency: params.meeting_schedule.repeat_frequency,
                occurance: params.meeting_schedule.occurance ? params.meeting_schedule.occurance : '',
                occurance_on_week_no: params.meeting_schedule.occurance_on_week_no ? params.meeting_schedule.occurance_on_week_no : '',
                occurance_year_month_date: params.meeting_schedule.occurance_year_month_date ? params.meeting_schedule.occurance_year_month_date : ''
            };


            console.log("Create Meeting Params : ", createmeetingparams)
            const createdMeeting = await models.meeting.create(createmeetingparams);
            console.log("Created Meeting: ", createdMeeting);

            const encryptedMeetingforstart = appUtil.encryptMeetingId(createdMeeting.meeting_id, "start");
            const encryptedMeetingforjoin = appUtil.encryptMeetingId(createdMeeting.meeting_id, "join");

            console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforstart));
            console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforjoin));

            response.start_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforstart}`;
            response.join_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforjoin}`;

            res.send({
                code: "ok",
                message: {
                    meeting_id: createdMeeting.meeting_id,
                    start_url: response.start_url,
                    join_url: response.join_url
                }
            })

            // return cb(null, appUtil.createSuccessResponse(appUtil.createSuccessResponse(constants.responseCode.SUCCESS), response));
        }

    } catch (error) {
        console.log("Meeting Controller || Create Meeting", error);
        // return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
        res.send({
            status: "error", 
            message: "Internal Server Error"
        })
    }
}

exports.startMeeting = async (req, res) => {
    try {
        console.log("Start Meeting Params: ", req.params.id);
        const queryParams = req.params.id;
        const meeting_id = 
        appUtil.decryptMeetingId(queryParams).split("-")[0]+"-"+appUtil.decryptMeetingId(queryParams).split("-")[1]+"-"+appUtil.decryptMeetingId(queryParams).split("-")[2];
        const userstatus = appUtil.decryptMeetingId(queryParams).split("-")[3];
        console.log("Meeting Id: ", meeting_id);
        console.log("User Status: ", userstatus);
        console.log("Today Day Position: ", moment().weekday());

        const meeting = await models.meeting.findOne({
            where: {
                meeting_id: meeting_id
            }
        });

        console.log("Meeting: ", meeting.dataValues);
        console.log("Database time: ", moment(meeting.end_time).format("HHmm"));
        console.log("Current time: ", moment().utc().format("HHmm"));

        if (userstatus == "start") {
            if (meeting && meeting.meeting_type == "nonperiodic") {
                if (meeting.end_time.getTime().valueOf() > moment().utc().toDate().getTime().valueOf()) {
                    await models.meeting.update({ status: "started", actual_start_time: moment().utc().toDate().valueOf() }, {
                        where: {
                            meeting_id: meeting_id
                        }
                    });
                    return res.redirect(`https://meet.teamlocus.com/${meeting.meeting_id}?host=true`)    
                }
            // if (meeting && meeting.meeting_type == "daily" && meeting.end_time.getTime().valueOf() > moment().utc().toDate().getTime().valueOf()) {
            //     await models.meeting.update({ status: "started", actual_start_time: moment().utc().toDate().valueOf() }, {
            //         where: {
            //             id: meeting.id
            //         }
            //     });
            //     return res.redirect(`https://meet.teamlocus.com/${meeting.id}?host=true`)
            // } else if (meeting && meeting.meeting_type == "weekly" && meeting.meeting_days.includes(moment().weekday()) && moment(meeting.end_time).format("HHmm") > moment().utc().format("HHmm")) {
            //     await models.meeting.update({ status: "started", actual_start_time: moment().utc().toDate().valueOf() }, {
            //         where: {
            //             id: meeting.id
            //         }
            //     });
            //     return res.redirect(`https://meet.teamlocus.com/${meeting.id}?host=true`);
            } else {
                return res.redirect(`https://meet.teamlocus.com/errorpage?${meeting.meeting_id}`);
            }
        } else if (userstatus == "join") {
            if (meeting && meeting.meeting_type == "nonperiodic") {
                console.log("In Non periodic meeting");
                if (meeting.status == "started" 
                && meeting.end_time.valueOf() > moment().utc().toDate().valueOf()) 
                {
                    console.log("If Meeting ID: ", meeting.meeting_id)
                    return res.redirect(`https://meet.teamlocus.com/${meeting.meeting_id}`)
                } else {
                    console.log("Else Meeting ID: ", meeting_id)
                    return res.redirect(`https://meet.teamlocus.com/waiting/${meeting_id}`);
                }
            }

            // if (meeting && meeting.status == "started" 
            //         && meeting.end_time.valueOf() > moment().utc().toDate().valueOf()) {
            //       meetingController.addlogs(meeting.id, "meeting_start", "Host started meeting.");
            //     return res.redirect(`https://meet.teamlocus.com/${meeting.id}`)
            // } else if (meeting && meeting.status == "ended") {
            //     return res.redirect(`https://meet.teamlocus.com/end_meeting?${meeting.id}`)
            // } else {
            //     return res.redirect(`https://meet.teamlocus.com/waiting/${meeting_id}`);
            // }
        }

    } catch (error) {
        console.log("Meeting Controller || Start Meeting", error);
        return res.json({
            code: 401,
            message: "Something went wrong! Please try again."
        })
    }
}

exports.joinMeeting = async (params, cb) => {
    try {
        console.log("Start Meeting Params: ", params.id);
        let url;
        const queryParams = params.id;
        const meeting_id = appUtil.decryptMeetingId(queryParams).split(" ")[0];
        const userstatus = appUtil.decryptMeetingId(queryParams).split(" ")[1];

        const meeting = await models.meeting.findOne({
            where: {
                id: meeting_id
            }
        });

        console.log("Meeting Id: ", meeting);
        if (meeting && meeting.status == "started" && meeting.end_time.valueOf() > moment().utc().toDate().valueOf()) {
            //   meetingController.addlogs(meeting.id, "meeting_start", "Host started meeting.");
            url = `https://meet.teamlocus.com/${meeting.id}`;
            return cb(null, appUtil.createSuccessResponse(constants.responseCode.SUCCESS, url))
        } else {
            url = `https://meet.teamlocus.com/waiting`;
            return cb(null, appUtil.createSuccessResponse(constants.responseCode.SUCCESS, url))
        }
    } catch (error) {
        console.log("Meeting Controller || Join Meeting", error);
        return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
    }
}

/**
 * 
 * @param {*} meeting_id 
 * @param {*} status
 * @param {*} actual_start_time(Status == "started")
 * @param {*} actual_end_time(Status == "ended")
 */
exports.changeMeetingStatus = async (params, cb) => {
    try {
        console.log("Params : ", params);
        if (params.status == "started") {
            const param = {
                status: params.status,
                actual_start_time: moment(params.actual_start_time, 'x').toDate()
            }

            await models.meeting.update({ status: params.status, actual_start_time: moment(params.actual_start_time, 'x').toDate() }, {
                where: {
                    meeting_id: params.meeting_id
                }
            });

            // const query = "UPDATE meetings SET stauts=?, actual_start_time=? where meeting_id=?";
            // await dbManager.executeUpdate('meetings', param, {'id': params.id});
            return cb(null, appUtil.createSuccessResponse(appUtil.createSuccessResponse(constants.responseCode.SUCCESS)));
        }
        if (params.status == "ended") {
            const param = {
                status: params.status,
                actual_end_time: moment(params.actual_end_time, 'x').toDate()
            }

            await models.meeting.update({ status: params.status, actual_end_time: moment(params.actual_end_time, 'x').toDate() }, {
                where: {
                    meeting_id: params.meeting_id
                }
            });

            // const query = "UPDATE meetings SET stauts=?, actual_end_time=? where meeting_id=?";
            // await dbManager.executeUpdate('meetings', param, {'id': params.id});
            return cb(null, appUtil.createSuccessResponse(appUtil.createSuccessResponse(constants.responseCode.SUCCESS)));
        }
        if (params.status == "pending") {
            const param = {
                status: params.status
            }

            await models.meeting.update({ status: params.status }, {
                where: {
                    meeting_id: params.meeting_id
                }
            });

            // const query = "UPDATE meetings SET stauts=?, actual_end_time=? where meeting_id=?";
            // await dbManager.executeUpdate('meetings', param, {'id': params.id});
            return cb(null, appUtil.createSuccessResponse(appUtil.createSuccessResponse(constants.responseCode.SUCCESS)));
        }
    } catch (error) {
        console.log("Meeting Controller || Change Meeting Status", error);
        return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
    }
}


/**
 * 
 * @param {*} meeting_id 
 * @param {*} log_type
 * @param {*} log_description 
 */
exports.addlogs = async (params, cb) => {
    try {
        console.log("All Logs Params : ", params);
        const logsParams = {
            meeting_id: params.meeting_id,
            log_type: params.log_type,
            log_description: params.log_description
        };

        await models.meeting_logs.create(logsParams);
        return cb(null, appUtil.createSuccessResponse(appUtil.createSuccessResponse(constants.responseCode.SUCCESS)));
    } catch (error) {
        console.log("Meeting Controller || Add Logs", error);
        return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
    }
}


/**
 * 
 * @param {*} meeting_id 
 * @param {*} body 
 */
exports.editmeeting = async (params, cb) => {
    try {
        console.log("Edit Meeting Params : ", params);
        let response;
        let meeting = await models.meeting.findAll({
            where: {
                meeting_id: params.meeting_id
            }
        });

        if ('start_time' in params.body) {
            params.body.start_time = moment(params.body.start_time, 'x').toDate()
        }
        if ('end_time' in params.body) {
            params.body.end_time = moment(params.body.end_time, 'x').toDate()
        }
        console.log("Params Body: ", params.body)
        if (meeting.length > 0) {
            await models.meeting.update(params.body, {
                where: {
                    meeting_id: params.meeting_id
                }
            })
            response = {
                code: 200,
                message: "success"
            }
        } else {
            response = {
                code: 501,
                message: "Invalid meeting id. Please try again with valid meeting ID."
            }
        }
        return cb(null, appUtil.createSuccessResponse(constants.responseCode.SUCCESS), response)
    } catch (error) {
        console.log("Meeting Controller || Edit Meeting", error);
        return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
    }
}

exports.deletemeeting = async (params, cb) => {
    try {
        console.log("Delete Meeting Params: ", params);

        await models.meeting.destroy({
            where: {
                meeting_id: params.meeting_id
            }
        });

        return cb(null, appUtil.createSuccessResponse(constants.responseCode.SUCCESS))
    } catch (error) {
        console.log("Meeting Controller || Edit Meeting", error);
        return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
    }
}