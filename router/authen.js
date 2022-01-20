const path= require('path')

const express = require('express')
const Sequelize = require('sequelize')
//sql db
const conn = require('../mysql_db.js')
const { User,UserPf } = require('../model/user_model.js')
//encryption
const argon2 = require('argon2')
const router = express.Router()

router.use("/draw-user-auth",(req,res,next)=>{
    if(
        req.session.isAuth
    ){
         res.status(201).append("Content-Type","text/html").append("Draw","Auth").send(
            ` <a id ="user" href="/user/user_page">User page</a>
        <a class="logout" href="/logout" >Logout</a>`
        )
        next()
    }
    res.append("Content-Type","text/html").append("Draw","Unauth").send(
        `<a id="login"  href="/login.html">Log in</a>
         <a id="register" href="/register.html">Register</a>`)
    next()
})

//handle userpage
router.route("/user_page")
    .get((req,res)=> {
        if (req.session.isAuth ){
            return res.status(200).sendFile("/authen/user.html",{
                root:"./static"
            })
        }
        res.status(403).send("Access denied! Authorize first!")
    })

//get user data
router.route("/data")
    .get(async function (req,res){
    try{
        const pfdata = await UserPf.findOne({where:{'id':req.session.Id}},{raw:true})
        res.status(200).json(pfdata.dataValues)
    }catch(err){
        res.sendStatus(500)
    }

})
    .post(function(req,res) {
        if(req.get("File-Type")==="image") {
            const im_name = req.files.file.name
            const im_path = path.join('./static/public_img', im_name)
            req.files.file.mv(im_path,
                (err, result) => {
                    if (err) {

                        res.status(500).json({"message": "Server fileupload ERR"})
                        console.log(err)
                    } else {
                        UserPf.update({'userPfp': im_name}, {where: {'id': req.session.Id}})
                            .then(
                                () => {
                                    console.log("File uploaded")
                                    res.status(200).json({"message": "File successfully uploaded", "src": im_name})
                                }
                            )
                            .catch(err => console.log(err))
                    }

                }
            )
        }
    })
    .delete(function (req,res){


    })

module.exports =
    router
