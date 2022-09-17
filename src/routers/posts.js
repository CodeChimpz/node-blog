const express = require('express')
const { query,body }= require("express-validator")
const postsRouter = express.Router()

const postContr = require('../controllers').postsController
const isAuth  = require('../middleware/auth')
const customValid = require('../middleware/custom-validation')
const multer = require('../util').multer

const upload = multer(
    './public/images',
    ['image/png','image/jpg','image/jpeg'],
    {limit:1024*1024}
)

postsRouter.use(upload.array('image',10))

//accessed through /posts/:post...
postsRouter.post('/post',
    [
        body('tags').customSanitizer(customValid.tagStringSanitizer)
    ],
    isAuth,postContr.createUserPost)

postsRouter.route('/tags').get(
    [
        query('tags').customSanitizer(customValid.tagStringSanitizer)
    ],
    postContr.getPostsByTags
)

postsRouter.route('/:post')
    .get(postContr.getUserPost)
    .put(isAuth,
        [
            body('tags').customSanitizer(customValid.tagStringSanitizer)
        ],
        postContr.editUserPost)
    .delete(isAuth,postContr.deleteUserPost)


module.exports =
    postsRouter

