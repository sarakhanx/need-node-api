const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config();
const imgUploadRoute = require('./routes/upload-route')
const bodyParser = require("body-parser");
const blogRoute = require('./routes/blog-routes')
const perksRoute = require('./routes/perk-routes')
const pool = require("./db.config/mariadb.config");

const port = process.env.PORT


// SECTION : middleware
const app = express()
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({type:'application/json'}))

const corsOption = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 200,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
app.use(cors(corsOption))
app.use('*' , cors(corsOption))


app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/assets/hero-img', express.static(path.join(__dirname, 'assets/hero-img')));


app.use('/api', imgUploadRoute , blogRoute , perksRoute)

app.get('/api/hi', ()=>{
    console.log("hi folks its' amp! ")});



app.listen(port , async ()  => {
    conn = await pool.getConnection();
    if(!conn){
        console.log("Database is not connected")
    }else{
        console.log("Database is connected")
    }
    console.log("app is running on port" + port)
})