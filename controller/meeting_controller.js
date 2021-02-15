const moment = require('moment');
const appUtil = require('./../util/app-util');
const constants = require('./../util/constants');
const models = require('./../models');

/**
 * 
 * @param {*} meeting_id 
 */
exports.getMeeting = async (req, res) => {
    try {
        console.log("Get Meeting Params : ", req.body);
        let response = {};
        // let meeting_id = appUtil.decryptMeetingId(params.meeting_id).split("-")[0];
        const meeting_id = req.body.meeting_id.split("?")[0];
        
        const meeting = await models.meeting.findAll({
            where: {
                meeting_id: meeting_id
            }
        });

        console.log("Meeting Length: ", meeting.length, !meeting.length)
        if (!meeting.length) {
            return res.send({ 
                status: "error",
                message: "Invalid meeting id. Please try with valid meeting id.",
                webpage: "",
                response: ""
            })
        }


        console.log("Meeting: ", meeting[0].dataValues.meeting_id);
        response.meeting_details = meeting;
        const encryptedMeetingforstart = appUtil.encryptMeetingId(meeting[0].dataValues.meeting_id, "start");
        const encryptedMeetingforjoin = appUtil.encryptMeetingId(meeting[0].dataValues.meeting_id, "join");

        console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforstart));
        console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforjoin));
        response.start_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforstart}`;
        response.join_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforjoin}`;


        return res.send({
            status: "ok",
            message: "",
            webpade: "",
            response: meeting
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

exports.getMeetingInfo = async (req, res) => {
    try {

        console.log("Params: ", req.body);

        const meetingInfo = await models.meeting.findOne({
            where: {
                meeting_id: req.body.meeting_id
            }
        });
        // console.log("Meeting Info: ", meetingInfo);
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
    const currentTimeStamp = moment().utc().unix().toString();
    try {
        console.log("Params: ", req.body);
        if (req.body.meeting_type == 'nonperiodic') {
            let response = {};
            const currentTimeStamp = moment().utc().unix().toString();

            const createmeetingparams = {
                meeting_id: currentTimeStamp.slice(0, 3) + currentTimeStamp.slice(3, 6) + currentTimeStamp.slice(6, currentTimeStamp.length),
                application: req.body.application,
                meeting_host: req.body.meeting_host,
                subject: req.body.subject,
                status: req.body.meeting_status ? req.body.meeting_status : "pending",
                meeting_type: req.body.meeting_type,
                start_time: moment(req.body.start_time, 'x').toDate(),
                end_time: moment(req.body.end_time, 'x').toDate()
            };

            // console.log("Create Meeting Params : ", createmeetingparams)
            const createdMeeting = await models.meeting.create(createmeetingparams);
            // console.log("Created Meeting: ", createdMeeting.meeting_id);

            const encryptedMeetingforstart = appUtil.encryptMeetingId(createdMeeting.meeting_id, "start");
            const encryptedMeetingforjoin = appUtil.encryptMeetingId(createdMeeting.meeting_id, "join");

            // console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforstart));
            // console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforjoin));
            response.start_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforstart}`;
            response.join_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforjoin}`;

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
        } else if (req.body.meeting_type == 'periodic') {
            let response = {};
            const createmeetingparams = {
                meeting_id: currentTimeStamp.slice(0, 3) + currentTimeStamp.slice(3, 6) + currentTimeStamp.slice(6, currentTimeStamp.length),
                application: req.body.application,
                meeting_host: req.body.meeting_host,
                status: req.body.meeting_status ? req.body.meeting_status : "pending",
                meeting_type: req.body.meeting_type,
                subject: req.body.subject,
                start_time: moment(req.body.start_time, 'x').toDate(),
                end_time: moment(req.body.end_time, 'x').toDate(),
                repeat_event_until: req.body.meeting_schedule.repeateveryunit,
                repeat_interval: req.body.meeting_schedule.repeatinterval,
                repeat_start_date: moment(req.body.meeting_schedule.startdate, 'x').toDate(),
                repeat_end_date: moment(req.body.meeting_schedule.repeatenddate, 'x').toDate(),
                repeat_frequency: req.body.meeting_schedule.repeatfequency,
                occurance: req.body.meeting_schedule.occurrence ? req.body.meeting_schedule.occurrence : '',
                occurance_on_week_no: req.body.meeting_schedule.occurenceonweekno ? req.body.meeting_schedule.occurenceonweekno : '',
                occurance_year_month_date: req.body.meeting_schedule.occurrenceyearmonthdate ? req.body.meeting_schedule.occurrenceyearmonthdate : ''
            };


            // console.log("Create Meeting Params : ", createmeetingparams)
            const createdMeeting = await models.meeting.create(createmeetingparams);
            // console.log("Created Meeting: ", createdMeeting);

            const encryptedMeetingforstart = appUtil.encryptMeetingId(createdMeeting.meeting_id, "start");
            const encryptedMeetingforjoin = appUtil.encryptMeetingId(createdMeeting.meeting_id, "join");

            // console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforstart));
            // console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforjoin));

            response.start_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforstart}`;
            response.join_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforjoin}`;

            return res.send({
                status: "ok",
                message: "",
                webpage: "",
                response: {
                    meeting_id: createdMeeting.meeting_id,
                    start_url: response.start_url,
                    join_url: response.join_url
                }
            })
        }

    } catch (error) {
        console.log("Meeting Controller || Create Meeting", error);
        // return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
        res.send({
            status: "error",
            message: "Internal Server Error",
            webpage: "",
            response: ""
        })
    }
}

/**
 * @param {*} meeting
 */
function meetingStatusCheck(params) {
    try {
        console.log("Params: ", params);
        const difference = moment().utc().diff(moment(params.start_time), 'days');
        console.log("Difference: ", difference)
        if (params.repeat_event_until == "Every Week") {
            if (difference % 7 == 0) {
                return true;
            } else {
                return false;
            }
        } else if (params.repeat_event_until == "Every 2 Week") {
            if (difference % 14 == 0) {
                return true;
            } else {
                return false;
            }
        } else if (params.repeat_event_until == "Month") {
            if (moment(params.start_time).date() == moment().utc().date()) {
                return true;
            } else {
                return false;
            }
        } else if (params.repeat_event_until == "Year") {
            if (moment(params.start_time).date() == moment().utc().date()
                && moment(params.start_time).month() == moment().utc().month()) {
                return true;
            } else {
                return false;
            }
        } else if (params.repeat_event_until == "Custom") {
            if (params.repeat_frequency == "Daily") {
                return true;
            } 

            if (params.repeat_frequency == "Weekly") {
                let occurance = params.occurance;
                let occurrenceno = occurance.match(/<w>(.*?)<\/w>/g).map(function(val){
                    return val.replace(/<\/?w>/g,'');
                });
                const todaysdayposition = moment().utc().day();

                let result = occurrenceno.includes((todaysdayposition + 1).toString());

                return result;
            }
            
            if (params.repeat_frequency == "Monthly") {
                if (params.occurance.length > 0) {
                    const occurance = params.occurance;
                    const dates = occurance.match(/<DT>(.*?)<\/DT>/g).map(function(val){
                        return val.replace(/<\/?DT>/g,'');
                     });

                    const todaysdayno = moment().utc().date();
                    let result = dates.includes(todaysdayno.toString());

                    console.log(todaysdayno + " " + result);

                    return result;
                } else if (params.occurance_on_week_no.length > 0) {
                    const occuranceonweekno = params.occurance_on_week_no;
                    const weekno = occuranceonweekno.match(/<W>(.*?)<\/W>/g).map(function(val){
                        return val.replace(/<\/?W>/g,'');
                    });
                    const todaysday = moment().utc();
                    const currentweekno = todaysday.week() - moment(todaysday).startOf('month').week() + 1;

                    const days = occuranceonweekno.match(/<D>(.*?)<\/D>/g).map(function(val){
                        return val.replace(/<\/?D>/g,'');
                    }); 
                    const currentday = moment().utc().weekday();

                    console.log("Week No: ", weekno);
                    console.log("Days: ", days);
                    // console.log(currentweekno + " " + (currentday+1).toString());
                    // console.log(weekno.includes(currentweekno.toString()))
                    // console.log(days.includes((currentday+1).toString()))
                    // let result = weekno.includes(currentweekno.toString()) && days.includes((currentday+1).toString());
                    // console.log(result)

                    // console.log("2: ", moment(todaysday).startOf('month').week());
                    // console.log("3: ", moment("2021-12-13T06:43:00Z").endOf("month").week())
                    // let end = moment().utc().endOf("month").week() - moment(todaysday).startOf('month').week();


                    let result;
                    for (let i=0; i<weekno.length; i++) {
                        // let indexofweek = weekno.indexOf(currentweekno.toString());
                        console.log("Week No: ", weekno[i]);
                        console.log("Current Week No: ", currentweekno.toString());
    
                        if (weekno[i] == currentweekno.toString()) {
                            console.log("Days[i] :", days[i]);
                            console.log("Current Day: ", currentday+1);

                            result = days[i] == (currentday+1);
                            console.log("Result: ", result);

                            if (result == true) { 
                                return result;
                            }

                        } else if (weekno[i] == "10") {
                            let startOfWeek = moment().utc().isoWeekday(1).startOf('week').format("DD");
                            let endOfMonth = moment().utc().isoWeekday(1).endOf("month").format("DD");
                            let end = endOfMonth - startOfWeek < "7" ? currentweekno : "" ;

                            console.log("Week No when its 10: ", days[i])

                            if (days[i] == (currentday+1)) {
                                return true;
                            }

                        }
                    }

                    if(indexofweek==-1){
                        return false;
                    }

                    // let result = days[indexofweek] == (currentday+1);
                }

                return false;
            } else {
                return false;
            }
        }

    } catch (error) {
        console.log("Meeting Controller || Meeting status check", error);
        return res.json({
            status: "error",
            message: "Something went wrong! Please try again.",
            webpage: "",
            response: ""
        })
    }
}

exports.startMeeting = async (req, res) => {
    try {
        console.log("Start Meeting Params: ", req.params.id);
        const queryParams = req.params.id;
        const meeting_id = appUtil.decryptMeetingId(queryParams).split("-")[0];
        const userstatus = appUtil.decryptMeetingId(queryParams).split("-")[1];
        console.log("Meeting Id: ", meeting_id);
        console.log("User Status: ", userstatus);
        // console.log("Today Day Position: ", moment().weekday());

        const meeting = await models.meeting.findOne({
            where: {
                meeting_id: meeting_id
            }
        });

        // console.log("Meeting: ", meeting.dataValues);
        // console.log("Database time: ", moment(meeting.end_time).format("HHmm"));
        // console.log("Current time: ", moment().utc().format("HHmm"));

        if (userstatus == "start") {
            if (meeting && meeting.meeting_type == "nonperiodic") {
                if (moment(meeting.end_time).valueOf() > moment().utc().toDate().getTime().valueOf()) {
                    await models.meeting.update({ status: "started", actual_start_time: moment().utc().toDate().valueOf() }, {
                        where: {
                            meeting_id: meeting_id
                        }
                    });

                    return res.redirect(`https://meet.teamlocus.com/${meeting.meeting_id}?host=true`)
                } else {
                
                    return res.redirect(`https://meet.teamlocus.com/end_meeting?${meeting.meeting_id}`)
                }
            } else if (meeting && meeting.meeting_type == "periodic") {
                console.log("In Periodic meeting");
                if (moment(meeting.repeat_end_date).valueOf() > moment().utc().toDate().valueOf()) {
                    console.log("Repeat event until: ", meeting.repeat_event_until)
                    const check = meetingStatusCheck(meeting)

                    if (check) {
                        await models.meeting.update({ status: "started", actual_start_time: moment().utc().toDate().valueOf() }, {
                            where: {
                                meeting_id: meeting_id
                            }
                        });
                        return res.redirect(`https://meet.teamlocus.com/${meeting.meeting_id}?host=true`)
                    } else {
                        return res.redirect(`https://meet.teamlocus.com/end_meeting?${meeting.meeting_id}`)
                    }
                } else {
                    return res.redirect(`https://meet.teamlocus.com/end_meeting?${meeting.meeting_id}`)
                }
            } else {
                return res.redirect(`https://meet.teamlocus.com/errorpage?${meeting.meeting_id}`);
            }

        } else if (userstatus == "join") {
            if (meeting && meeting.meeting_type == "nonperiodic") {
                console.log("In Non periodic meeting");
                if (meeting.status == "started"
                    && moment(meeting.end_time).valueOf() > moment().utc().toDate().valueOf()) {
                    console.log("If Meeting ID: ", meeting.meeting_id)

                    return res.redirect(`https://meet.teamlocus.com/${meeting.meeting_id}`)
                } else if (meeting.status == "ended") {
                    return res.redirect(`https://meet.teamlocus.com/end_meeting?${meeting.meeting_id}`)
                } else {
                    console.log("Else Meeting ID: ", meeting_id)
                    return res.redirect(`https://meet.teamlocus.com/waiting/${meeting_id}`);
                }
            }

            if (meeting && meeting.meeting_type == "periodic") {
                console.log("In Periodic meeting");
                if (meeting.status == "started" 
                    && moment(meeting.repeat_end_date).valueOf() > moment().utc().toDate().valueOf()) {
                    console.log("Repeat event until: ", meeting.repeat_event_until)
                    const check = meetingStatusCheck(meeting)

                    if (check) {
                        return res.redirect(`https://meet.teamlocus.com/${meeting.meeting_id}`)
                    } else {
                        return res.redirect(`https://meet.teamlocus.com/waiting/${meeting.meeting_id}`)
                    }

                } else {
                    return res.redirect(`https://meet.teamlocus.com/waiting/${meeting.meeting_id}`)
                }
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

// exports.joinMeeting = async (params, cb) => {
//     try {
//         console.log("Start Meeting Params: ", params.id);
//         let url;
//         const queryParams = params.id;
//         const meeting_id = appUtil.decryptMeetingId(queryParams).split(" ")[0];
//         const userstatus = appUtil.decryptMeetingId(queryParams).split(" ")[1];

//         const meeting = await models.meeting.findOne({
//             where: {
//                 id: meeting_id
//             }
//         });

//         console.log("Meeting Id: ", meeting);
//         if (meeting && meeting.status == "started" && meeting.end_time.valueOf() > moment().utc().toDate().valueOf()) {
//               meetingController.addlogs(meeting.id, "meeting_start", "Host started meeting.");
//             url = `https://meet.teamlocus.com/${meeting.id}`;
//             return cb(null, appUtil.createSuccessResponse(constants.responseCode.SUCCESS, url))
//         } else {
//             url = `https://meet.teamlocus.com/waiting`;
//             return cb(null, appUtil.createSuccessResponse(constants.responseCode.SUCCESS, url))
//         }
//     } catch (error) {
//         console.log("Meeting Controller || Join Meeting", error);
//         return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
//     }
// }

/**
 * 
 * @param {*} meeting_id 
 * @param {*} status
 * @param {*} actual_start_time(Status == "started")
 * @param {*} actual_end_time(Status == "ended")
 */
exports.changeMeetingStatus = async (req, res) => {
    try {
        console.log("Params : ", req.body);
        if (req.body.status == "started") {
            await models.meeting.update({ status: req.body.status, actual_start_time: moment(req.body.actual_start_time, 'x').toDate() }, {
                where: {
                    meeting_id: req.body.meeting_id
                }
            });

            // const query = "UPDATE meetings SET stauts=?, actual_start_time=? where meeting_id=?";
            // await dbManager.executeUpdate('meetings', param, {'id': params.id});
            
            return res.send({
                status: "ok",
                message: "",
                webpage: "",
                response: ""
            })
        }
        if (req.body.status == "ended") {
            await models.meeting.update({ status: req.body.status, actual_end_time: moment(req.body.actual_end_time, 'x').toDate() }, {
                where: {
                    meeting_id: req.body.meeting_id
                }
            });

            // const query = "UPDATE meetings SET stauts=?, actual_end_time=? where meeting_id=?";
            // await dbManager.executeUpdate('meetings', param, {'id': params.id});

            return res.send({
                status: "ok",
                message: "",
                webpage: "",
                response: ""
            })
        }
        if (req.body.status == "pending") {
            await models.meeting.update({ status: req.body.status }, {
                where: {
                    meeting_id: req.body.meeting_id
                }
            });

            // const query = "UPDATE meetings SET stauts=?, actual_end_time=? where meeting_id=?";
            // await dbManager.executeUpdate('meetings', param, {'id': params.id});

            return res.send({
                status: "ok",
                message: "",
                webpage: "",
                response: ""
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

/**
 * 
 * @param {*} meeting_id 
 * @param {*} log_type
 * @param {*} log_description 
 */
exports.addlogs = async (req, res) => {
    try {
        console.log("All Logs Params : ", req.body);
        const logsParams = {
            meeting_id: req.body.meeting_id,
            log_type: req.body.log_type,
            log_description: req.body.log_description
        };

        await models.meeting_logs.create(logsParams);

        return res.send({
            status: "ok",
            message: "",
            webpage: "",
            response: ""
        })
    } catch (error) {
        console.log("Meeting Controller || Add Logs", error);
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
 * @param {*} application(teamlocus, tlchat) 
 * @param {*} meeting_host
 * @param {*} status
 * @param {*} meeting_type(non-periodic, periodic)
 * @param {*} subject
 * @param {*} start_time(UTC)
 * @param {*} end_time(UTC)
 * @param {*} meeting_schedule
 */
exports.editmeeting = async (req, res) => {
    try {
        console.log("Edit Meeting Params : ", req.body);
        let editParams = {};
        if (req.body.meeting_type == "nonperiodic") {
            editParams = {
                application: req.body.application,
                meeting_host: req.body.meeting_host,
                subject: req.body.subject,
                status: req.body.meeting_status ? req.body.meeting_status : "pending",
                meeting_type: req.body.meeting_type,
                start_time: moment(req.body.start_time, 'x').toDate(),
                end_time: moment(req.body.end_time, 'x').toDate()
            };

            console.log("Non Periodic params: ", editParams);
        } else if (req.body.meeting_type == "periodic") {
            editParams = {
                application: req.body.application,
                meeting_host: req.body.meeting_host,
                status: req.body.meeting_status ? req.body.meeting_status : "pending",
                meeting_type: req.body.meeting_type,
                subject: req.body.subject,
                start_time: moment(req.body.start_time, 'x').toDate(),
                end_time: moment(req.body.end_time, 'x').toDate(),
                repeat_event_until: req.body.meeting_schedule.repeateveryunit,
                repeat_interval: req.body.meeting_schedule.repeatinterval,
                repeat_start_date: moment(req.body.meeting_schedule.startdate, 'x').toDate(),
                repeat_end_date: moment(req.body.meeting_schedule.repeatenddate, 'x').toDate(),
                repeat_frequency: req.body.meeting_schedule.repeatfequency,
                occurance: req.body.meeting_schedule.occurrence ? req.body.meeting_schedule.occurrence : '',
                occurance_on_week_no: req.body.meeting_schedule.occurenceonweekno ? req.body.meeting_schedule.occurenceonweekno : '',
                occurance_year_month_date: req.body.meeting_schedule.occurrenceyearmonthdate ? req.body.meeting_schedule.occurrenceyearmonthdate : ''
            }

            console.log("Periodic params: ", editParams);
        }

        if (req.body.meeting_id) {
            await models.meeting.update(editParams, {
                where: {
                    meeting_id: req.body.meeting_id
                }
            })

            return res.send({
                status: "ok",
                message: "",
                webpage: "",
                response: "sucess"
            })
        } else {
            return res.send({
                status: "error",
                message: "Invalid meeting id. Please try again with valid meeting ID.",
                webpage: "",
                response: ""
            })
        }

    } catch (error) {
        console.log("Meeting Controller || Edit Meeting", error);

        return res.send({
            status: "error",
            message: "Internal server error. Please try again.",
            webpage: "",
            response: ""
        })
    }
}

exports.deletemeeting = async (req, res) => {
    try {
        console.log("Delete Meeting Params: ", req.body);

        await models.meeting.destroy({
            where: {
                meeting_id: req.body.meeting_id
            }
        });

        return res.send({
            status: "ok",
            message: "",
            webpage: "",
            response: ""
        })
    } catch (error) {
        console.log("Meeting Controller || Edit Meeting", error);

        return res.send({
            status: "error",
            message: "Internal server error. Please try again.",
            webpage: "",
            response: ""
        })
    }
}