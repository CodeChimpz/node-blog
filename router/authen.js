const path= require('path')
const fs= require('fs')

const express = require('express')
const {Sequelize,Op} = require('sequelize')
//sql db
const conn = require('../mysql_db.js')
const { User,UserPf } = require('../model/user_model.js')
const Gallery = require('../model/gallery_model')
//encryption
const argon2 = require('argon2')
const router = express.Router()
//subROUTERS

//"Login/Register" or "UserPage/Logout" render
router.get("/draw-user-auth",(req,res)=>{
    if(
        req.session.isAuth
    ){
        return res.status(201).append("Content-Type","text/html").append("Draw","Auth").send(
            ` <a id ="user" href="/user/">User page</a>
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

//handle userpage
router.route("/")
    .get((req,res)=> {
        if(req.session.Role==="user"){
            async function handle_(req,res){
                try{
                    const user = await User.findOne({where:{'userid':req.session.Id},
                        include:[{model:UserPf},{model:Gallery}]})

                    const galleries_ = Object.values(user.galleries).map(photo=>{
                        return{
                            imgName:photo.imgName,
                            description:photo.description,
                            createdAt:photo.createdAt,
                            tags: photo.tags.split(',')
                        }
                    })

                    res.render("userpage",{
                        layout:'upage_auth',
                        name:user.username,
                        email:user.useremail,
                        pfp:user.userpf.userPfp,
                        photos:galleries_
                    })
                }catch(err) {
                }
            }
            handle_(req,res)
        }
        else if(req.session.Role === "ADMIN"){
            return res.status(200).sendFile("//тут будет админская страница")
        }
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
router.route("/image/:imgId")
    .get(async function(req,res){
        try{
            if(req.params.imgId){
            const getImage = await Gallery.findOne({
                where:{
                        'userPrimaryid':req.session.Id,
                        'id': Number(req.params.imgId)
                },
            })
            res.status(200).json(
                {
                    id,
                    description,
                    tags,
                    imgName
                } = getImage
            )}
        }catch (err) {
            console.log(err)
            res.status(404).json({"message": "Image not found"})
        }

    })
    //pass formdata object
    .post(async function(req,res) {
        try {
                const index= await Gallery.max('id',{where:{
                    'userPrimaryid':req.session.Id
                    }})
                const im_name = req.session.userName + "_maxres_" + Number(index ? index+1 : 1) + ".jpg"

                const im_path = path.join('./static/public_img', im_name)
                await req.files.photo.mv(
                    im_path)

                const addImageToGallery = await Gallery.create({
                    userPrimaryid: req.session.Id,
                    imgName: im_name,
                    description: req.body.descr,
                    tags: req.body.tags,
                    createdAt: Date(),
                    updateAt: Date()
                })
                res.status(200).json({"message": "File uploaded"})

        } catch (err) {
            console.log(err)
            res.status(500).json({"message": "Server fileupload ERR"})
        }
    })
    .put(async function(req,res){
        try {
            const toUpdate = {}
            toUpdate[`${req.body.attr}`] = req.body.newval
            const updatePhoto = await Gallery.update(toUpdate,{where:{
                    'userPrimaryid':req.session.Id,
                    'id':req.params.imgId
                }})
            res.status(200).json({"message": "Updated"})
        } catch (err) {
            console.log(err)
            res.status(500).json({"message": "Server fileupload ERR"})
        }
    })
    .delete(async function(req,res){
        try{
            const im_name = await Gallery.findOne({
                where:{
                    'userPrimaryid':req.session.Id,
                    'id':Number(req.params.imgId)
                },
                attributes:['imgName']
            })
            await fs.promises.unlink(path.join('./static/public_img/',im_name.imgName)
            )
            await Gallery.destroy({
                where:{
                    'userPrimaryid':req.session.Id,
                    'id':Number(req.params.imgId)
                },
            })
            res.status(200).json({"message": "File destroyed"})
        }catch (err) {
            if(err.message === "Unlink err"){
                return res.status(500).json({"message": "Filesystem error on server"})
            }
            res.status(404).json({"message": "Image not found"})
        }

    })

//Поиск всех фото пользователя
// router.route("/gallery").get(
//     async function(req,res){
//         try {
//             const getUserGallery = await Gallery.findAll(
//                 {
//                     where: {
//                         'userPrimaryid': req.session.Id
//                     }
//                 }
//             )
//             res.status(200).json(getUserGallery)
//         }catch(err){
//             res.status(404).json({"message": "Image not found"})
//         }
//     }
// )


module.exports =
    router
