const files = require('../util').files

const { UserDto, UserProfileDto, UserPeopleDto } = require('../dto').UserDto
const services = require('../services')
const UserService = new services.userService()

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
        res.status(200).json({
            message:"User profile loaded successfully",
            result:new UserProfileDto(user),
            urPage,
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
        res.status(200).json({
            message:"User profile loaded successfully",
            result:new UserProfileDto(user)
        })
    }catch(err){
        next(err)
    }
}

exports.getUserSettings = async (req,res,next) => {
    try{
        //get info from request
        const userData = { id: req.userId }
        //
        const user = await UserService.getUser(userData)
        if(user.error){
            return res.status(404).json({message:user.error})
        }
        //
        res.status(200).json({
            message:"Settings access",
            result:new UserDto(user)
        })
    }catch(err){
        next(err)
    }
}

exports.editUserProfile = async (req,res,next)=>{
    try{
        //get info from request
        const data = {
            id: req.userId,
            data:{
                ... JSON.parse(req.body.profile) || JSON.parse(req.body.user.profile),
                //todo: really bad really bad fix
                pf_img:req.files
            },
        }
        //
        const updated = await UserService.editProfile(data)
        //response formulation
        res.status(200).json({
            message:"",
            result:new UserProfileDto(updated)
        })
    }catch(err){
        next(err)
    }
}

exports.editUserSettings = async (req,res,next) => {
    try{
        //get info from request
        const data = {
            id:req.userId,
            data: req.body.settings
        }
        //
        await UserService.editSettings(data)
        //
        res.status(200).json({message:'Settings updated'})
    }catch(err){
        next(err)
    }
}
//Subscription functionality
//view subscriptions
exports.getSubscriptions = async(req,res,next)=>{
    try{
        //get info from request
        const find = req.params.user
        let urPage = false
        //
        const user = await UserService.getUser({'tag':find},{including:'subscribers'},['subscriptions'])
        if(user.error){
            return res.status(404).json({message:user.error})
        }
        if (user._id == req.userId){
            urPage = true
            return res.status(200).json({result:user,urPage})
        }
        res.status(200).json({result:new UserPeopleDto()})
    }catch(err){
        next(err)
    }

}
//subscribe to user
exports.postSubscription = async (req,res,next)=>{
    try{
        //get info from request
        const subscription = {
            to:req.body.sub.to || req.params.user,
            by:req.userId,
            notify:req.body.sub.notify
        }
        //check user existance and authentiaction
        const subbed = await UserService.subscribe(subscription)
        if (subbed.error){
            return res.status(subbed.status).json({message:subbed.error})
        }
        res.status(200).json({
            message:'Subscribed to '+ subbed.tag,
            result:new UserProfileDto(subbed)
        })
    }
    catch(err){
        next(err)
    }
}
//edit subscription settings
exports.editSubscription = async (req,res,next)=>{
    //get info from request
    const subscription = {
        from:req.body.sub.to || req.params.user,
        by:req.userId,
        notify:req.body.sub.notify,
    }

}
exports.deleteSubscription = async (req,res,next) =>{

}
//view subscribers
exports.getSubscribers = async(req,res,next)=>{

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

