const {
  upload,
  heroImgUpload,
  promotionsupload,
} = require("../libs/multerConfig");
const path = require("path");
const fs = require("fs");
const pool = require("../db.config/mariadb.config");

const assetsPath = path.join(__dirname, "../assets"); //for loop all path in assets directory
const dirMediaRoot = path.join(__dirname, "..");
exports.uploadImg = (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: err.message });
    }
    const text = req.body.text;
    const filename = req.file.filename;
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const insertText =
      "INSERT INTO text_test (text, image_filename) value (?, ?)";
    pool.query(insertText, [text, filename], (dbErr, result) => {
      if (dbErr) {
        console.error("An unknown error occured", dbErr);
        return res.status(500).json({ error: "An unknown error occured" });
      }
      console.log("Text Saved", result);
    });
    res.json({
      message: "File uploaded successfully",
      filename: req.file.filename,
      text: text,
      image_filename: req.file.filename,
    });
  });
};

exports.uploadManyFiles = (req, res) => {
  upload.array("files", 2)(req, res, (err) => { // Change "file" to "files" to match the field name in your form, and limit to 2 files
    if (err) {
      console.log(err);
      return res.status(400).json({ error: err.message });
    }

    if (!req.files || req.files.length !== 2) { // Ensure that two files were uploaded
      return res.status(400).json({ error: "Two files must be uploaded" });
    }

    const text1 = req.body.text1; // Assuming you have a field named "text" in your form
    const text2 = req.body.text2; // Assuming you have a field named "text" in your form

    const filenames = req.files.map(file => file.filename);

    const insertText =
      "INSERT INTO text_test (text1 , text2, image_filename1, image_filename2) VALUES (?, ?, ?, ?)";
    pool.query(insertText, [text1, text2, filenames[0], filenames[1]], (dbErr, result) => {
      if (dbErr) {
        console.error("An unknown error occurred", dbErr);
        return res.status(500).json({ error: "An unknown error occurred" });
      }
      console.log("Text Saved", result);
    });

    res.json({
      message: "Files uploaded successfully",
      filenames: filenames,
      text1: text1,
      text2: text2,
    });
  });
};
exports.getImgAndText = async (req, res) => {
  const imgreq = await req.params.filename;
  let conn;
  try {
    conn = await pool.getConnection();
    const textAndImg = await conn.query(
      `SELECT * FROM text_test WHERE image_filename = ?`,
      [imgreq]
    );
    if (textAndImg.length > 0) {
      const imgData = textAndImg[0];
      const imgPath = path.join(
        __dirname,
        `../assets/${imgData.image_filename}`
      );
      if (fs.existsSync(imgPath)) {
        const imgUrl = `/assets/${imgData.image_filename}`;
        res.setHeader("Content-Type", "application/json");
        res.json({ textAndImg: { ...imgData, imgUrl } });
      }else{
        res.status(400).json({ error: "No image found" });
      }
    } else {
      res.status(400).json({ error: "No image found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An unknown error occured" }, error);
  } finally {
    if (conn) conn.end();
  }
};
// one to one SQL
exports.getManyFiles = async (req, res) => {
  const textReq = req.params.text1; // Assuming you want to retrieve based on text1
  let conn;
  try {
    conn = await pool.getConnection();
    const textAndImg = await conn.query(
      `SELECT * FROM text_test WHERE text1 = ?`,
      [textReq]
    );
    // console.log(textAndImg)
    if (textAndImg.length > 0) {
      const imgData = textAndImg[0];
      const imgPath1 = path.join(__dirname, `../assets/${imgData.image_filename1}`);
      const imgPath2 = path.join(__dirname, `../assets/${imgData.image_filename2}`);

      const imgUrls = [];
      if (fs.existsSync(imgPath1)) {
        imgUrls.push(`/assets/${imgData.image_filename1}`);
      }
      if (fs.existsSync(imgPath2)) {
        imgUrls.push(`/assets/${imgData.image_filename2}`);
      }

      if (imgUrls.length > 0) {
        res.setHeader("Content-Type", "application/json");
        res.json({ textAndImg: { ...imgData, imgUrls } });
      } else {
        res.status(400).json({ error: "No image found" });
      }
    } else {
      res.status(400).json({ error: "No image found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An unknown error occurred" }, error);
  } finally {
    if (conn) conn.end();
  }
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
exports.getPromotionimags = (req, res) => {
  fs.readdir(`${assetsPath}/promotions-img`, (err, files) => {
    if (err) {
      res
        .status(500)
        .json(
          { message: "Failed to load imgs from server please try again later" },
          err
        );
    }
    const imgFile = files.filter((file) => {
      return /\.(jpg|jpeg|png|gif)$/i.test(file);
    });
    const imageUrls = imgFile.map((file) => {
      return `/assets/promotions-img/${file}`;
    });
    res.setHeader("Content-Type", "application/json");
    res.json({ images: imageUrls }); // res out in array by array name is 'images'
  });
};
//SECTION - Delete API
exports.deleteImg = (req, res) => {
  if (!req.body || !req.body.filename) {
    return res
      .status(400)
      .json({ error: "Filename not provided in request body" });
  }
  const { filename } = req.body;
  const filePath = path.join(assetsPath, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(400).json({ message: "Something went wrong" }, err);
    }
    res.json({ message: "Deleted image succesesfully !!" });
  });
};

exports.deletePromotionImg = (req, res) => {
  if (!req.body || !req.body.filename) {
    return res
      .status(400)
      .json({ message: "Filename not provided in request body" });
  }
  const { filename } = req.body;
  const filePath = path.join(`${assetsPath}/promotions-img`, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(400).json({ message: "Something went wrong" }, err);
    }
    res.status(200).json({ message: "Deleted image succesesfully !!" });
  });
};

exports.deleteImgs = (req, res) => {
  if (!req.body || !req.body.filename) {
    return res
      .status(400)
      .json({ message: "Filename not provided in request body" });
  }

  const { filename } = req.body;
  const filePath = path.join(`${assetsPath}/hero-img`, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(400).json({ message: "Something went wrong" }, err);
    }
    res.status(200).json({ message: "Deleted image succesesfully !!" });
  });
};
