const path = require("path");
const fs = require("fs");
const pool = require("../db.config/mariadb.config");
const {upload } = require('../libs/multerConfig')

const assetsPath = path.join(__dirname, "../assets"); 

// exports.getProductsFromcate = async (req, res)=>{
//     const params = req.params.category
//     let conn;
//     try {
//         conn = await pool.getConnection();
//         const data = await conn.query(
//             `SELECT * FROM products WHERE category_id = ?`,
//             [params]);
//             // res.json(data);
//             if(data.length > 0){
//                 const imgData = data[0];
//                 const imgPath1 = path.join(__dirname , `../assets/${imgData.image1}`);
//                 const imgPath2 = path.join(__dirname , `../assets/${imgData.image2}`);
//                 const imgPath3 = path.join(__dirname , `../assets/${imgData.image3}`);
//                 const imgPath4 = path.join(__dirname , `../assets/${imgData.image4}`);
//                 const imgPath5 = path.join(__dirname , `../assets/${imgData.image5}`);
                
//                 const imgUrls = []
//                 if(fs.existsSync(imgPath1)){
//                     imgUrls.push(`/assets/${imgData.image1}`);
//                 }
//                 if(fs.existsSync(imgPath2)){
//                     imgUrls.push(`/assets/${imgData.image2}`);
//                 }
//                 if(fs.existsSync(imgPath3)){
//                     imgUrls.push(`/assets/${imgData.image3}`);
//                 }
//                 if(fs.existsSync(imgPath4)){
//                     imgUrls.push(`/assets/${imgData.image4}`);
//                 }
//                 if(fs.existsSync(imgPath5)){
//                     imgUrls.push(`/assets/${imgData.image5}`);
//                 }

//                 if(imgUrls.length > 0){
//                     res.setHeader("Content-Type", "application/json");
//                     res.json({data: {...imgData , imgUrls}});
//                 }else{
//                     res.status(400).json({ error: "No image found" });
//                 }
//             }else{
//                 res.status(400).json({ error: "No image found" });
//             }
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({message:"An error occured " , error})
//     }finally{
//         if (conn) conn.end();
//     }
// }
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
            data.forEach((product)=>{
                const imgUrls = [];
                for (let i = 1; i <= 5; i++) {
                    const imgPath = path.join(__dirname, `../assets/${product[`image${i}`]}`);
                    if (fs.existsSync(imgPath)) {
                        imgUrls.push(`/assets/${product[`image${i}`]}`);
                    }
                }
                if (imgUrls.length > 0) {
                    resData.push({...product , imgUrls});
                }
            });
            if(resData.length>0){
                res.json({data: resData});
            }else{
                res.status(400).json({error:"No image found from product"});
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
exports.productUpload = (req , res) =>{
    upload.array("files" , 5)(req , res , async (error)=> {
        if(error){
            console.log(err)
            return res.status(400).json({error : error.message})
        }
        if(!req.files || req.files<=5){
            console.log("no files upload, Need 5 images to attached")
            return res.status(400).json({error : "No file uploaded"})
        }
        const {title , description  ,size , colors , weight , category_id} = req.body
        const categoryIdAsNumber = parseInt(category_id, 10);
        if(!categoryIdAsNumber){
            console.log("category id is not a number")
            return res.status(400).json({error : "Category id is not a number"})
        }
        const weightAsDecimal = parseFloat(weight);
        if (isNaN(weightAsDecimal)) {
            return res.status(400).json({ error: "Invalid weight" });
        }
        const filenames = req.files.map(file =>file.filename)
        const sqlQuery = "INSERT INTO products (title , description , size , colors , weight , category_id , image1, image2 ,image3, image4, image5) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
      await  pool.query(sqlQuery,[title , description  ,size , colors , weightAsDecimal , categoryIdAsNumber , filenames[0] , filenames[1] , filenames[2] , filenames[3] , filenames[4]] , (dbErr , result)=>{
            if(dbErr){
                console.log("An error ocurred" , dbErr)
                return res.status(500).json({error : "An error ocurred"})
            }
            console.log("Saved Data Successfully", result)
        })
        res.json({
            message : "Data uploaded successfully",
            filenames: filenames,
            title : title,
            description : description,
            size : size,
            colors : colors,
            weight : weightAsDecimal,
            category_id : categoryIdAsNumber,
        })
    } )
}
exports.getSingleProduct = async (req , res)=>{
    const params = req.params.id
    let conn;
    try {
        conn = await pool.getConnection();
        const data = await conn.query(
            `SELECT * FROM products WHERE id = ?`,
            [params]
        );
       if (data.length > 0) {
            const resData = [];
            data.forEach((product)=>{
                const imgUrls = [];
                for (let i = 1; i <= 5; i++) {
                    const imgPath = path.join(__dirname, `../assets/${product[`image${i}`]}`);
                    if (fs.existsSync(imgPath)) {
                        imgUrls.push(`/assets/${product[`image${i}`]}`);
                    }
                }
                if (imgUrls.length > 0) {
                    resData.push({...product , imgUrls});
                }
            });
            if(resData.length>0){
                res.json({data: resData});
            }else{
                res.status(400).json({error:"No image found from product"});
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
}