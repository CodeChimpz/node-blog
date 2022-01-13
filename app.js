const express = require('express')
const cookie = require('cookie-parser')
// const flash = require('connect-flash')

const auth_router = require('./router/authen.js')
const conn =require('./mysql_db.js')

const app = express()
const port = 1000

//static data
app.use(express.static(__dirname+"/static"))
//middleware
app.use(express.urlencoded({extended:false}))
app.use(express.json())
//cookies
app.use(cookie("sosetzhopu"))
//router
app.use('/authen/',auth_router)

app.route('/get-cookies')
    .post((req,res)=>{
        for (let [key,value] of Object.entries(req.body)){
            res.cookie(key,value)
        }
        res.json(JSON.stringify(req.body))
        console.log("To set cookies:" + JSON.stringify(req.body))

})
    .get((req,res)=> {
        const user_cookies = req.cookies
        res.json({"success":true,"Cookies": user_cookies});
        console.log("Cookies:"+JSON.stringify(user_cookies))
})

app.listen(port,()=>{
    console.log(`Server started on port ${port}\nSystem time : ${Date()}`
    )
})

//
