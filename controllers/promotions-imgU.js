const {
  upload,
  heroImgUpload,
  promotionsupload,
} = require("../libs/multerConfig");
const path = require("path");
const fs = require("fs");

const assetsPath = path.join(__dirname, "../assets"); //for loop all path in assets directory
const dirMediaRoot = path.join(__dirname, "..");
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

exports.heroImg = (req, res) => {
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
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "something went wrong" });
    }
    const imgFile = files.filter((file) => {
      return /\.(jpg|jpeg|png|gif)$/i.test(file);
    });
    const imageUrls = imgFile.map((file) => {
      return `/assets/hero-img/${file}`;
    });
    res.setHeader("Content-Type", "application/json");
    res.json({ images: imageUrls });
  });
};

exports.promotionContent = (req, res) => {
  // res.json({message:"working"}).status(200)
  promotionsupload.single("file")(req, res, (err) => {
    if (err) {
      res.json({ message: "something went wrong" }, err).status(400);
    }
    if (!req.file) {
      return res.status(500).json({ message: "No file uploaded" }, err);
    }
    res.json({
      message: "Promotion image was uploaded successfully",
      filename: req.file.filename,
    });
  });
};

exports.getPromotionimags = (req , res)=>{
  fs.readdir(`${assetsPath}/promotions-img`, (err, files) => {
    if(err){
      res.status(500).json({message:"Failed to load imgs from server please try again later"},err)
    }
    const imgFile = files.filter((file)=>{
      return /\.(jpg|jpeg|png|gif)$/i.test(file)
    })
    const imageUrls = imgFile.map((file)=>{
      return `/assets/promotions-img/${file}`
    })
    res.setHeader("Content-Type","application/json")
    res.json({images:imageUrls}) // res out in array by array name is 'images'
  })
}



//SECTION - Delete API
exports.deleteImg = ( req , res )=>{
  if (!req.body || !req.body.filename) {
    return res.status(400).json({ error: "Filename not provided in request body" });
  }
  const {filename} = req.body
  const filePath = path.join(assetsPath,filename);

  fs.unlink(filePath , (err)=>{
    if(err){
    return   res.status(400).json({message:"Something went wrong"}, err)
    }
    res.json({message:"Deleted image succesesfully !!"})
  })
}

exports.deletePromotionImg = (req , res ) =>{
  if(!req.body || !req.body.filename){
    return res.status(400).json({message:"Filename not provided in request body"})
  }
  const {filename} = req.body;
  const filePath = path.join(`${assetsPath}/promotions-img` , filename);

  fs.unlink(filePath ,(err)=>{
    if(err){
      return res.status(400).json({message:"Something went wrong"},err)
    }
    res.status(200).json({message:"Deleted image succesesfully !!"})
  })
}

exports.deleteImgs =  (err) => {
  if(!req.body || !req.body.filename){
    return res.status(400).json({message:"Filename not provided in request body"})
  }

  const {filename} = req.body
  const filePath = path.join(`${assetsPath}/hero-img` , filename);

  fs.unlink(filePath , (err)=>{
    if(err){
      return res.status(400).json({message:"Something went wrong"},err)
    }
    res.status(200).json({message:"Deleted image succesesfully !!"})
  })
}