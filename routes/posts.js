const express = require('express')
const { query }= require("express-validator")

const postsRouter = express.Router()

const  postContr = require('../controllers/posts')

const isAuth  = require('../middleware/auth')

const multer = require('multer')
const uuid = require('uuid')

const fileStorage = multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,'public/images')
    },
    filename:(req,file,callback)=>{
        callback(null,uuid.v4()+'.'+file.mimetype.split('/')[1])
    }
})
const fileFilter = (req,file,callback)=>{
    if(file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ){
        return callback(null,true)
    }
    callback(null,false)
}

postsRouter.use(multer({
    storage:fileStorage,
    filter:fileFilter,
    limit:1024*1024})
    .array('image',10))

//accessed through /posts/:post...
postsRouter.post('/post',isAuth,postContr.createUserPost)


postsRouter.route('/feed')
    .get(
        postContr.getFeed
    )

postsRouter.route('/explore')
    .get(postContr.getExp)

postsRouter.route('/tags').get(
    [
        query('tags').customSanitizer(tagString => {
            if(tagString[0] == '#') tagString = tagString.substring(1,)
            const lst = tagString.length - 1
            if(tagString[lst] == '#') tagString = tagString.substring(0,lst)
            return tagString
        })
    ],
    postContr.getPostsByTags
)

postsRouter.route('/:post')
    .get(postContr.getUserPost)
    .put(isAuth,postContr.editUserPost)
    .delete(isAuth,postContr.deleteUserPost)


module.exports =
    postsRouter

