const express = require('express')
//session
const session = require('express-session')
const cookies = require('cookie-parser')
const fileUpload = require('express-fileupload')
//DB
const Sequelize = require('sequelize')
const connection = require('./mysql_db.js')
//authentication modules
const auth_router = require('./router/authen.js')
const {registerForm, loginForm} = require('./static/user_functions.js')

//SETTING UP server
const app = express()
const port = 1000

//routers
const upload_router = require('./router/upload_from_client')
//handlebars
app.set("view engine","handlebars")
//static data
app.use(express.static(__dirname+"/static"))
//middleware
app.use(fileUpload(
    {
        abortOnLimit:8*1024*1024,
        createParentPath:true,
        safeFileNAmes:true,
        useTempFiles:true,
        tempFileDir:"/static/public/temp"
    }
))
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
// app.use(upload_router)
app.use('/user',auth_router)

//Routing

//обрабатывает редирект на главную
app.get('/redirect/index',(req,res)=>{
        res.redirect("/")
})

//register/delete from db
app.route("/registration")
    .post((req,res)=> {
        registerForm(req,res)
            .then(
                // result=>console.log(result)
            )
            .catch(err=>{
                console.log(err)
            })
    })

//login and set authentication id
app.route("/login")
    .post((req,res)=>{
        loginForm(req,res)
            .then(result=>{
                // console.log(result)
            })
            .catch(err=>{
                console.log(err)
            })
    })


//
app.listen(port,()=>{
    connection.sync(
        // {force:true}
        // {alter:true}
    )
        .then((res)=>console.log(res+"\nConnected to DB"))
        .catch(err=>()=>console.log(err))
    console.log(`Server started on port ${port}\nSystem time : ${Date()}`
    )
})
