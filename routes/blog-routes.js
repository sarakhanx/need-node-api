const express = require("express")
const {
    blogFeatureImg,
    getBlogFeatureImg,
} = require("../controllers/blogs-controller")

const router = express.Router()

router.post("/blogupload", blogFeatureImg)
router.get("/getSingleBlog/:slug", getBlogFeatureImg)


module.exports = router;