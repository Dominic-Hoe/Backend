const router = require("express").Router();

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to the API"
    })
});

router.use("/auth", require("./AuthRouter"));
router.use("/users", require("./UsersRouter"));
router.use("/article", require("./ArticleRouter"));

router.use((req, res, next) => {
    res.status(404).json({
        success: false,
        errors: ["Not Found"]
    });
    return next();
})

module.exports = router;