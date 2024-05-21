const { blogFeatureImageUpload } = require("../libs/multerConfig");
const path = require("path");
const fs = require("fs");
const pool = require("../db.config/mariadb.config");
const multer = require("multer")

const updatedData = multer()

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
exports.getAllBlogsPagination = async (req, res) => {
  let conn;
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 items per page

  try {
    conn = await pool.getConnection();

    // Get the total count of blogs
    const [{ totalCount }] = await conn.query('SELECT COUNT(*) AS totalCount FROM Blogs');
    
    // Convert totalCount to a number if it is a BigInt
    const totalCountNumber = Number(totalCount);

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // Fetch paginated blogs
    const getAllBlogs = await conn.query(`SELECT * FROM Blogs LIMIT ? OFFSET ?`, [pageSize, offset]);
    const blogWithData = [];

    // Asynchronously check image existence for each blog
    await Promise.all(getAllBlogs.map(async (blog) => {
      const imgPath = path.join(__dirname, `../assets/blog-img/${blog.imgUrl}`);
      if (fs.existsSync(imgPath)) {
        const imgUrl = `/assets/blog-img/${blog.imgUrl}`;
        blogWithData.push({ ...blog, imgUrl });
      }
    }));

    // If no images were found for any blog, return an error response
    if (blogWithData.length === 0) {
      return res.status(400).json({ error: "No images found for any blog" });
    }

    // Calculate total pages
    const totalPages = Math.ceil(totalCountNumber / pageSize);

    // Send the data as a JSON response with pagination metadata
    res.status(200).json({
      data: blogWithData,
      pagination: {
        totalItems: totalCountNumber,
        totalPages: totalPages,
        currentPage: page,
        pageSize: pageSize
      }
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ message: "An error occurred", error });
  } finally {
    if (conn) conn.end(); // Release the connection back to the pool
  }
};



exports.getBlogFeatureImg = async (req, res) => {
  const params = req.params.slug;
  let conn;
  try {
    conn = await pool.getConnection();
    const data = await conn.query(`SELECT * FROM Blogs WHERE slug = ?`, [
      params,
    ]);

    if (data.length > 0) {
    const featureImgData = data[0];
    const featureImgPath = path.join(
        __dirname,
        `../assets/blog-img/${featureImgData.imgUrl}`
      );
      if (fs.existsSync(featureImgPath)) {
        const imgPath = `/assets/blog-img/${featureImgData.imgUrl}`;
        res.setHeader("Content-Type", "application/json");
        res.json({ data: { ...featureImgData, imgPath } });
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
    if(conn) conn.end();
  }
};
exports.getAllBlogs = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const getAllBlogs = await conn.query(`SELECT * FROM Blogs`);
    const blogWithData = [];

    // Asynchronously check image existence for each blog
    await Promise.all(getAllBlogs.map(async (blog) => {
      const imgPath = path.join(__dirname, `../assets/blog-img/${blog.imgUrl}`);
      if (fs.existsSync(imgPath)) {
        const imgUrl = `/assets/blog-img/${blog.imgUrl}`;
        blogWithData.push({ ...blog, imgUrl });
      }
    }));

    // If no images were found for any blog, return an error response
    if (blogWithData.length === 0) {
      return res.status(400).json({ error: "No images found for any blog" });
    }

    // Send the data as a JSON response
    res.status(200).json({ data: blogWithData });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ message: "An error occurred", error });
  } finally {
    if (conn) conn.end(); // Release the connection back to the pool
  }
};

exports.deleteBlog =  async (req, res) => {
  const slug = req.params.slug;
  let conn;
  try {
    // Check if the blog post exists in the database
    conn = await pool.getConnection();
    const blog= await conn.query('SELECT * FROM Blogs WHERE slug = ?', [slug]);
    if (!blog.length) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Delete the blog post from the database
    await conn.query('DELETE FROM Blogs WHERE slug = ?', [slug]);

    // Delete the associated image file from the server
    const imagePath = path.join(__dirname, `../assets/blog-img/${blog[0].imgUrl}`);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Send success response
    res.status(200).json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'An error occurred while deleting the blog post' });
  }
};
exports.updateBlogContent = async (req, res) => {
  updatedData.none()(req,res,async (err)=>{
    if(err){
      console.log(err)
      return res.status(500).json({ error: 'An error occurred while updating the blog post' });
    }
  
  const { title, content, author } = req.body;
  console.log(req.header)
  console.log(req.body)
  if (!title || !content || !author) {
    return res.status(400).json({ error: 'Missing required fields: title, content, author' });
  }
  const slug = req.params.slug
 
  let conn;
  try {
    conn = await pool.getConnection();
    // Check if the blog post exists in the database
    const existingBlog = await conn.query('SELECT * FROM Blogs WHERE slug = ?', [slug]);
    if (!existingBlog.length) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Update the blog post in the database
    const updateBlogQuery = 'UPDATE Blogs SET title = ?, content = ?, author = ? WHERE slug = ?';
    await conn.query(updateBlogQuery, [title, content, author , slug]);

    res.status(200).json({ message: 'Blog post updated successfully' });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'An error occurred while updating the blog post' });
  }
})
};

