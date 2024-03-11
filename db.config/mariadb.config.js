const mariadb = require('mariadb')
require('dotenv').config();

const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASS = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME


const pool = mariadb.createPool({
    host : DB_HOST,
    user : DB_USER,
    password : DB_PASS,
    database : DB_NAME,
    connectionLimit: 5
});
module.exports = pool



// debug mariadb
// async function asyncFunction(){
//     let conn;
//     try {
//         conn = await pool.getConnection();
//         const rows = await conn.query("SELECT 1 as val");
//         console.log(rows)
//         const res = await conn.query("INSERT INTO  myTable (column1, column2) value (?, ?)",[1,"mariadb"]);
//         console.log(res)
//     } catch (err) {
//     throw err        
//     }finally{
//         if(conn) conn.end();
//     }
// }
// asyncFunction();