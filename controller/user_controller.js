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
        
        if (loginReq.data.status == "ok") {
            console.log("Response: ", loginReq.data.response.table1);

            const userAlreadyExist = await models.user.findAll({
                where: {
                    user_id: loginReq.data.response.table1.userid
                }
            });

            console.log("User Already Exist: ", userAlreadyExist);

            if (!userAlreadyExist.length > 0) {
                await models.User({
                    user_id: loginReq.data.response.table1.userid,
                    user_name: loginReq.data.response.table1.username,
                    full_name: loginReq.data.response.table1.username
                })                
            }

            await models.LoginHistory({
                status: "active",
                auth_key: loginReq.data.response.table1.key,
                user_id: loginReq.data.response.table1.userid
            })
        }

        return res.send({
            status: 200
        })
    } catch (err) {
        console.log("User Controller | Login ", err);
    }
}