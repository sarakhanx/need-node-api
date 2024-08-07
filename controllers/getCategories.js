const path = require("path");
const fs = require("fs");
const pool = require("../db.config/mariadb.config");
const { upload } = require("../libs/multerConfig");

//NOTE - Get All Products base on category
exports.getProductsFromcate = async (req, res) => {
  const params = req.params.category;
  let conn;
  try {
    conn = await pool.getConnection();
    const data = await conn.query(
      `SELECT * FROM products WHERE category_id = ?`,
      [params]
    );
    if (data.length > 0) {
      const resData = [];
      data.forEach((product) => {
        const imgUrls = [];
        for (let i = 1; i <= 5; i++) {
          const imgPath = path.join(
            __dirname,
            `../assets/${product[`image${i}`]}`
          );
          if (fs.existsSync(imgPath)) {
            imgUrls.push(`/assets/${product[`image${i}`]}`);
          }
        }
        if (imgUrls.length > 0) {
          resData.push({ ...product, imgUrls });
        }
      });
      if (resData.length > 0) {
        res.json({ data: resData });
      } else {
        res.status(400).json({ error: "No image found from product" });
      }
    } else {
      res.status(400).json({ error: "No products found for the category" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred", error });
  } finally {
    if (conn) conn.end();
  }
};
//NOTE - Product Upload
exports.productUpload = (req, res) => {
  upload.array("files", 5)(req, res, async (error) => {
    if (error) {
      console.log(err);
      return res.status(400).json({ error: error.message });
    }
    if (!req.files || req.files <= 5) {
      console.log("no files upload, Need 5 images to attached");
      return res.status(400).json({ error: "No file uploaded" });
    }
    const { title, description, size, colors, weight, category_id } = req.body;
    const categoryIdAsNumber = parseInt(category_id, 10);
    if (!categoryIdAsNumber) {
      console.log("category id is not a number");
      return res.status(400).json({ error: "Category id is not a number" });
    }
    const weightAsDecimal = parseFloat(weight);
    if (isNaN(weightAsDecimal)) {
      return res.status(400).json({ error: "Invalid weight" });
    }
    const filenames = req.files.map((file) => file.filename);
    const sqlQuery =
      "INSERT INTO products (title , description , size , colors , weight , category_id , image1, image2 ,image3, image4, image5) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
    await pool.query(
      sqlQuery,
      [
        title,
        description,
        size,
        colors,
        weightAsDecimal,
        categoryIdAsNumber,
        filenames[0],
        filenames[1],
        filenames[2],
        filenames[3],
        filenames[4],
      ],
      (dbErr, result) => {
        if (dbErr) {
          console.log("An error ocurred", dbErr);
          return res.status(500).json({ error: "An error ocurred" });
        }
        console.log("Saved Data Successfully", result);
      }
    );
    res.json({
      message: "Data uploaded successfully",
      filenames: filenames,
      title: title,
      description: description,
      size: size,
      colors: colors,
      weight: weightAsDecimal,
      category_id: categoryIdAsNumber,
    });
  });
};
//NOTE - Get Single Product
exports.getSingleProduct = async (req, res) => {
  const params = req.params.id;
  let conn;
  try {
    conn = await pool.getConnection();
    const data = await conn.query(`SELECT * FROM products WHERE id = ?`, [
      params,
    ]);
    if (data.length > 0) {
      const resData = [];
      data.forEach((product) => {
        const imgUrls = [];
        for (let i = 1; i <= 5; i++) {
          const imgPath = path.join(
            __dirname,
            `../assets/${product[`image${i}`]}`
          );
          if (fs.existsSync(imgPath)) {
            imgUrls.push(`/assets/${product[`image${i}`]}`);
          }
        }
        if (imgUrls.length > 0) {
          resData.push({ ...product, imgUrls });
        }
      });
      if (resData.length > 0) {
        res.json({ data: resData });
      } else {
        res.status(400).json({ error: "No image found from product" });
      }
    } else {
      res.status(400).json({ error: "No products found for the category" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred", error });
  } finally {
    if (conn) conn.end();
  }
};
//NOTE Delete Product and images from server
exports.productDelete = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: "Product ID is required" });
  }
  let conn;
  try {
    conn = await pool.getConnection();
    const getImagesQuery =
      "SELECT image1, image2, image3, image4, image5 FROM products WHERE id = ?";
    const [rows] = await conn.query(getImagesQuery, [id]);
    // console.log(rows)
    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const images = await rows;
    console.log(images);
    const imagePaths = Object.values(images)
      .filter(Boolean)
      .map((filename) => path.join(__dirname, "assets", filename));

    const deleteProductQuery = "DELETE FROM products WHERE id = ?";
    await conn.query(deleteProductQuery, [id]);

    imagePaths.forEach((imagePath) => {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(`Failed to delete image: ${imagePath}`, err);
        }
      });
    });
    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("An error occurred while deleting the product", error);
    return res.status(500).json({ error: "An error occurred" });
  }
};

