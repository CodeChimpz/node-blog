const files = require('../util').files

const { UserDto, UserProfileDto } = require('../dto').UserDto
const UserService = require('../services').userService

exports.getUserPage = async (req,res,next)=>{
    try{
        //get info from request
        const userToGet = req.params.user
        //
        let urPage = false
        const user = await UserService.getUser({tag:userToGet},
            {including:'posts'})
        if(user.error){
            return res.status(404).json({message:user.error})
        }
        if (req.userId == user._id){
            urPage = true
        }
        //response formulation
        const responseObj = new UserProfileDto(user)
        res.status(200).json({
            message:"User profile loaded successfully",
            urPage,
            result:responseObj
        })
    }catch(err){
        next(err)
    }
}

exports.getUserProfile = async (req,res,next)=>{
    try{
        //get info from request
        const userData = { id: req.userId }
        //
        const user = await UserService.getUser(userData)
        //
        const responseObj = new UserProfileDto(user)
        res.status(200).json({
            message:"User profile loaded successfully",
            result:responseObj
        })
    }catch(err){
        next(err)
    }
}

exports.getUserSettings = async (req,res,next) => {
    try{
        //get info from request
        const userData = { id: req.userId}
        //
        const user = await UserService.getUser(userData)
        if(user.error){
            return res.status(404).json({message:user.error})
        }
        //
        const responseObj = new UserProfileDto(user)
        res.status(200).json({message:'Settings access',result:responseObj})
    }catch(err){
        next(err)
    }
}

exports.editUserProfile = async (req,res,next)=>{
    try{
        //get info from request
        const profileFromReq = new UserProfileDto(req.body)
        const data = {
            id: req.userId,
            data:{
                ...profileFromReq,
                pf_img:req.files
            },
        }
        //
        const updated = await UserService.editProfile(data)
        //response formulation
        const responseObj = new UserProfileDto(updated)
        res.status(200).json({message:'',responseObj})
    }catch(err){
        next(err)
    }
}

exports.editUserSettings = async (req,res,next) => {
    try{
        //get info from request
        const data = {
            id:req.userId,
            settings:req.body.settings
        }
        //
        await UserService.editSettings(data)
        //
        res.status(200).json({message:'Settings updated'})
    }catch(err){
        next(err)
    }
}

//subscribe to a user
exports.postSubscription = async (req,res,next)=>{
    try{
        //get info from request
        const userToName = req.params.user
        const userById = req.userId
        const subscrType = req.body.subscrType
        const notify = req.body.notification
        //check user existance and authentiaction
        const userTo =  await User.findOne({tag:userToName})
        const userBy = await User.findById(userById)
        if(!userBy || !userTo){
            const reason = `${!userBy ? 'Not authenticated!' : `Invalid subject to subscribe to - ${userToName}!`}`
            return res.status(404).json({message:reason})
        }
        if (userTo.subscrMe.find(sub=>{
            if(userBy.tag === sub.tag) return true
        })){
            res.status(300).json({message:'Already subscribed to that user'})
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
            message:'Subscribed to '+ userToName,
            result:userBy.subscrI
        })
    }
    catch(err){
        next(err)
    }
}

exports.editToUserSubscr = async (req,res,next)=>{

}

exports.delToUserSubscr = async (req,res,next) => {
    try{
        const userToName = req.params.user
        const userById = req.userId
        //check user existance and authentication
        const userTo =  await User.findOne({tag:userToName})
        const userBy = await User.findById(userById)
        if(!userBy || !userTo){
            const reason = `${!userBy ? 'Not authenticated!' : `Invalid subject to subscribe to - ${userToName}!`}`
            return res.status(404).json({message:reason})
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


exports.getMyUserSubscr = async (req,res,next) => {
        try{
            const userId = req.userId
        const userTag = req.params.user
        const user = await User.findOne({tag:userTag})
        if(!user){
            return res.status(404).json({message:'No such user!'})
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

exports.editMyUserSubscr = async (req,res,next) => {
        try{
            const userId = req.userId
            const userToTag = req.body.tag
            const updAccess = req.body.accSess
            //
            const user = await User.findOne({tag:userToTag})
            if(!user){
                return res.status(404).json({message:'No such user!'})
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

exports.getIUserSubscr = async (req,res,next) => {
    try{
        const userId = req.userId
        const userTag = req.params.user
        const user = await User.findOne({tag:userTag})
        if(!user){
            return res.status(404).json({message:'No such user!'})
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

