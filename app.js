const express = require('express')
const bodyParser = require('body-parser')

const app = express();
//parser middleware
app.use(bodyParser.json())

app.use(express.static('public'))

const { getIndex, get404 } = require('./controllers/users').indexContr
const { isAuth }= require('./controllers/auth')

const authRouter = require('./routes/auth')
const usersRouter = require('./routes/users')
const postsRouter = require('./routes/posts')

app.use('/posts',postsRouter)
app.use(authRouter)
app.use(usersRouter,isAuth)

// loading index page
app.get('/',getIndex)
// 404 error handling
app.use(get404)

const port = process.env.PORT
app.listen(port,()=> {
    console.log(`Server started on port ${port}\nSystem time : ${Date()}`
    )
})