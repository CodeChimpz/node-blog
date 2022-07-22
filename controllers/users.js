const User = require('../models/user')
const fs = require('fs')
const path = require('path')

function getUser(req,res,next) {
    const userToGet = req.params.user
    let urPage = false
    User.findOne({tag:userToGet}).populate('posts').then(
        user=>{
            if(!user){
                const err = new Error('No such user')
                err.statusCode = 404
                throw err
            }
            const userToPresent = {}
            if (req.userId == user._id){
                urPage = true
            }
            userToPresent.tag = user.tag
            userToPresent.name = user.name
            userToPresent.profile = user.profile
            userToPresent.posts = user.posts
            return userToPresent
        }
    )
        .then(result=>{
            res.status(200).json({message:"user profile loaded successfully",urPage,result})
        })
        .catch(err=>{
            next(err)
        })
}
function editUserProfile (req,res,next){
    const userId = req.userId
    const newStatus = req.body.status
    const pfImgPath = req.file.path
    User.findById(userId)
        .then(
        user=>{
            if(user.profile.pf_img!==pfImgPath && user.profile.pf_img){
                fs.unlink( path.join(__dirname,'..',user.profile.pf_img),err=>{
                    if(err){
                        const error = new Error
                        error.message = err
                        throw error
                    }
                })
            }
            user.profile.pf_img = pfImgPath
            user.profile.status = newStatus
            return user.save()
        }
    )
        .then(result=>{
            res.status(200).json({message:'',result})
        })
        .catch(
            err=>{
                next(err)
            }
        )
}

function getUserSettings(req,res,next) {
    const userId = req.userId
    User.findById(userId)
        .then(
            user=>{
                if(!user){
                    const err = new Error('No such user')
                    err.statusCode = 404
                    throw err
                }
                res.status(200).json({message:'',result:user.settings})
            }
    )
        .catch(
            err=>{
                next(err)
            }
        )
}
function editUserSettings(req,res,next){
    const userId = req.userId
    const newSettings = req.body.settings
    User.findById(userId)
        .then(
            user=>{
                user.settings = newSettings
                return user.save()
            }
        )
        .then(
            result=>{
                res.status(200).json({message:'Settings updated'})
            }
        )
        .catch(err=>{
            next(err)
        })
}

module.exports = {
        getUser,
        editUserProfile,
        getUserSettings,
        editUserSettings
    }