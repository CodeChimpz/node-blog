const express = require('express')
//session
const session = require('express-session')
const cookies = require('cookie-parser')

//DB
const Sequelize = require('sequelize')
const connection = require('./mysql_db.js')
//
const auth_router = require('./authen.js')


//SETTING UP server
const app = express()
const port = 1000

//routers

//handlebars
app.set("view engine","handlebars")
//static data
app.use(express.static(__dirname+"/static"))
//middleware
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//sessions
app.use(session(
    {
        secret:"aT4ck 0v D4 b34sT",
        saveUninitialized:false,
        cookie:{
            maxAge:60000
        }
    }
))

//router
app.use('/authen',auth_router)

//ROUTING

//обрабатывает редирект на главную
app.get('/redirect/index',(req,res)=>{
        res.redirect("/")
})

//
app.listen(port,()=>{
    connection.sync()
        .then((res)=>console.log(res+"\nConnected to DB"))
        .catch(err=>()=>console.log(err))
    console.log(`Server started on port ${port}\nSystem time : ${Date()}`
    )
})
