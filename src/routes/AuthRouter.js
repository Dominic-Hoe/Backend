const express = require("express");
const passport = require("passport");
const argon2 = require("argon2");
const User = require("../models/User");

const usernameRegex = /^[a-z0-9]+$/;
const router = express.Router();

router.route("/register").post(async (req, res) => {
    const { username, password } = req.body;
    const errors = [];

    if(!process.env.REGISTRATION) errors.push("Registration is disabled");
    if(!username || !password) errors.push("Username or password not specified.");
    if(!username.match(usernameRegex)) errors.push("Invalid username");
    if(password.length < 8) errors.push("Password is too short");

    const user = await User.findOne({ username });
    if(user) errors.push("Username is taken");

    if(errors.length > 0) return res.status(400).json({
        success: false,
        errors
    });

    const newUser = new User({
        username,
        password,
    });

    const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });
    newUser.password = hashedPassword;
    newUser.save().then(() => {
        return res.json({
            success: true,
            message: "Successfully registered!"
        });
    }).catch(err => {
        console.log(err);
        return res.status(500).json({
            success: false,
            errors: ["An internal server error occurred."]
        });
    });
});

router.route("/login").post((req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if(err) return next(err);
        if(info) return res.status(401).json({
            success: false,
            errors: [info],
        });
        req.logIn(user, err => {
            if(err) return next(err);
            return res.json({
                success: true,
                message: "Successfully logged in."
            });
        });
    })(req, res, next);
});

router.route("/logout").get((req, res) => req.logout());
module.exports = router;