
exports.login = async (req, res) => {
    try {
        console.log("Login Params: ", req.body);
    } catch (err) {
        console.log("User Controller | Login ", err);
    }
}