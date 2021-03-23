require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const app = express();

mongoose.promise = global.Promise;

const clientP = mongoose.connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    console.log(`Connected to the database.`);
    app.listen(process.env.PORT, () => console.log(`App is running on port ${process.env.PORT}`));
    return mongoose.connection.getClient();
}).catch(err => {
    console.log(`Failed to connect to database - aborting!`);
    console.log(err);
    process.exit(-1);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:8080",
        "https://blog.domhoe.dev"
    ]
}));
app.use(session({
    secret: process.env.SESSION_SECRET || "Development",
    cookie: {
        maxAge: 60000 * 60 * 3,
    },
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
        clientPromise: clientP,
        dbName: "main",
        stringify: false,
        autoRemove: "interval",
        autoRemoveInterval: 1
    })
}));

app.use(passport.initialize());
app.use(passport.session());

require("./config/passport")(passport);

app.use("/", require("./routes"));