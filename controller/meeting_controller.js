const moment = require('moment');
const appUtil = require('./../util/app-util');
const socketManager = require('./../util/socket-manager');
const models = require('./../models');
const axios = require('axios');
const { Op } = require('sequelize');

exports.getAllMeetings = async (req, res) => {
    try {
        console.log("Get All Meetings: ", req.body);
        const meetings = await axios.post("https://webservice.teamlocus.com/webservice_v42.svc/calendararea_listjeetvideomeeting", req.body);

        // console.log("Data: ", meetings.data)

        if (meetings.data.status == "error") {
            return res.send({
                status: 401,
                message: meetings.data.message
            })
        }

        const allmeetings = meetings.data.response.tblmymeetings;
        let filterOptions = [
            { "application": "tlmeet" }
        ];

        if (allmeetings.length > 0) {
            filterOptions.push({
                'meeting_id': [meetings.data.response.tblmymeetings.map(item => item.meeting_video)],
            })
        }

        // console.log("Filter Options: ", filterOptions);
        // console.log("Date: ", new Date());

        // console.log("Moment: ", moment())
        const userMeetings = await models.meeting.findAll({
            where: {
                [Op.or]: filterOptions
            },
            order: [
                ['start_time', 'ASC']
            ]
        });

        // console.log("User Meetings: ", userMeetings.length)
        
        let meetingsss = [];
        for (let i=0; i<userMeetings.length; i++) {
            if (userMeetings[i].meeting_type === "nonperiodic") {
                if (moment(userMeetings[i].start_time).isSame(moment(), 'day')) {                    
                    meetingsss.push(userMeetings[i])
                }
            } else if (userMeetings[i].meeting_type === "periodic") {
                const resp = meetingStatusCheck(userMeetings[i]);
                if (resp) {
                    meetingsss.push(userMeetings[i]);
                }    
            }
        }
        console.log("Meetingsss: ", meetingsss.length);
        
        if (meetingsss.length == 0) {
            return res.send({
                status: "200",
                message: "No upcoming meetings!"
            })
        }

        return res.send({
            status: 200,
            message: "",
            meetings: meetingsss
        })
    } catch (error) {
        console.log("Meeting Controller | Get All Meetings Error", error);
    }
}

/**
 * 
 * @param {*} username 
 * @param {*} res 
 */
exports.allMeetings = async (req, res) => {
    try {
        const meetings = await models.meeting.findAll({
            where: {
                meeting_host: req.body.username,
                [Op.or]: [
                    {
                    meeting_type: "nonperiodic",
                    start_time: {
                        [Op.gte]: moment().utc().format("yyyy-MM-DD")
                    }
                }, {
                    meeting_type: "periodic",
                    repeat_end_date: {
                        [Op.gte]: moment().utc().format("yyyy-MM-DD")
                    }
                }
                ]
            },
            order: [
                ['start_time', 'ASC']
            ]
        })

        if (meetings.length == 0) {
            return res.send({
                status: "200",
                message: "You have no meetings at this moment!"
            })
        }

        return res.send({
            status: 200,
            message: "",
            webpage: "",
            meetings: meetings
        })
    } catch (error) {
        console.log("Meeting Controller | All Meetings Error", error);
    }
}

/**
 * 
 * @param {*} meeting_id 
 */
