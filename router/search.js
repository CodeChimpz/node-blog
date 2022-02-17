const path= require('path')
const fs = require('fs')
//sql db
const {Sequelize,Op} = require('sequelize')

const { User,UserPf,Gallery,Tags } = require('../mysql_db.js')

const express = require('express')
const router = express.Router()

//Все пользователи
router.route("/users")

//Поиск пользователя
router.route("/user/:userName").get(
    async function handle_(req,res){
        try{
            const user = await User.findOne({where:{'username':req.params.userName},
                include:[{model:UserPf},{model:Gallery,include:Tags},]})

            const photos_ = Object.values(user.galleries).map(photo=>{
                return{
                    imgName:photo.imgName,
                    description:photo.description,
                    createdAt:photo.createdAt,
                    tags: photo.tags.map(tag=>{
                        return tag.tag
                    })
                }
            })

            res.render("userpage",{
                layout:'upage_search',
                name:user.username,
                email:user.useremail,
                pfp:user.userpf.userPfp,
                photos:photos_
            })
        }catch(err) {
        }
    }
)

//Поиск фото по тегам
router.route("/images/tags")
    .get(async function(req,res){
        try{
            const tag_user = req.query.tags.split(',')
            //get where tags from query are in photo tags
            const gotPictures = await Gallery.findAll({
                where:{

                },
                include: Tags
            })
            res.status(200).json(gotPictures)
        }
        catch(err){
            console.log(err)
            res.status(404).json({"message": "Image not found"})
        }
    })


module.exports = router