const User = require("../models/User");
module.exports = async (req, res, next) => {
    if(!req.user) return res.status(403).json({
        success: false,
        errors: [
            "You are not logged in"
        ]
    });

    const user = await User.findOne({ uuid: req.user.uuid });
    req.user = user;
    return next();
}