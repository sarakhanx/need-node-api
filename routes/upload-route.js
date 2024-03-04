const express = require("express");
const { promotionImg , uploadImg , getImg, provide_heroImg} = require("../controllers/promotions-imgU");

const router = express.Router();

router.post('/upload' , uploadImg)
router.get('/imgs' , getImg)
router.post('/heroupload' , promotionImg)
router.get('/heroimgs' , provide_heroImg)


module.exports = router;
