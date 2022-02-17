const path= require('path')
const fs = require('fs')
//sql db
const {Sequelize,Op} = require('sequelize')

const { User,UserPf,Gallery,Tags,users } = require('../mysql_db.js')

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
            const gotPictures = await users.query(
                `select group_concat( tags.tag order by tags.tag ) as the_tags, galleries.id,galleries.userPrimaryid,
                galleries.description,galleries.imgName,galleries.createdAt
             from verification.galleries
             inner join (tagphoto,tags) on tagphoto.tagId = tags.id and galleries.id = tagphoto.id
             where tag in (${tag_user.map(thing=>{return "\""+thing+"\""})})
             group by galleries.id
             having the_tags = '${(tag_user)}'
             order by galleries.id
             `,
                {model:Gallery,mapToModel:true}
            )
            res.status(200).json(gotPictures)
        }
        catch(err){
            console.log(err)
            res.status(404).json({"message": "Image not found"})
        }
    })


module.exports = router