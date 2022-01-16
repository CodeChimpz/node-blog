const express = require('express')
const conn = require('../mysql_db.js')
const router = express.Router()


//decoy ecrypter
function encrypt(pass){
    return pass
}

router.post("/handle-user/registration",(req,res)=> {
     registerForm(req,res)
}

)
router.post("/handle-user/login",(req,res)=>{
    loginForm(req,res)
        .then(()=>console.log("Login form handled successfully"))
        .catch(err=>console.log(err))
})

function registerForm(req,res){
    const user = req.body
    const handleQuery = async function (){
        try{
            const nameCheck = await conn.query(`select username from users where username = (?) limit 1`,user.name)
            const emailCheck = await conn.query(`select useremail from users where useremail =(?) limit 1`,user.email)
            const getIndex = await conn.query(`select userid from users order by userid desc limit 1`)
            const dataExists = nameCheck[0][0] ? "юзернэймом" : emailCheck[0][0] ? "email адресом" : null
            user.id = (1+Number(getIndex[0][0]['userid']))||"0"
            console.log(Object.values(user))
            if(dataExists){
                console.log("'User already exists' alert sent")
                return res.status(401).json({"message":`Пользователь с таким ${dataExists} уже существует`,"success":"true"})

            }
            const addUser = await conn.query(`INSERT INTO USERS (username,useremail,userpass,userid) VALUES (?,?,?,?)`, Object.values(user))
            console.log(JSON.stringify(user) + " added to DB")
            res.status(201).json({"message": `Добро пожаловать, ${user.name} !`, "success": "authorised"})
            console.log("Sent to server")

        }catch(err){
            res.status(500).json({"message":`Error`,"success":"false"})
            console.log(err)
        }
    }
    handleQuery()
        .catch((err)=>{
        res.status(500).json({"message":`Error`,"success":"false"})
        console.log(err)
    })

}

async function loginForm(req,res){

}

module.exports = router