const { blogFeatureImageUpload } = require("../libs/multerConfig");
const path = require("path");
const fs = require("fs");
const pool = require("../db.config/mariadb.config");

exports.blogFeatureImg = (req, res) => {
  blogFeatureImageUpload.single("file")(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: err.message });
    }
    const file = req.body.file;
    if (!req.file) {
      console.log("There is no file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { title, content, slug, author } = req.body;
    const insertBlog =
      "INSERT INTO Blogs (title , content , slug , author , imgUrl) VALUES (?,?,?,?,?)";
    pool.query(
      insertBlog,
      [title, content, slug, author, req.file.filename],
      (dbErr, result) => {
        if (dbErr) {
          console.log("An error ocurred", dbErr);
          return res.status(500).json({ error: "An error ocurred" });
        }
        console, log("Created a new blog successfully", result);
      }
    );
    res.json({
      message: "Blog have created successfully",
      filename: file,
      title: title,
      content: content,
      slug: slug,
      author: author,
    });
  });
};

exports.getBlogFeatureImg = async (req, res) => {
  const params = req.params.slug;
  let conn;
  try {
    conn = await pool.getConnection();
    const getData = await conn.query(`SELECT * FROM Blogs WHERE slug = ?`, [
      params,
    ]);

    if (getData.length > 0) {
    const featureImgData = getData[0];
    const featureImgPath = path.join(
        __dirname,
        `../assets/blog-img/${featureImgData.imgUrl}`
      );
      if (fs.existsSync(featureImgPath)) {
        const imgPath = `/assets/blog-img/${featureImgData.imgUrl}`;
        res.setHeader("Content-Type", "application/json");
        res.json({ getData: { ...featureImgData, imgPath } });
      } else {
        res.status(400).json("feature images not found");
        console.log(featureImgData)
      }
    } else {
      res.status(400).json("content not found");
    }
  } catch (error) {
    console.log("something went wrongs from catch in API", error);
  } finally {
    if (conn) conn.end();
  }
};
