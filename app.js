const express = require('express')
const bodyParser = require('body-parser')

//Mongodb
const mongoose = require('mongoose')
require('dotenv').config()
const app = express();

//parser middleware
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(express.static('public'))

const { getIndex, get404 } = require('./controllers/index')
const isAuth = require('./middleware/auth')

const authRouter = require('./routes/auth')
const usersRouter = require('./routes/users')
const postsRouter  = require('./routes/posts')

app.use('/posts',postsRouter)
app.use('/auth',authRouter)
app.use(usersRouter)

// loading index page
app.get('/',getIndex)
// 404 error handling
app.use(get404)

const port = process.env.PORT
mongoose.connect(process.env.der_parol)
    .then((result)=>app.listen(port,()=> {
        console.log(`Server started on port ${port}\nSystem time : ${Date()}`
    )
}))
    .catch(err=>{console.log(err)})
