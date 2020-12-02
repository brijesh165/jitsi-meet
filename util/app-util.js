const shortid = require('shortid');

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