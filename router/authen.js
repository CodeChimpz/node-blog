const path= require('path')

const express = require('express')
const Sequelize = require('sequelize')
//sql db
const conn = require('../mysql_db.js')
const { User,UserPf } = require('../model/user_model.js')
const Gallery = require('../model/gallery_model')
//encryption
const argon2 = require('argon2')
const router = express.Router()

//"Login/Register" or "UserPage/Logout" render
router.get("/draw-user-auth",(req,res)=>{
    if(
        req.session.isAuth
    ){
        return res.status(201).append("Content-Type","text/html").append("Draw","Auth").send(
            ` <a id ="user" href="/user/user_page">User page</a>
              <a class="logout" href="/user/logout" >Logout</a>`
        )
    }
    res.status(299).append("Content-Type","text/html").append("Draw","Unauth").send(
        `<a id="login"  href="/login.html">Log in</a>
         <a id="register" href="/register.html">Register</a>`)
})

//Authorization check on /user* route
router.use(function(req,res,next){
    if (!req.session.isAuth){
        return res.status(401).redirect("/")
    }
    next()
})


//logout
router.get("/logout",(req,res)=>{
    req.session.destroy((err)=>{
        console.log(err)
        res.redirect("/")
    })
})
//delete user
router.delete("/",async function(req,res){
    try{
        const deleteUser = await User.destroy({where:{'userid':req.session.Id}})
        req.session.destroy((err)=>{
            console.log(err)
        })
        res.status(204).redirect("/")
    }catch(err){
        console.log(err)
        res.sendStatus(500)
    }
})

//handle userpage
router.route("/user_page")
    .get((req,res)=> {
        console.log(req.session.Role)
            if(req.session.Role==="user"){
                return res.status(200).sendFile("/authen/user.html",{
                root:"./static"
            })
            }
            else if(req.session.Role === "ADMIN"){
                return res.status(200).sendFile("//тут будет админская страница")
            }
    })

//user profile data API
router.route("/data/:Data")
    .get(async function (req,res){
    try{
        const pfdata = await UserPf.findOne({where:{'userPrimaryid':req.session.Id},attributes:[req.params.Data]},{raw:true})
        res.status(200).json(pfdata.dataValues)

    }catch(err){
        res.sendStatus(404)
    }

})
    .post(async function(req,res) {
        try{
        switch(req.params.Data){
            case "userPfp"  :
                const im_name = req.session.userName + "_" + req.files.file.name
                const im_path = path.join('./static/public_img', im_name)
                req.files.file.mv(im_path,
                    (err, result) => {
                        if (err) {
                            return res.status(500).json({"message": "Server fileupload ERR"})
                            console.log(err)
                        } else {
                            UserPf.update({'userPfp': im_name}, {where: {'userPrimaryid': req.session.Id}}).then(()=> {
                                console.log("File uploaded")
                                res.status(200).json({"message": "File successfully uploaded", "src": im_name})
                            })
                        }
                    }
                )
                break
            default :
                const toUpdate= {}
                toUpdate[req.params.Data]=req.body.value
                const updateData = await UserPf.update(toUpdate,{where:{'userPrimaryid':req.session.Id}})
                res.status(200).json({"message":`updated`})
            }
        }catch (err) {
            console.log(err)
            res.sendStatus(500)
}
    })
    .delete(async function (req,res){
        try{
            const toUpdate= {}
            toUpdate[req.params.Data]=""
            const deleteData = await UserPf.update(toUpdate,{where:{'userPrimaryid':req.session.Id}})
            res.status(200).json({"message":`deleted`})
            }catch (err) {
                console.log(err)
                res.sendStatus(500) }

    })


//User gallery API (Загрузка фото в галерею пользователя)
router.route("/image")
    .get(async function(req,res){
        try{
            const getImage = await Gallery.findOne({
                where:{
                        'userPrimaryid':req.session.Id,
                        'idInner':Number(req.query.id)

                },
            })
            const path_to =path.join("/public_img/",getImage.imgName)
            res.status(200).sendFile(path_to,{
                root:"./static"
            })
        }catch (err) {
            console.log(err)
            res.status(404).json({"message": "Image not found"})
        }

    })
    .post(async function(req,res) {
        try {
            if (req.get("Image-Type") === "image/jpeg") {

                latestOfUser = await Gallery.max('idInner',{where:{'userPrimaryid':req.session.Id}})
                const index =(latestOfUser||0) + 1
                const im_name = req.session.userName + "_img_" + String(index) + ".jpg"
                const im_path = path.join('./static/public_img', im_name)
                await req.files.photo.mv(
                    im_path)
                const addImageToGallery = await Gallery.create({
                    userPrimaryid: req.session.Id,
                    idInner:index,
                    imgName: im_name,
                    description: req.body.descr,
                    tags: "",
                    createdAt: Date(),
                    updateAt: Date()
                })
                res.status(200).json({"message": "File uploaded"})
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({"message": "Server fileupload ERR"})
        }
    })
    .delete()

module.exports =
    router
