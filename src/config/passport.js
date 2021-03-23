const argon2 = require("argon2");
const LocalStrategy = require("passport-local").Strategy;

const User = require("../models/User");
module.exports = passport => {
    passport.use(new LocalStrategy((username, password, done) => {
        User.findOne({ username }).then(async user => {
            if(!user) return done(null, false, "That user does not exist.");
            const matches = await argon2.verify(user.password, password, { type: argon2.argon2id });
            if(matches) return done(null, user);
            else return done(null, false, "Incorrect password.");
        })
    }));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => User.findById(id, (err, user) => done(err, user)));
}