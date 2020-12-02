let constants = {
    responseCode: {
        CUSTOM_MESSAGE: (code, message) => ({
            code, 
            message
        }),

        SUCCESS: {
            code: 200,
            message: "Success"
        },
        INTERNAL_SERVER_ERROR: {
            code: 501,
            message: "Something went wrong. Try again!"
        },
    }
}

module.exports = constants;