//NOTE - Pagination for Products
exports.paginationProducts = async (req, res) => {
  const params = req.params.category;
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;

  let conn;
  try {
    conn = await pool.getConnection();
    const [{ totalCount }] = await conn.query(
      "SELECT COUNT(*) AS totalCount FROM products WHERE category_id = ?",
      [params]
    );

    // Convert totalCount to a number if it is a BigInt
    const totalCountNumber = Number(totalCount);
    if (totalCountNumber === 0) {
      return res
        .status(404)
        .json({ error: "No products found for the category" });
    }

    const offset = (page - 1) * pageSize;

    const data = await conn.query(
      `SELECT * FROM products WHERE category_id = ? LIMIT ? OFFSET ?`,
      [params, pageSize, offset]
    );

    if (data.length > 0) {
      const resData = [];
      data.forEach((product) => {
        const imgUrls = [];
        for (let i = 1; i <= 5; i++) {
          //เอาไปเช็ค ว่ามีรูปในโฟลเดอร์หรือไม่
          const imgPath = path.join(
            __dirname,
            `../assets/${product[`image${i}`]}`
          );
          //ถ้ามี ให้เอาไปเก็บในตัวแปร imgUrls และส่งออกไปเลย
          if (fs.existsSync(imgPath)) {
            imgUrls.push(`/assets/${product[`image${i}`]}`);
          }
        }
        if (imgUrls.length > 0) {
          resData.push({ ...product, imgUrls });
        } else {
          resData.push({ ...product, imgUrls: [] });
        }
      });
      if (resData.length > 0) {
        const totalPages = Math.ceil(totalCountNumber / pageSize);
        res.json({
          data: resData,
          pagination: {
            totalItems: totalCountNumber,
            totalPages: totalPages,
            currentPage: page,
            pageSize: pageSize,
          },
        });
      } else {
        res.status(400).json({ error: "No image found from product" });
      }
    } else {
      res.status(400).json({ error: "No products found for the category" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred", error });
  } finally {
    if (conn) conn.end();
  }
};

exports.AllProductListHundred = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;
  let conn;

  try {
    conn = await pool.getConnection();
    const [{ totalCount }] = await conn.query(
      "SELECT COUNT(*) AS totalCount FROM products"
    );

    const totalCountNumber = Number(totalCount);
    if (totalCountNumber === 0) {
      return res
        .status(404)
        .json({ error: "No products found for the category" });
    }

    const offset = (page - 1) * pageSize;
    const data = await conn.query(`SELECT * FROM products LIMIT ? OFFSET ?`, [
      pageSize,
      offset,
    ]);
    if (data.length > 0) {
      const resData = [];
      data.forEach((product) => {
        const imgUrls = [];
        for (let i = 1; i <= 5; i++) {
          //เอาไปเช็ค ว่ามีรูปในโฟลเดอร์หรือไม่
          const imgPath = path.join(
            __dirname,
            `../assets/${product[`image${i}`]}`
          );
          //ถ้ามี ให้เอาไปเก็บในตัวแปร imgUrls และส่งออกไปเลย
          if (fs.existsSync(imgPath)) {
            imgUrls.push(`/assets/${product[`image${i}`]}`);
          }
        }
        if (imgUrls.length > 0) {
          resData.push({ ...product, imgUrls });
        } else {
          resData.push({ ...product, imgUrls: [] });
        }
      });
      if (resData.length > 0) {
        const totalPages = Math.ceil(totalCountNumber / pageSize);
        res.json({
          data: resData,
          pagination: {
            totalItems: totalCountNumber,
            totalPages: totalPages,
            currentPage: page,
            pageSize: pageSize,
          },
        });
      } else {
        res.status(400).json({ error: "No image found from product" });
      }
    } else {
      res.status(400).json({ error: "No products found for the category" });
    }
  } catch (error) {
    console.log(error);
  } finally {
    if (conn) conn.end();
  }
};

// exports.editProduct = async (req, res) => {
//   let conn;
//   const params = await req.params.params;
//   console.log(params);

//   try {
//     conn = await pool.getConnection();
//     const query = "SELECT * FROM products WHERE id = ?";
//     const productInRow = await conn.query(query, [params]);
//     if(productInRow.length === 0){
//         console.log("not found")
//         return res.status(404).json({ message: "Product not found" });
//     }
    
//     return res.status(200).json({ product: [productInRow] });
//   } catch (error) {
//     console.log(error);
//   } finally {
//     if (conn) conn.end();
//   }
// };
exports.editProduct = async (req, res) => {
  upload.array("files", 5)(req, res, async (error) => {
    if (error) {
      console.log(error);
      return res.status(400).json({ error: error.message });
    }

    const productId = req.params.params;
    const { title, description, size, colors, weight, category_id } = req.body;

    // Validate the category ID and weight
    const categoryIdAsNumber = parseInt(category_id, 10);
    if (!categoryIdAsNumber) {
      console.log("category id is not a number"
        ,category_id
      );
      return res.status(400).json({ error: "Category id is not a number" });
    }

    const weightAsDecimal = parseFloat(weight);
    if (isNaN(weightAsDecimal)) {
      return res.status(400).json({ error: "Invalid weight" });
    }

    // Validate and process file uploads
    const filenames = req.files.map((file) => file.filename);
    const imageFields = ['image1', 'image2', 'image3', 'image4', 'image5'];
    const imageValues = Array(5).fill(null).map((_, index) => filenames[index] || null);

    // Construct the update query
    let updateQuery = 'UPDATE products SET ';
    const updateFields = [];
    const updateValues = [];

    if (title) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (description) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (size) {
      updateFields.push('size = ?');
      updateValues.push(size);
    }
    if (colors) {
      updateFields.push('colors = ?');
      updateValues.push(colors);
    }
    if (!isNaN(weightAsDecimal)) {
      updateFields.push('weight = ?');
      updateValues.push(weightAsDecimal);
    }
    if (!isNaN(categoryIdAsNumber)) {
      updateFields.push('category_id = ?');
      updateValues.push(categoryIdAsNumber);
    }

    // Include image fields if new images were uploaded
    imageFields.forEach((field, index) => {
      if (imageValues[index]) {
        updateFields.push(`${field} = ?`);
        updateValues.push(imageValues[index]);
      }
    });

    updateQuery += updateFields.join(', ') + ' WHERE id = ?';
    updateValues.push(productId);

    let conn;
    try {
      conn = await pool.getConnection();
      const result = await conn.query(updateQuery, updateValues);
      if (result.affectedRows === 0) {
        console.log("Product not found");
        return res.status(404).json({ error: "Product not found" });
      }

      console.log("Product updated successfully", result);
      return res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
      console.log("An error occurred", error);
      return res.status(500).json({ error: "An error occurred" });
    } finally {
      if (conn) conn.end();
    }
  });
};
