const app = require('./app')
const mongoose = require('mongoose')

require('dotenv').config()

const port = process.env.PORT

mongoose.connect(process.env.MONGO_DEV)
    .then(result=>
        app.listen(port,()=> {
        console.log(`Server started on port ${port}\nSystem time : ${Date()}`
        )
    }))
    .catch(err=>{console.log(err)})