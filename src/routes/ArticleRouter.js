const express = require("express");
const Auth = require("../middleware/Auth");

const Article = require("../models/Article");
const router = express.Router();

router.route("/")
    .post(Auth, (req, res) => {
        const { title, content } = req.body;
        const errors = [];
        if(!title || !content) errors.push("No title or content specified in request");

        if(errors.length > 0) return res.status(400).json({
            success: false,
            errors
        });

        Article.findOne({ title }).then(art => {
            if(art) return res.status(400).json({
                success: false,
                errors: ["That article title already exists. Did you mean to delete it?"]
            });

            const article = new Article({
                title,
                content,
                author: req.user.username
            });

            article.save().then(() => {
                return res.json({
                    success: true,
                    message: article.toJSON()
                });
            }).catch(err => {
                console.log(err);
                return res.status(500).json({
                    success: false,
                    errors: ["An internal server error occurred."]
                });
            });
        });
    })
    .get((req, res, next) => {
        return Article.find()
            .sort({ createdAt: "descending" })
            .then(articles => res.json({
                success: true,
                message: articles.map(article => article.toJSON()) 
            }))
            .catch(next);
    });


router.route("/:id")
    .get((req, res, next) => {
        if(!req.params.id) return res.status(400).json({
            success: false,
            errors: ["Article not specified"]
        });

        Article.findOne({ _id: req.params.id }).then(article => {
            if(!article) return res.status(400).json({
                success: false,
                errors: ["Could not find article"]
            });

            return res.json({
                success: true,
                msesage: article.toJSON()
            });
        }).catch(err => {
            console.log(err);
            res.status(400).json({
                success: false,
                errors: ["An internal server error occurred"]
            });
        });
    })
    .delete(Auth, async (req, res, next) => {
        const article = await Article.findOne({ _id: req.params.id });
        if(!article) return res.status(400).json({
            success: false,
            errors: ["Not Found"]
        });
        req.article = article;
        if(req.article.author !== req.user.username) return res.status(400).json({
            sucess: false,
            errors: ["You do not own this article."]
        });

        Article.deleteOne({ _id: req.params.id }).then(() => {
            return res.json({
                success: true,
                message: "Successfully deleted article."
            });
        }).catch(err => {
            console.log(err);
            return res.status(400).json({
                success: false,
                errors: ["An internal server error occurred"]
            });
        });
    })
    .patch(Auth, (req, res, next) => {
        const { title, content } = req.body;
        const errors = [];
        if(!title && !content) errors.push("No title or content specified");
        if(req.article.author !== req.user.username) errors.push("You do not own this article.");

        if(errors.length > 0) return res.status(400).json({
            success: false,
            errors
        });

        if(title) req.article.title = title;
        if(content) req.article.content = content;

        return req.article.save()
            .then(() => res.json({
                success: true,
                message: req.article.toJSON()
            }))
            .catch(next);
    });

module.exports = router;