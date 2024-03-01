const express = require('express')
const { uploadImg , getImg } = require('./routes/upload-route')
const core = require('cors')
const path = require('path')

const app = express()
const port = 5050
const corsOption = {
    origin : '*'
}

app.use(core(corsOption))
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api/hi', ()=>{
    console.log("hi folks its' amp! ")});

app.post('/api/upload' , uploadImg)
app.get('/api/imgs' , getImg)

app.listen(port , () => {
    console.log("app is running on port" + port)
})