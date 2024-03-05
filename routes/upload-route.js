const express = require("express");
const {
  heroImg,
  uploadImg,
  getImg,
  provide_heroImg,
  promotionContent,
  getPromotionimags,
  deleteImg,
  deletePromotionImg,
  deleteImgs,
} = require("../controllers/promotions-imgU");
const cors = require("cors");

const router = express.Router();

router.post("/upload", uploadImg); //originals
router.get("/imgs", getImg); //originals
router.delete("/deleteImg/:filename", deleteImg); //originals

router.post("/heroupload", heroImg);
router.get("/heroimgs", provide_heroImg);
router.delete("/herodelimgs/:filename", deleteImgs);

router.post("/promotions", promotionContent);
router.get("/getpromotionimgs", getPromotionimags);
router.delete("/delpromotionimgs/:filename", deletePromotionImg);

module.exports = router;
