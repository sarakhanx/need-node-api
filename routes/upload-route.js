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
  getImgAndText,
  uploadManyFiles,
  getManyFiles,
} = require("../controllers/promotions-imgU");
const {
  getProductsFromcate,
  productUpload,
} = require('../controllers/getCategories')

const router = express.Router();

router.post("/upload", uploadImg); //originals
router.post('/uploadmanyfiles',uploadManyFiles)
router.get('/getmanyfiles/:text1',getManyFiles)
router.get("/imgs", getImg); //originals
router.delete("/deleteImg/:filename", deleteImg); //originals
router.get("/getdata/:filename",getImgAndText) //originals

router.post("/heroupload", heroImg);
router.get("/heroimgs", provide_heroImg);
router.delete("/herodelimgs/:filename", deleteImgs);

router.post("/promotions", promotionContent);
router.get("/getpromotionimgs", getPromotionimags);
router.delete("/delpromotionimgs/:filename", deletePromotionImg);


// SECTION : GET PRODUCTS FROM CATE
router.get('/getProductsFromcate/:category',getProductsFromcate)
router.post('/uploadProduct',productUpload)



module.exports = router;