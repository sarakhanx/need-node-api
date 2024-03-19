const multer = require("multer");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const heroupload = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/hero-img");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const promotionsupload = multer.diskStorage({
  destination : function (req , file , cb){
    cb(null, "assets/promotions-img")
  },
  filename : function (req , file , cb) {
    cb(null , Date.now() + "-" + file.originalname);
  }
})

const blogFileUpload = multer.diskStorage({
  destination: function(req , res , cb){
    cb(null, "assets/blog-img")
  },
  filename : function (req , file , cb) {
    cb(null, Date.now() + "-" + file.originalname)
  }
})


module.exports = {
  upload: multer({ storage }), //original fellow docs
  heroImgUpload: multer({ storage: heroupload }), //upload to hero-img
  promotionsupload : multer({ storage : promotionsupload }),
  blogFeatureImageUpload : multer({ storage : blogFileUpload })
};
