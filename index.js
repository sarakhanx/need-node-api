const express = require('express')
const { uploadImg , getImg } = require('./routes/upload-route')
const cors = require('cors')
const path = require('path')
require('dotenv').config();
const imgUploadRoute = require('./routes/upload-route')

const app = express()
const port = process.env.PORT
const corsOption = {
    origin: ['*', 'https://need.co.th','https://need-shopping.vercel.app/'],
}

app.use(cors(corsOption))
app.use(express.json())
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/assets/hero-img', express.static(path.join(__dirname, 'assets/hero-img')));

app.options('/api/delpromotionimgs/:filename', cors())
app.use('/api', imgUploadRoute)

app.get('/api/hi', ()=>{
    console.log("hi folks its' amp! ")});

app.listen(port , () => {
    console.log("app is running on port" + port)
})