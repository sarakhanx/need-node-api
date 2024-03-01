const multer =  require("multer")
const path = require("path")
const fs = require("fs")

const storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null , 'assets/')
    },
    filename : function(req, file, cb){
        cb(null , Date.now() + '-' + file.originalname)
    }
});

const upload = multer({
    storage
})
const assetsPath = path.join(__dirname, '../assets')

module.exports.uploadImg = (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.log(err)
            return res.status(400).json({ error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.json({ message: 'File uploaded successfully', filename: req.file.filename });
    });
};

module.exports.getImg = (req , res )=>{
    fs.readdir(assetsPath , (err , files)=>{
        if(err){
            console.log(err)
            return res.status(500).json({error:"something went wrongs"})
        }
        const imgFile = files.filter(file =>{
            return /\.(jpg|jpeg|png|gif)$/i.test(file);
        })
        const imageUrls = imgFile.map(file => {
            return `/assets/${file}`;
          });
          res.setHeader('Content-Type', 'application/json');
          res.json({ images: imageUrls });
    })
}