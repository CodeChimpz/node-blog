const express = require('express')
const cookie = require('cookie-parser')
// const flash = require('connect-flash')

const auth_router = require('./router/authen.js')
const conn =require('./mysql_db.js')

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
app.use('/authen/',auth_router)


//
app.listen(port,()=>{
    console.log(`Server started on port ${port}\nSystem time : ${Date()}`
    )
})