exports.getMeeting = async (req, res) => {
    try {
        console.log("Get Meeting Params : ", req.body);
        let response = {};
        const meeting_id = req.body.meeting_id.split("?")[0];

        const meeting = await models.meeting.findAll({
            where: {
                meeting_id: meeting_id
            }
        });

        if (!meeting.length) {
            return res.send({
                status: "error",
                message: "Invalid meeting id. Please try with valid meeting id.",
                webpage: "",
                response: ""
            })
        }


        response.meeting_details = meeting;
        const encryptedMeetingforstart = appUtil.encryptMeetingId(meeting[0].dataValues.meeting_id, "start");
        const encryptedMeetingforjoin = appUtil.encryptMeetingId(meeting[0].dataValues.meeting_id, "join");

        // console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforstart));
        // console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforjoin));
        response.start_url = `https://tlmeet.teamlocus.com:3443/join/${encryptedMeetingforstart}`;
        response.join_url = `https://tlmeet.teamlocus.com:3443/join/${encryptedMeetingforjoin}`;


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

/**
 * 
 * @param {*} meeting_id
 */
exports.getMeetingInfo = async (req, res) => {
    try {

        console.log("Params: ", req.body);

        const meetingInfo = await models.meeting.findOne({
            where: {
                meeting_id: req.body.meeting_id
            }
        });
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
        console.log("Create Meeting Params: ", req.body);
        if (req.body.meeting_type == 'nonperiodic') {
            let response = {};
            const currentTimeStamp = moment().utc().unix().toString();

            const createmeetingparams = {
                meeting_id: currentTimeStamp.slice(0, 10),
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
            response.start_url = `https://tlmeet.teamlocus.com:3443/join/${encryptedMeetingforstart}`;
            response.join_url = `https://tlmeet.teamlocus.com:3443/join/${encryptedMeetingforjoin}`;

            return res.send({
                status: "ok",
                message: "",
                webpage: "",
                meeting_details: createdMeeting,
                response: {
                    meeting_id: createmeetingparams.meeting_id,
                    start_url: response.start_url,
                    join_url: response.join_url
                }
            })
        } else if (req.body.meeting_type == 'periodic') {
            console.log("Meeting Schedule: ", req.body.meeting_schedule)
            let response = {};
            const createmeetingparams = {
                meeting_id: currentTimeStamp.slice(0, 10),
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

            response.start_url = `https://tlmeet.teamlocus.com:3443/join/${encryptedMeetingforstart}`;
            response.join_url = `https://tlmeet.teamlocus.com:3443/join/${encryptedMeetingforjoin}`;

            return res.send({
                status: "ok",
                message: "",
                webpage: "",
                meeting_details: createdMeeting,
                response: {
                    meeting_id: createdMeeting.meeting_id,
                    start_url: response.start_url,
                    join_url: response.join_url
                }
            })
        } else if (req.body.meeting_type == 'onetime') {
            const currentTimeStamp = moment().utc().unix().toString();
        
            const createmeetingparams = {
                meeting_id: currentTimeStamp.slice(0, 10),
                application: req.body.application,
                meeting_host: req.body.meeting_host,
                subject: req.body.subject,
                status: req.body.status ? req.body.status : "pending",
                meeting_type: req.body.meeting_type,
                start_time: moment(req.body.start_time, 'x').toDate(),
                end_time: moment(req.body.end_time, 'x').toDate()
            };
        
            // console.log("Create Meeting Params : ", createmeetingparams)
            const createdMeeting = await models.meeting.create(createmeetingparams);
            // console.log("Created Meeting: ", createdMeeting.meeting_id);
        
            // const encryptedMeetingforstart = appUtil.encryptMeetingId(createdMeeting.meeting_id, "start");
            // const encryptedMeetingforjoin = appUtil.encryptMeetingId(createdMeeting.meeting_id, "join");
        
            // console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforstart));
            // console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforjoin));
            // response.start_url = `https://betameet.teamlocus.com:3443/join/${encryptedMeetingforstart}`;
            // response.join_url = `https://betameet.teamlocus.com:3443/join/${encryptedMeetingforjoin}`;
        
            return res.send({
                status: "ok",
                message: "",
                webpage: "",
                response: {
                    meeting_id: createmeetingparams.meeting_id,
                    // start_url: response.start_url,
                    // join_url: response.join_url
                }
            })
        }

    } catch (error) {
        console.log("Meeting Controller || Create Meeting", error);
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
        // console.log("Params: ", params);
        const difference = moment().startOf('day').diff(moment(params.start_time).startOf('day'), 'days');
        console.log("Difference: ", difference);
        console.log("Meeting Type: ", params.meeting_type)
        console.log("Repeat Until: ", params.repeat_event_until)
        if (params.repeat_event_until == "Daily") {
            if (moment(params.repeat_end_date).valueOf() > moment().utc().toDate().getTime().valueOf()) {
                return true;
            }
        } else if (params.repeat_event_until == "Every Week") {
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
        } else if (params.repeat_event_until == "Every Month") {
            if (moment(params.start_time).date() == moment().utc().date()) {
                return true;
            } else {
                return false;
            }
        } else if (params.repeat_event_until == "Every Year") {
            if (moment(params.start_time).date() == moment().utc().date()
                && moment(params.start_time).month() == moment().utc().month()) {
                return true;
            } else {
                return false;
            }
        } else if (params.repeat_event_until == "Custom") {
            // console.log("Params Of Repeat Event until: ", params.repeat_event_until)
            if (params.repeat_frequency == "Daily") {
                if (moment(params.repeat_end_date).valueOf() > moment().utc().toDate().getTime().valueOf()) {
                    return true;
                }
            }

            if (params.repeat_frequency == "Weekly") {
                let occurance = params.occurance;
                // console.log("Occurance: ", occurance);
                const todaysdayposition = moment().utc().day() + 1;
                let occurrenceno = occurance.match(/<w>(.*?)<\/w>/g).map(function (val) {
                    return val.replace(/<\/?w>/g, '');
                });

                let result = occurrenceno.includes(todaysdayposition.toString());

                return result;
            }

            if (params.repeat_frequency == "Monthly") {
                if (params.occurance.length > 0) {
                    const occurance = params.occurance;
                    const todaysdayno = moment().utc().date();
                    const dates = occurance.match(/<DT>(.*?)<\/DT>/g).map(function (val) {
                        return val.replace(/<\/?DT>/g, '');
                    });

                    let result = dates.includes(todaysdayno.toString());

                    return result;
                } else if (params.occurance_on_week_no.length > 0) {
                    const occuranceonweekno = params.occurance_on_week_no;
                    const weekno = occuranceonweekno.match(/<W>(.*?)<\/W>/g).map(function (val) {
                        return val.replace(/<\/?W>/g, '');
                    });
                    const days = occuranceonweekno.match(/<D>(.*?)<\/D>/g).map(function (val) {
                        return val.replace(/<\/?D>/g, '');
                    });

                    const todaysday = moment().utc();
                    const currentweekno = todaysday.week() - moment(todaysday).startOf('month').week() + 1;
                    const currentday = moment().utc().weekday() + 1;
                    let i = 0;
                    let allData = [];
                    let startOfWeek = moment().utc().isoWeekday(1).startOf('week').format("DD");
                    let endOfMonth = moment().utc().isoWeekday(1).endOf("month").format("DD");
                    let currentSchedule;

                    for (let item of weekno) {
                        allData.push({
                            week: item,
                            day: days[i]
                        });
                        i++;
                    }

                    if (parseInt(endOfMonth) - parseInt(startOfWeek) < 7) {
                        currentSchedule = allData.find(function (item) {
                            return (item.week == "10" || item.week == currentweekno) && item.day == currentday;
                        });

                    } else {
                        currentSchedule = allData.find(function (item) {
                            return item.week == currentweekno && item.day == currentday;
                        });
                    }

                    return currentSchedule == null ? false : true;
                }
            }

            if (params.repeat_frequency == "Yearly") {
                if (params.occurance.length > 0 && params.occurance_year_month_date.length > 0) {
                    let allData = [];
                    let i = 0;
                    let currentMonthNo = moment().utc().month() + 1;
                    let currentDay = moment().utc().date();

                    let months = params.occurance.match(/<M>(.*?)<\/M>/g).map(function (val) {
                        return val.replace(/<\/?M>/g, '');
                    })

                    let dates = params.occurance_year_month_date.match(/<DT>(.*?)<\/DT>/g).map(function (val) {
                        return val.replace(/<\/?DT>/g, '');
                    })

                    for (let month of months) {
                        allData.push({
                            month: month,
                            dates: dates
                        })
                        i++;
                    }

                    let currentSchedule = allData.find(function (item) {
                        return item.month == currentMonthNo && item.dates.includes((currentDay).toString())
                    })

                    console.log("Current Schedule 1: ", currentSchedule);
                    return currentSchedule == undefined ? false : true;
                } else if (params.occurance && params.occurance_on_week_no) {
                    const months = params.occurance.match(/<M>(.*?)<\/M>/g).map(function (val) {
                        return val.replace(/<\/?M>/g, '');
                    })
                    const weeks = params.occurance_on_week_no.match(/<W>(.*?)<\/W>/g).map(function (val) {
                        return val.replace(/<\/?W>/g, '');
                    })
                    const days = params.occurance_on_week_no.match(/<D>(.*?)<\/D>/g).map(function (val) {
                        return val.replace(/<\/?D>/g, '');
                    })

                    const currentMonthNo = moment().utc().month() + 1;
                    const todaysday = moment().utc();
                    const currentWeekNo = todaysday.week() - moment(todaysday).startOf('month').week() + 1;
                    const currentDayNo = moment().utc().weekday() + 1;
                    let startOfWeek = moment().utc().isoWeekday(1).startOf('week').format("DD");
                    let endOfMonth = moment().utc().isoWeekday(1).endOf("month").format("DD");
                    let currentSchedule;

                    let i = 0;
                    let allData = [];
                    for (let week of weeks) {
                        allData.push({
                            week: week,
                            day: days[i]
                        })
                        i++;
                    }

                    if (months.includes(currentMonthNo.toString()) && parseInt(endOfMonth) - parseInt(startOfWeek) < 7) {
                        currentSchedule = allData.find(function (item) {
                            return (item.week == "10" || item.week == currentWeekNo) && item.day == currentDayNo;
                        });
                    } else if (months.includes(currentMonthNo.toString())) {
                        currentSchedule = allData.find(function (item) {
                            return item.week == currentWeekNo && item.day == currentDayNo;
                        });
                    } else {
                        return false;
                    }

                    console.log("Current Schedule: ", currentSchedule == undefined ? false : true);

                    return currentSchedule == undefined ? false : true;
                } else {
                    return false;
                }
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

        console.log("Meeting: ", meeting == null);
        if (meeting == null) {
            console.log("Condition True");
            return res.redirect(`https://meet.teamlocus.com/errorpage?${meeting_id}`)
        }

        if (userstatus == "start") {
            if (meeting && meeting.meeting_type == "nonperiodic") {
                console.log("Non periodic meeting")
                if (moment(meeting.end_time).valueOf() > moment().utc().toDate().getTime().valueOf()) {
                    await models.meeting.update({ status: "started", actual_start_time: moment().utc().toDate() }, {
                        where: {
                            meeting_id: meeting_id
                        }
                    });

                    return res.redirect(`https://meet.teamlocus.com/${meeting.meeting_id}?host=true`)
                } else {
                    console.log("Non periodic else");
                    return res.redirect(`https://meet.teamlocus.com/endmeeting`)
                }
            } else if (meeting && meeting.meeting_type == "periodic") {
                console.log("In Periodic meeting");
                if (moment(meeting.repeat_end_date).valueOf() > moment().utc().toDate().valueOf()) {
                    const check = meetingStatusCheck(meeting)

                    if (check) {
                        await models.meeting.update({ status: "started", actual_start_time: moment().utc().toDate() }, {
                            where: {
                                meeting_id: meeting_id
                            }
                        });
                        return res.redirect(`https://meet.teamlocus.com/${meeting.meeting_id}?host=true`)
                    } else {
                        return res.redirect(`https://meet.teamlocus.com/endmeeting`)
                    }
                } else {
                    return res.redirect(`https://meet.teamlocus.com/endmeeting`)
                }
            } else {
                return res.redirect(`https://meet.teamlocus.com/errorpage?${meeting.meeting_id}`);
            }

        } else if (userstatus == "join") {
            if (meeting && meeting.meeting_type == "nonperiodic") {
                console.log("In Non periodic meeting");
                if (meeting.status == "started") {
                    console.log("If Meeting ID: ", meeting.meeting_id)

                    return res.redirect(`https://meet.teamlocus.com/${meeting.meeting_id}`)
                } else if (meeting.status == "ended") {
                    return res.redirect(`https://meet.teamlocus.com/endmeeting`)
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


/**
 * 
 * @param {*} meeting_id 
 * @param {*} status
 * @param {*} actual_start_time(Status == "started")
 * @param {*} actual_end_time(Status == "ended")
 * @param {*} authkey (optional)
 */
exports.changeMeetingStatus = async (req, res) => {
    try {
        console.log("Change Meeting Status Params : ", req.body);
        // const keyStatus = await axios.post("https://webservice.teamlocus.com/ChatBotService.svc/chatbotauthorize", { authkey: req.body.authkey });
        // console.log("Key Status: ", keyStatus.data);
        let meetingDetails = await models.meeting.findOne({ where:{meeting_id: req.body.meeting_id}});
        // if (keyStatus.data.status == "ok") {
            if (req.body.status == "started") {
                // console.log("Started");
                await models.meeting.update({
                    status: req.body.status,
                    actual_start_time: new Date()
                }, {
                    where: {
                        meeting_id: req.body.meeting_id
                    }
                });

                return res.send({
                    status: "ok",
                    message: "",
                    webpage: "",
                    response: meetingDetails
                })
            }
            else if (req.body.status == "ended") {
                // console.log("Meeting Details: ", meetingDetails)
                console.log("Ended");
                if (meetingDetails.meeting_type === "periodic") {
                    console.log("Periodic");
                    await models.meeting.update({
                        status: "pending",
                        actual_end_time: new Date()
                    }, {
                        where: {
                            meeting_id: req.body.meeting_id
                        }
                    });                    
                } else if (meetingDetails.meeting_type === "onetime") {
                    console.log("one time");
                    await models.meeting.update({
                        status: req.body.status,
                        actual_end_time: new Date()
                    }, {
                        where: {
                            meeting_id: req.body.meeting_id
                        }
                    });
                } else if (meetingDetails.meeting_type === "nonperiodic"){
                    console.log("Non Periodic");
                    await models.meeting.update({
                        status: req.body.status,
                        actual_end_time: new Date()
                    }, {
                        where: {
                            meeting_id: req.body.meeting_id
                        }
                    });
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
                await models.meeting.update({ status: req.body.status }, {
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
        });
    } catch (error) {
        console.log("Meeting Controller || Add Logs", error);
        return res.send({
            status: "error",
            message: "Internal server error. Please try again.",
            webpage: "",
            response: ""
        });
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
        }

        if (req.body.meeting_id) {
            await models.meeting.update(editParams, {
                where: {
                    meeting_id: req.body.meeting_id
                }
            })

            const editedMeeting = await models.meeting.findOne({
                where: {
                    meeting_id: req.body.meeting_id
                }
            })

            return res.send({
                status: "ok",
                message: "",
                webpage: "",
                meeting_details: editedMeeting,
                response: "sucess"
            });
        } else {
            return res.send({
                status: "error",
                message: "Invalid meeting id. Please try again with valid meeting ID.",
                webpage: "",
                response: ""
            });
        }
    } catch (error) {
        console.log("Meeting Controller || Edit Meeting", error);
        return res.send({
            status: "error",
            message: "Internal server error. Please try again.",
            webpage: "",
            response: ""
        });
    }
}

/**
 * 
 * @param {*} meeting_id
 */
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
        });
    } catch (error) {
        console.log("Meeting Controller || Edit Meeting", error);
        return res.send({
            status: "error",
            message: "Internal server error. Please try again.",
            webpage: "",
            response: ""
        });
    }
}