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
//custom mw

//sessions
app.use(session(
    {
        secret:"aT4ck 0v D4 b34sT",
        saveUninitialized:false,
        cookie:{
            maxAge:60000
        },
        isAuth:false,
    }
))

//router
app.use('/authen',auth_router)

app.use("/draw-user-auth",(req,res)=>{
    if(req.session.isAuth){
        return res.status(201).append("Content-Type","text/html").append("Draw","Auth").send(
            ` <a id ="user" href="/authen/user">User page</a>
        <a class="logout" href="/authen/logout">Logout</a>`
        )
    }
    res.status(298).append("Content-Type","text/html").append("Draw","Unauth").send(
        `<a id="login"  href="/authen/login.html">Log in</a>
         <a id="register" href="/authen/register.html">Register</a>`)
})

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
