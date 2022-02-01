const express = require('express')
const session = require('express-session')
const cors = require('cors')
const fileUpload = require('express-fileupload')
//
require('dotenv').config()

//DB
const Sequelize = require('sequelize')
const {users}  = require('./mysql_db.js')
//authentication router, authentication functions
const auth_router = require('./router/authen.js')
const {registerForm, loginForm} = require('./user_functions.js')
//Redis
const redis = require('redis')
const connectRedis = require('connect-redis')(session)
//SETTING UP server
const app = express()
//handlebars
app.set("view engine","handlebars")
//static
app.use(express.static(__dirname+"/static"))
//MIDDLEWARE
//sessions
const redisClient = redis.createClient({legacyMode:true})
redisClient.on("ready",()=>{
    console.log("Connected to redis")
})
redisClient.on('error',(err)=>{
    app.close()
    throw err
})
app.use(session(
    {
        store: new connectRedis({client:redisClient}),
        secret:"aT4ck 0v D4 b34sT",
        name:'lecookie',
        saveUninitialized:false,
        cookie:{
            maxAge:60000
        },
        isAuth:false,
    }
))
//cors
const CORSoptions = {
    origin: function (origin,callback){
        const origins = process.env.ORIGINS.split(',')
        for (let supposed of origins){
            if(origin)
            {const supp_reg = new RegExp(supposed)
            console.log(origin)
            if(origin.search(supp_reg)!=-1){
                return callback(null,origin)
            }}
        }
        callback("This origin is not supported by this sites CORS policy !",null)

    },
    optionsSuccessStatus:200
}
app.use(cors(CORSoptions))

//body parsing
app.use(fileUpload(
    {
        abortOnLimit:8*1024*1024,
        responseOnLimit:"File exceeds 8mb size!",
        createParentPath:true,
        safeFileNames:true,
        useTempFiles:true,
        tempFileDir:"/static/public/temp"
    }
))
app.use(express.urlencoded({extended:false}))
app.use(express.json())
//Routing
//Authorized user actions
app.use('/user',auth_router)

//redirect to main --- не нужно, потом уберу
app.get('/redirect/index',(req,res)=>{
        res.redirect("/")
})

//register/delete from db
app.route("/registration")
    .post((req,res)=> {
        registerForm(req,res)
            .then(
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
            })
            .catch(err=>{
                console.log(err)
            })
    })

//
const port = process.env.PORT
app.listen(port,()=>{
    console.log(`Server started on port ${port}\nSystem time : ${Date()}`
    )
    connectDb();


})
async function connectDb(){
    try{
        await users.sync(
            // {force:true}
        )
        console.log("Connected to DB")
        await redisClient.connect()
    }catch(err){
        console.log(err)
    }};