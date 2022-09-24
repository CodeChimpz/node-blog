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
            {
                including:'posts',
                by:req.userId
                })
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
        const user = await UserService.getUser({'tag':find},{including:'subscribers'},['subscriptions','settings'])
        if(user.error){
            return res.status(404).json({message:user.error})
        }
        if (user._id == req.userId){
            urPage = true
        }
        if(user.subscriptions && !urPage){
            if(!user.settings.publicSettings.access.all.seeSubscriptions || user.settings.publicSettings.access.specific.find(u=>{
                return u.id.toString() === by._id.toString() && !u.details.seeSubscriptions
            }) ){
                return res.status(404).json({message:'Can\'t access that'})
            }
        }
        if(urPage){
            return res.status(200).json({result:user,urPage})
        }
        res.status(200).json({result:new UserPeopleDto(user)})
    }catch(err){
        next(err)
    }

}
//subscribe to user
exports.postSubscription = async (req,res,next)=>{
    try{
        //get info from request
        const to = req.body.sub.to
        const by = req.userId
        const notify = req.body.sub.notify
        //check user existance and authentiaction
        const check = await UserService.getTwo({subj:to,user:by})
        if (check.error){
            return res.status(check.status).json({message:check.error})
        }
        const subscription = {
            to:check.subj,
            by:check.user,
            notify
        }
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
    try{
        //get info from request
        const tag = req.params.user
        const to = req.body.sub.to
        const by = req.userId
        const notify = req.body.sub.notify
        //check user existance and authentiaction
        const check = await UserService.getTwo({subj:to,user:by})
        if (check.error){
            return res.status(check.status).json({message:check.error})
        }
        const subscription = {
            to:check.subj,
            by:check.user,
            notify
        }
        const updated = await UserService.editSub(subscription)
        if(updated.error){
            return res.redirect(`/${tag}`)
        }
        res.status(200).json({
            message:'Subscribtion settings udated'
        })
    }catch(err){
        next(err)
    }


}
exports.deleteSubscription = async (req,res,next) =>{
    try{
        const to = req.body.sub.to
        const by = req.userId
        const check = await UserService.getTwo({subj:to,user:by})
        if (check.error){
            return res.status(check.status).json({message:check.error})
        }
        const subscription = {
            to:check.subj,
            by:check.user
        }
        const deleted = await UserService.unsubscribe(subscription)
        if(deleted.error){
            return res.status(404).json({message:deleted.error})
        }
        res.status(200).json({
            message:'Unsubscribed successfully'

        })
    }catch(err){
        next(err)
    }

}
//view subscribers
exports.getSubscribers = async(req,res,next)=>{
        const user = req.body.user.id
        const subs = await UserService.getUser({id:user},{including:'subscribers'},['tag','name','settings'])
        if(subs.subscribers && subs._id.toString() !== req.userId.toString()){
            if(!subs.settings.publicSettings.access.all.seeSubscribers || subs.settings.publicSettings.access.specific.find(u=>{
                return u.id.toString() === by._id.toString() && !u.details.seeSubscribers
            }) ){
                return res.status(404).json({message:'Can\'t access that'})
            }
        }
        if(subs.error){
            return res.status(404).json({message:subs.error})
        }
        res.status(200).json({
            message:'Subscribers loaded',
            result:new UserPeopleDto(subs)
        })
}


