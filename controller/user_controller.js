const appUtil = require('./../util/app-util');
const models = require('./../models');

const Client = require('node-rest-client').Client;
let client = new Client();

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
            "deviceinfo": JSON.stringify({
                "deviceid": "jitsiWeb-" + guid,
                "devicetype": "",
                "deviceimieuuid": "0123456789",
                "locationinfo": JSON.stringify(req.body.locationinfo)
            })
        }

        console.log("Params: ", params);

        client.post("https://dummyservice.teamlocus.com/webservice_v42.svc/general_webuserlogin", params, async function(response, clientRes) {
            console.log("TeamLocus Login Response: ", response);

            await model.LoginHistory({
                status: "active",
                auth_key: response.auth_key,
                user_id: response.user_id
            })
        })

        return res.send({
            status: 200
        });
    } catch (err) {
        console.log("User Controller | Login ", err);
    }
}