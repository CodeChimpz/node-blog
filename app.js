const express = require('express')
const cookie = require('cookie-parser')

//mySQL
const conn = require('./mysql_db.js')

//Routers'

// const general_router = require('./router/router.js')
const cookie_router = require('./router/cookies.js')
const auth_router = require('./router/authen.js')
// const conn =require('./mysql_db.js')

//SETTING UP server
const app = express()
const port = 1000
//handlebars
app.set("view engine","handlebars")

//static data
app.use(express.static(__dirname+"/static"))
//middleware
app.use(express.urlencoded({extended:false}))
app.use(express.json())
//cookies
app.use(cookie("sosetzhopu"))


//router
app.use('/authen',auth_router)

//обрабатывает редирект на главную
app.get('/redirect/index',(req,res)=>{
        console.log("Redirecting from " + req.url)
        res.redirect("/")
})

//
app.listen(port,()=>{
    conn.connect()
        .then(()=>console.log("Connected to DB"))
        .catch(err=>()=>console.log(err))
    console.log(`Server started on port ${port}\nSystem time : ${Date()}`
    )
})