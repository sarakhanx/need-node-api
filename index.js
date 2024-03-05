const express = require('express')
const { uploadImg , getImg } = require('./routes/upload-route')
const cors = require('cors')
const path = require('path')
require('dotenv').config();
const imgUploadRoute = require('./routes/upload-route')

const app = express()
app.use(express.json())
const port = process.env.PORT
const corsOption = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
app.use(cors(corsOption))
app.use('*' , cors(corsOption))


app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/assets/hero-img', express.static(path.join(__dirname, 'assets/hero-img')));


app.use('/api', imgUploadRoute)

app.get('/api/hi', ()=>{
    console.log("hi folks its' amp! ")});

app.listen(port , () => {
    console.log("app is running on port" + port)
})