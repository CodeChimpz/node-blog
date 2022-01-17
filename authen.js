const path= require('path')

const express = require('express')
const Sequelize = require('sequelize')
//sql db
const conn = require('./mysql_db.js')
const User = require('./model/user_model.js')
//encryption
const argon2 = require('argon2')
const auth_router = express.Router()

//register
auth_router.post("/handle-user/registration",(req,res)=> {
        registerForm(req,res)
            .then(result=>console.log(result))
            .catch(err=>{
                console.log(err)
            })
    })
//login and set authentication id
auth_router.post("/handle-user/login",(req,res)=>{
        loginForm(req,res)
        .then(result=>{
            console.log(result)
        })
        .catch(err=>{
            console.log(err)
        })
})
//logout
auth_router.get("/logout",(req,res)=>{
    req.session.isAuth=false
    res.redirect("/")
})
//handle user
auth_router.route("/user")
    .get((req,res)=> {
        console.log(req.session)
        if (req.session.isAuth){
            return res.status(200).sendFile(path.join(__dirname,"/static/authen/user.html"))
        }
        res.status(403).send("Access denied! Authorize first!")

    })

//handle Form functions
async function registerForm(req,res){
    try{
        const user = req.body

        const nameCheck = await User.findOne({
            where:{'username':user.name},
            attributes:['username']},
            {raw:true})
        const emailCheck  = await User.findOne({
            where:{'useremail':user.email},
            attributes:['useremail']},
            {raw:true})

        const dataExists = nameCheck? "юзернэймом" : emailCheck ? "email адресом" : null

        if(dataExists){
            res.status(401).json({"message":`Пользователь с таким ${dataExists} уже существует`,"success":"true"})
            return("'User already exists' alert sent")
        }
        const getIndex = await User.max('userid')
        const passEncrypted = await argon2.hash(user.pass)
        const addUser = await User.create(
            {
                userid:(1+Number(getIndex))||"0",
                username:user.name,
                useremail:user.email,
                userpass:passEncrypted,
                createdAt:Date(),
                updateAt:Date(),
            }
        )
        res.status(201).json({"message": `Добро пожаловать, ${user.name} !`, "success": "authorised"})
        return JSON.stringify(user) + " added to DB"}
        catch(err){
            res.status(500).json({"message":`Error`,"success":"false"})
            throw err
        }
}

async function loginForm(req,res){
    try{
        const user = req.body

        const getPass = await User.findOne({where:{'username':user.name},attributes:['userpass']},{raw:true})
        const userPass = getPass? getPass.userpass : 0
        if (userPass) {
            if (argon2.verify(userPass,user.pass)) {
                req.session.isAuth=true
                res.status(201).json({"message": `Добро пожаловать, ${user.name} !`, "success": "authorised"})
                return ("User authorised")
            }
            return res.status(401).json({"message": `Wrong password!`, "success": "false"})
        }
            res.status(404).json({"message": `No such user found!`, "success": "false"})
            return ("User unauthorised")}
        catch(err){
            res.status(500).json({"message":`Error`,"success":"false"})
            throw err

    }

}

module.exports =
    auth_router
