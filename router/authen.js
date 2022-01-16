const express = require('express')
const conn = require('../mysql_db.js')
const router = express.Router()


//decoy ecrypter
function encrypt(pass){
    return pass
}

router.post("/handle-user/registration",(req,res)=> {
     registerForm(req,res)
         .then(result=>console.log(result))
         .catch(err=>{
             res.status(500).json({"message":`Error`,"success":"false"})
             console.log(err)
         })
}

)
router.post("/handle-user/login",(req,res)=>{
    loginForm(req,res)
        .then(result=>console.log(result))
        .catch(err=>{
            res.status(500).json({"message":`Error`,"success":"false"})
            console.log(err)
        })
})

//handle Form functions


async function registerForm(req,res){

        const user = req.body

        const nameCheck = await conn.query(`select username from users where username = (?) limit 1`,user.name)
        const emailCheck = await conn.query(`select useremail from users where useremail =(?) limit 1`,user.email)
        const getIndex = await conn.query(`select userid from users order by userid desc limit 1`)
        const dataExists = nameCheck[0][0] ? "юзернэймом" : emailCheck[0][0] ? "email адресом" : null
        user.id = (1+Number(getIndex[0][0]['userid']))||"0"

        // console.log(Object.values(user))

        if(dataExists){
            res.status(401).json({"message":`Пользователь с таким ${dataExists} уже существует`,"success":"true"})
            return("'User already exists' alert sent")

        }

        const addUser = await conn.query(`INSERT INTO USERS (username,useremail,userpass,userid) VALUES (?,?,?,?)`, Object.values(user))
        res.status(201).json({"message": `Добро пожаловать, ${user.name} !`, "success": "authorised"})
        return JSON.stringify(user) + " added to DB"
}

async function loginForm(req,res){

    const user = req.body

    const userPass = await conn.query("select userpass from users where username = (?)" , user.name)
    if (userPass) {

        if (encrypt(userPass,user.pass)) {
            res.status(201).json({"message": `Добро пожаловать, ${user.name} !`, "success": "authorised"})
            return ("User authorised")
        }
        res.status(401).json({"message": `Wrong password!`, "success": "false"})
    }
    res.status(404).json({"message": `No such user found!`, "success": "false"})
    return ("User unauthorised")

}

module.exports = router