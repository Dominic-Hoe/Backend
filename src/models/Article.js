const { Schema, model } = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ArticleSchema = new Schema({
    uuid: {
        type: String,
        default: () => uuidv4(),
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
}, { timestamps: true });

ArticleSchema.methods.toJSON = function() {
    return {
        _id: this._id,
        title: this.title,
        content: this.content,
        author: this.author,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

module.exports = model("Article", ArticleSchema);