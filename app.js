const express = require('express')
const session = require('express-session')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const exphbs = require('express-handlebars')
const handlebars = require('hbs')
//DB
const Sequelize = require('sequelize')
const { users,User,UserPf,Gallery,Tags } = require('./mysql_db.js')

//authentication router, authentication functions
const auth_router = require('./router/authen.js')
const search_router = require('./router/search.js')
const {registerForm, loginForm} = require('./user_functions.js')

//SETTING UP server
const app = express()
//handlebars
app.engine("hbs",exphbs.engine({
    defaultLayout:false,
    partialsDir:"./views/partials",
    extname:'.hbs'
}))
app.set("view engine","hbs")
handlebars.registerPartial("settings","/views/partials/pfsettings.hbs")
handlebars.registerPartial("auth_nav","/views/partials/auth_nav.hbs")
handlebars.registerPartial("unauth_nav","/views/partials/unauth_nav.hbs")
//static data
app.use(express.static(__dirname+"/static"))
//middleware
//cors
const CORSoptions = {
    origin: ['http://knigalitso.com','http://test.com','http://localhost:*'],
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
app.use("/search",search_router)
//Authorized user actions
app.use('/user',auth_router)

//Routing
app.get('/redirect/',(req,res)=>{
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
app.listen(1000,()=>{
    console.log(`Server started on port ${1000}\nSystem time : ${Date()}`
    )
    const connectDb = async function (){
        try{
            await users.sync(
                // {alter:true}
            )
            console.log("Connected to DB")
    }catch(err){
            console.log(err)
        }}
     connectDb()

})
