const app = require('./src/app')
const path = require('path')
const mongoose = require('mongoose')

// const migrations = require('./migrations')
require('dotenv').config({path:path.resolve(__dirname,'./config/.env')})

const port = process.env.PORT

// console.log("Starting server")
mongoose.connect(process.env.MONGO_DEV)
    .then(result=>{
        console.log("Connected to mongoose")
        app.listen(port,()=> {
        console.log(`Server started on port ${port}\nSystem time : ${Date()}`
        )
    })})
    .catch(err=>{console.log(err)})
