const express = require('express')
const session = require('express-session')
// const cookies = require('cookie-parser')
const fileUpload = require('express-fileupload')
const cors = require('cors')
//DB
const Sequelize = require('sequelize')
const {
    users,
    app_opt,
    session_store}  = require('./mysql_db.js')

//authentication router, authentication functions
const auth_router = require('./router/authen.js')
const {registerForm, loginForm} = require('./user_functions.js')

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
//cors
const CORSoptions = {
    origin: ['http://knigalitso.com','http://test.com'],
    optionsSuccessStatus:200
}
app.use(cors(CORSoptions))
//body parsing
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
//Authorized user actions
app.use('/user',auth_router)

//Routing

//redirect to main --- не нужно, потом уберу
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
    console.log(`Server started on port ${port}\nSystem time : ${Date()}`
    )
    const connectDb = async function (){
        try{
        await users.sync()
        await session_store.sync()
        await app_opt.sync()
            console.log("Connected to DB")
    }catch(err){
            console.log(err)
        }}
     connectDb()

})
