const shortid = require('shortid');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const encryptkey = '123456';
const input_encoding = "utf8";
const output_encoding = "hex";

exports.createResponse = function (code, message, data) {
    return {
        code:code,
        message: message,
        data: data
    }
}

exports.createErrorResponse = function (responseCode, data) {
    return exports.createResponse(responseCode.code, responseCode.message, data);
}

exports.createSuccessResponse = function (responseCode, data) {
    return exports.createResponse(responseCode.code, responseCode.message, data);
}

exports.generateRandomId = function (prefix = '') {
    return prefix ? prefix + "-" + new Date().getTime() + "-" + shortid.generate():new Date().getTime() + "_" + shortid.generate();
}

exports.encryptMeetingId = function (meeting_id, keyword) {
    const meeting = meeting_id.toString() + "" + keyword;
    
    let cipher = crypto.createCipher(algorithm, encryptkey);
    let crypted = cipher.update(meeting, input_encoding, output_encoding);
    crypted = crypted + cipher.final(output_encoding);
    return crypted;
}

exports.decryptMeetingId = function (meeting_id) {
    let decipher = crypto.createCipher(algorithm, encryptkey);
    let dec = decipher.update(meeting_id, output_encoding, input_encoding);
    dec = dec + decipher.final(input_encoding);
    return dec;
}