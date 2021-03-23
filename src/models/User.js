const { Schema, model } = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const UserSchema = new Schema({
    uuid: {
        type: String,
        default: () => uuidv4(),
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});

module.exports = model("User", UserSchema);