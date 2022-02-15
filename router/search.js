const path= require('path')
const fs = require('fs')
//sql db
const {Sequelize,Op} = require('sequelize')

const { User,UserPf } = require('../model/user_model.js')
const Gallery = require('../model/gallery_model')

const express = require('express')
const router = express.Router()

//Поиск пользователя
router.route("/user/:userName").get(
    async function handle_(req,res){
        try{
            const user = await User.findOne({where:{'username':req.params.userName},
                include:[{model:UserPf},{model:Gallery}]},{raw:true})

            //reworking object
            const galleries_ = Object.values(user.galleries).map(photo=>{
                return{
                    imgName:photo.imgName,
                    description:photo.description,
                    createdAt:photo.createdAt,
                    tags: photo.tags.split(',')
                }
            })

            res.render("userpage",{
                layout:'upage_search',
                name:user.username,
                email:user.useremail,
                pfp:user.userpf.userPfp,
                photos:galleries_
            })
        }catch(err) {
        }
    }
)

//Поиск фото по тегам
router.route("/images/tags")
    .get(async function(req,res){
        try{
            const tag = req.query.tags
            const gotPictures = await Gallery.findAll({where:{
                    'tags':{
                        [Op.like]:`%${tag}%`
                    }
                }})
            res.status(200).json(gotPictures)
        }
        catch(err){
            console.log(err)
            res.status(404).json({"message": "Image not found"})
        }
    })

//router.route

module.exports = router