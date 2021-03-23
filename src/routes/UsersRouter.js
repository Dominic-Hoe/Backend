const express = require("express");
const User = require("../models/User");
const Auth = require("../middleware/Auth");
const argon2 = require("argon2");

const router = express.Router();

router.route("/@me")
    .get(Auth, (req, res) => {
        return res.json({
            success: true,
            message: {
                uuid: req.user.uuid,
                username: req.user.username
            }
        });
    })
    .patch(Auth, async (req, res) => {
        const { confirmPassword, password } = req.body;
        const errors = [];
        if(!password && !confirmPassword) errors.push("No fields specified");
        if(password.length < 8) errors.push("Password is too short");
        if(confirmPassword.length < 8) errors.push("Old password is too short");

        const user = await User.findOne({ uuid: req.user.uuid });
        if(!user) errors.push("Your session has expired");

        if(errors.length > 0) return res.status(400).json({
            success: false,
            errors
        });

        const matches = await argon2.verify(user.password, confirmPassword, { type: argon2.argon2id });
        if(!matches) return res.status(400).json({
            success: false,
            errors: ["Your old password is incorrect."]
        });

        const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });
        user.password = hashedPassword;
        user.save().then(() => {
            return res.json({
                success: true,
                message: "Successfully updated your password"
            });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                success: false,
                errors: ["An internal server error occurred."]
            });
        });
    });

module.exports = router;