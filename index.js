const express = require('express')
const { uploadImg , getImg } = require('./routes/upload-route')
const core = require('cors')
const path = require('path')
require('dotenv').config();
const imgUploadRoute = require('./routes/upload-route')

const app = express()
const port = process.env.PORT
const corsOption = {
    origin : '*',
    origin: 'https://need.co.th',
}

app.use(core(corsOption))
app.use(express.json())
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/assets/hero-img', express.static(path.join(__dirname, 'assets/hero-img')));

app.use('/api', imgUploadRoute)

app.get('/api/hi', ()=>{
    console.log("hi folks its' amp! ")});

app.listen(port , () => {
    console.log("app is running on port" + port)
})