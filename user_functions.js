const path= require('path')

const express = require('express')
const Sequelize = require('sequelize')
//sql db
const conn = require('./mysql_db.js')
const { User,UserPf } = require('./model/user_model.js')
//encryption
const argon2 = require('argon2')

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
            return
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
        const getPrimaryId = addUser.primaryid
        const updateAssociations = await UserPf.create({
                userPrimaryid:getPrimaryId,
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

        const getUser = await User.findOne({where:{'username':user.name},attributes:['userpass','primaryid']},{raw:true})
        const userPass = getUser? getUser.userpass : 0
        if (userPass) {
            if (await argon2.verify(userPass,user.pass)) {
                req.session.isAuth=true
                //
                //todo = добавить авторизацию админа
                req.session.Id = getUser.primaryid
                req.session.userName = user.name
                req.session.Role = "user"
                //
                 res.status(201).json({"message": `Добро пожаловать, ${user.name} !`, "success": "authorised"})
                return

            }
            res.status(401).json({"message": `Wrong password!`, "success": "false"})
            return
        }
        res.status(404).json({"message": `No such user found!`, "success": "false"})
        return
    }
    catch(err){
        res.status(500).json({"message":`Error`,"success":"false"})
        throw err

    }

}

module.exports = {registerForm,
loginForm}