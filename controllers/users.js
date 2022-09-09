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

async function postToUserSubscr(req,res,next){
    try{
        const userToName = req.params.user
        const userById = req.userId
        //parse body
        const subscrType = req.body.subscrType
        const notify = req.body.notification
        //check user existance and authentiaction
        const userTo =  await User.findOne({tag:userToName})
        const userBy = await User.findById(userById)
        if(!userBy || !userTo){
            const err = new Error(`${!userBy ? 'Not authenticated!' : `Invalid subject to subscribe to - ${userToName}!`}`)
            err.statusCode = 404
            throw err
        }
        if (userTo.subscrMe.find(sub=>{
            if(userBy.tag === sub.tag) return true
        })){
            const err = new Error('Already subscribed to that user')
            err.statusCode = 300
            throw err
        }
        userTo.subscrMe.push({
            tag:userBy.tag
        })
        userBy.subscrI.push({
            tag:userTo.tag,
            type:subscrType,
            notify,
        })
        await userTo.save()
        await userBy.save()
        res.status(200).json({
            message:'Subscribed to '+userToName,
            result:userBy.subscrI
        })
    }
    catch(err){
        next(err)
    }
}

async function editToUserSubscr(eq,res,next){

}

async function delToUserSubscr(req,res,next){
    try{
        const userToName = req.params.user
        const userById = req.userId
        //check user existance and authentication
        const userTo =  await User.findOne({tag:userToName})
        const userBy = await User.findById(userById)
        if(!userBy || !userTo){
            const err = new err(`${!userBy ? 'Not authenticated!' : `Invalid subject to unsunscribe from - ${userToName}!`}`)
            err.statusCode = 404
            throw err
        }

        await User.findOneAndUpdate({tag:userToName},{$pull:{subscrMe:{tag:userBy.tag}}})
        const result = await User.findByIdAndUpdate(userById,{$pull:{subscrI:{tag:userToName}}})

        res.status(200).json({
            message:'Successfully unsubbed from '+userToName+' !',
            result:result.subscrI
        })
    }
    catch(err){
        next(err)
    }
}


async function getMyUserSubscr(req,res,next){
        try{
            const userId = req.userId
        const userTag = req.params.user
        const user = await User.findOne({tag:userTag})
        if(!user){
            const err = new Error('No such user!')
            err.statusCode = 404
            throw err
        }
        let result
        if(userId != user._id){
            result = user.subscrMe.map(sub=>{
                return {"tag":sub.tag}
            })
        }
        else{result = user.subscrMe}
        res.status(200).json({
            message:'subscribers list',
            result
        })
        }
        catch(err){

        }
}

async function editMyUserSubscr(req,res,next){
        try{
            const userId = req.userId
            const userToTag = req.body.tag
            const updAccess = req.body.accSess
            //
            const user = await User.findOne({tag:userToTag})
            if(!user){
                const err = new Error('No such user!')
                err.statusCode = 404
                throw err
            }
            //
            const result = await User.findByIdAndUpdate(userId,{$set:{subscrMe:{
                access:updAccess
                    }}})
            res.status(200).json({
                message:'subscriber updated',
                result:result.subscrMe
            })
        }
        catch(err){

        }
}

async function getIUserSubscr(req,res,next){
    try{
        const userId = req.userId
        const userTag = req.params.user
        const user = await User.findOne({tag:userTag})
        if(!user){
            const err = new Error('No such user!')
            err.statusCode = 404
            throw err
        }
        let result
        if(userId != user._id){
            result = user.subscrI.map(sub=>{
                return {"tag":sub.tag}
            })
        }
        else{result = user.subscrI}

        res.status(200).json({
            message:'subscribers list',
            result
        })
    }
    catch(err){

    }
}

module.exports = {
        getUser,
        editUserProfile,
        getUserSettings,
        editUserSettings,
        postToUserSubscr,
        delToUserSubscr,
        editToUserSubscr,
        getMyUserSubscr,
        editMyUserSubscr,
    getIUserSubscr
    }