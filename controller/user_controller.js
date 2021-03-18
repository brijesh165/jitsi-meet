const appUtil = require('./../util/app-util');
const models = require('./../models');

const axios = require('axios');

/**
 * 
 * @param {*} username 
 * @param {*} password
 * @param {*} gmtoffset
 * @param {*} deviceinfo
 * @param {*} deviceid
 * @param {*} locationinfo 
 */
exports.login = async (req, res) => {
    try {
        console.log("Login Params: ", req.body);
        const guidScript = () => {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
    
        const guid = (guidScript() + guidScript() + "-" + guidScript() + "-4" + guidScript().substr(0, 3) + "-" + guidScript() + "-" + guidScript() + guidScript() + guidScript()).toLowerCase();
        
        const params = {
            "username": req.body.username,
            "password": req.body.password,
            "gmtoffset": req.body.gmtoffset,
            "ipaddress": "0123456789",
            "deviceinfo": JSON.stringify({
                "deviceid": "jitsiWeb-" + guid,
                "devicetype": "",
                "deviceimieuuid": "0123456789",
                "locationinfo": JSON.stringify(req.body.locationinfo)
            })
        }

        console.log("Params: ", params);

        const loginReq = await axios.post("https://dummyservice.teamlocus.com/webservice_v42.svc/general_webuserlogin", params);
        // console.log("Response: ", loginReq);

        if (loginReq.data.status == "ok") {
            // console.log("Response: ", loginReq.data.response.table1);
            // console.log("User Id: ", loginReq.data.response.table1[0].userid)
            const userAlreadyExist = await models.User.findAll({
                where: {
                    user_id: loginReq.data.response.table1[0].userid
                }
            });

            // console.log("User Already Exist: ", userAlreadyExist);

            if (!userAlreadyExist.length > 0) {
                await models.User.create({
                    user_id: loginReq.data.response.table1[0].userid,
                    user_name: loginReq.data.response.table1[0].username,
                    full_name: loginReq.data.response.table1[0].userdisplayname
                })                
            }

            await models.LoginHistory.create({
                status: "active",
                auth_key: loginReq.data.response.table1[0].key,
                user_id: loginReq.data.response.table1[0].userid
            })

            return res.send({
                status: 200,
                message: "User login successful",
                data: loginReq.data.response.table1[0]
            })
        } else if (loginReq.data.status == "error") {
            return res.send({
                status: 404,
                message: loginReq.data.message
            })
        } else {
            return res.send({
                status: 404,
                message: "Something went wrong!"
            })
        }


    } catch (err) {
        console.log("User Controller | Login ", err);
    }
}