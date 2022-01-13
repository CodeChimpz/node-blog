const express = require('express')

const conn = require('../mysql_db.js')

const router = express.Router()
// conn.setNullAI()
//
router.post("/handle-login-form",(req,res)=>loginForm(req,res))

function loginForm(req,res){
    const user = req.body;
    res.json(user)

    //adding user to database
    conn.connect(err=>{
        if (err){
            console.log(err)
            return
        }
        else{
            console.log("Connected to Database")
        }
    })
    conn.query(`INSERT INTO USERS (username,useremail,userpass) VALUES (?,?,?)`,Object.keys(user),(err)=>{
        if(err) console.log(err)
        conn.end(console.log("Database connected ended"))
    })

}

module.exports = router