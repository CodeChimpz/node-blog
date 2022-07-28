const express = require('express')
const uuid = require('uuid')

const userRouter = express.Router()

const  isAuth  = require('../middleware/auth')
const userContr = require('../controllers/users')

const multer = require('multer')

const fileStorage = multer.diskStorage({
    destination:'public/images/pf_images',
    filename:(req,file,callback)=>{
        callback(null,uuid.v4()+'.'+file.mimetype.split('/')[1])
    }
})
const fileFilter = function(req,file,callback){
    if(file.mimetype==='image/png'||
    file.mimetype==="image/jpg" ||
    file.mimetype==="image/jpeg")
    {
        return callback(null,true)
    }
    callback(null,false)}

const upload = multer({
    storage:fileStorage,
    filter:fileFilter,
    limit:1024*1024})

userRouter.route('/profile')
    .post(isAuth,upload.single('image'),
        userContr.editUserProfile)

userRouter.route('/settings')
    .get(isAuth,userContr.getUserSettings)
    .post(isAuth,userContr.editUserSettings)

//Subscription Handling
userRouter.route('/follow/:user')
    .post(isAuth,userContr.postToUserSubscr)
    .delete(isAuth,userContr.delToUserSubscr)

userRouter.route('/followers/:user')
    .get(isAuth,userContr.getMyUserSubscr)
    .put(isAuth,userContr.editMyUserSubscr)

userRouter.route('/follows/:user')
    .get(isAuth,userContr.getIUserSubscr)


//User profile handling
userRouter.route('/:user')
    .get(isAuth,userContr.getUser)



module.exports = userRouter