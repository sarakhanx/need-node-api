const mariadb = require('mariadb')
require('dotenv').config();

const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASS = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME


const pool = mariadb.createPool({
    host : DB_HOST,
    user : DB_USER,
    port : 3307,
    password : DB_PASS,
    database : DB_NAME,
    connectionLimit: 5
});
module.exports = pool