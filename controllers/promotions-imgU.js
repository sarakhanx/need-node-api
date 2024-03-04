const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

const upload = multer({ storage });
const heroImgUpload = multer({ storage: heroupload });

const assetsPath = path.join(__dirname, "../assets");

exports.uploadImg = (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({
      message: "File uploaded successfully",
      filename: req.file.filename,
    });
  });
};
exports.getImg = (req, res) => {
  fs.readdir(assetsPath, (err, files) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "something went wrongs" });
    }
    const imgFile = files.filter((file) => {
      return /\.(jpg|jpeg|png|gif)$/i.test(file);
    });
    const imageUrls = imgFile.map((file) => {
      return `/assets/${file}`;
    });
    res.setHeader("Content-Type", "application/json");
    res.json({ images: imageUrls });
  });
};

exports.promotionImg = (req, res) => {
  heroImgUpload.single("file")(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({
      message: "File uploaded to hero-img successfully",
      filename: req.file.filename,
    });
  });
};

exports.provide_heroImg = (req, res) => {
    fs.readdir(`${assetsPath}/hero-img`, (err, files) => {
        if(err){
            console.log(err)
            return res.status(500).json({message:"something went wrong"})
        }
        const imgFile = files.filter((file) => {
            return /\.(jpg|jpeg|png|gif)$/i.test(file);
        });
        const imageUrls = imgFile.map((file) => {
            return `/assets/hero-img/${file}`;
        });
        res.setHeader("Content-Type", "application/json");
        res.json({ images: imageUrls });
    })
}