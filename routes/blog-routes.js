const express = require("express")
const {
    blogFeatureImg,
    getBlogFeatureImg,
    getAllBlogs,
    deleteBlog,
    updateBlogContent,
} = require("../controllers/blogs-controller")

const router = express.Router()

router.post("/blogupload", blogFeatureImg)
router.get("/getSingleBlog/:slug", getBlogFeatureImg)
router.get("/getAllBlogs", getAllBlogs)
router.delete('/deleteBlog/:slug', deleteBlog)
router.put('/updateBlog/:slug', updateBlogContent)


module.exports = router;