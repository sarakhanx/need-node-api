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
const product = require('../controllers/getCategories')

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
router.get('/getProductsFromcate/:category',product.getProductsFromcate)
router.post('/uploadProduct',product.productUpload)
router.get('/getsingleproduct/:id',product.getSingleProduct)
router.delete("/product-delete/:id",product.productDelete)
router.get("/products-cate/:category",product.paginationProducts)
router.get("/products",product.AllProductListHundred)
router.put('/product-update/:params',product.editProduct)



module.exports = router;