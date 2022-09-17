const express = require('express')
const { query,body }= require("express-validator")
const multer = require('multer')
const uuid = require('uuid')

const postsRouter = express.Router()

const postContr = require('../controllers').postsController
const isAuth  = require('../middleware/auth')
const customValid = require('../middleware/custom-validation')


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
    limit:1024*1024}
    )
    .array('image',10))

//accessed through /posts/:post...
postsRouter.post('/post',
    [
        body('tagsString').customSanitizer(customValid.tagStringSanitizer)
    ],
    isAuth,postContr.createUserPost)

postsRouter.route('/tags').get(
    [
        //sanitize string of tags to have 'foo#foo#foo' format (for further splice)
        query('tags').customSanitizer(customValid.tagStringSanitizer)
    ],
    postContr.getPostsByTags
)

postsRouter.route('/:post')
    .get(postContr.getUserPost)
    .put(isAuth,
        [
            body('tagsString').customSanitizer(customValid.tagStringSanitizer)
        ],
        postContr.editUserPost)
    .delete(isAuth,postContr.deleteUserPost)


module.exports =
    postsRouter

