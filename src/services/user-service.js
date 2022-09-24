const bcrypt = require('bcrypt')

const files = require('../util').files
const check = require('../util').checkAccess
const User = require('../models').User
const Post = require('../models').Post


class UserService {
    //general
    //
    //authentication
    //
    //register user
    async register( userObj ){
        //get info from request
        const { name, tag, email, password } = userObj
        //check if user can be registered
        const emailCheck = await User.findOne({'email':email})
        const tagCheck = await User.findOne({'tag':tag})
        if( emailCheck || tagCheck ){
            return { error: `User with such ${emailCheck?'email':tagCheck?'tag':'_'} already exists` }
        }
        //save user and return
        const hashed = await bcrypt.hash(password,12)
        const newUser = new User({
            tag, email, password:hashed, profile:{
                name
            }
        })
        await newUser.save()
        return newUser
    }
    //
    async login(userObj){
        const { email, password } = userObj
        const user = await User.findOne({'email':email})
        if(!user){
            return { error : 'User not found' }
        }
        const checkPass = await bcrypt.compare(password, user.password)
        if(!checkPass){
            return { error : 'Incorrect password' }
        }
        return user
    }
    //
    async terminate(userObj){
        const user = await User.findById(userObj.id)
        const compare = await bcrypt.compare(userObj.password,user.password)
        if(!compare){
            return { error: "Invalid password" }
        }
        await User.findByIdAndRemove(userObj.id)
        return {}
    }
    // user profile actions
    //
    //get detailed user info ( as is in DB)
    //parameter:value - to search in db
    //options - include additional info about user
    async getUser(idObj,options,select){
        const parameter = Object.keys(idObj)[0]
        const value = idObj[parameter]
        let query;
        if (parameter === "id"){
            query =  options ? User.findById(value).populate(options.including) : User.findById(value)
        } else {
            //todo bug: {parameter:value} doesn't work but passing the object does
            query =  options ? User.findOne(idObj).populate(options.including) : User.findOne(idObj)
        }
        if(select){
            query = query.select(select.join(' '))
        }
        const user = await query.exec()
        if (!user){
            return { error : "User not found" }
        }
        //for every post check if it is accessible to the user who asked
        if(user.posts){
            user.posts = user.posts.filter(pst=>{
                if(pst.hidden){
                    return check.post(pst,options.by,user.settings.publicSettings.access.specific)
                }
                else return true
            })
        }
        return user
    }
    //accepts Object with "sub" and "user" fields for the user who issues the request and the subject of the request
    async getTwo(dataObj){
        const {subj,user} = dataObj
        const s =  await User.findById(subj)
        const u = await User.findById(user)
        if(!s){
            return { status:404, error: 'Invalid user to subscribe to'}
        }
        if(!u){
            return { status:401, error:"You do not exist"}
        }
        return {subj:s,user:u}
    }
    // get all user posts
    async editProfile(dataObj){
        const{ id, data } = dataObj
        const user = await User.findById(id)
        if(user.profile.pf_img !== data.pf_img && user.profile.pf_img){
            if (files.removeImage(user.profile.pf_img)) throw new Error('Unlink error')
        }
        user.profile = data
        await user.save()
        return user
    }

    async editSettings(dataObj){
        const user = await User.findById(dataObj.id)
        user.settings = dataObj.data
        await user.save()

    }
    //subscription stuff
    //Sub to user, returns the user to whom you subbed
    async subscribe(dataObj){
        const {to,by,notify} = dataObj
        const checkSub = by.subscriptions.find(s=>
        {
            return s.id.toString() == to._id.toString()
        })
        if (checkSub) {
            return { status:300, error: 'Already following to this user'}
        }
        by.subscriptions.push({
            id:to._id,
            notify
        })
        await by.save()
        return to
    }
    async unsubscribe(dataObj){
        const {to,by} = dataObj
        const checkSub = by.subscriptions.find(s=>{return s.id.toString() == to._id.toString()})
        if (!checkSub){
            return { status:300, error: 'Not subscribed'}
        }
        by.subscriptions.splice(by.subscriptions.indexOf(checkSub))
        await by.save()
        return {}
    }
    async editSub(dataObj){
        const {to,by,notify} = dataObj
        if(!to.settings.publicSettings.access.all.seeSubscribers || to.settings.publicSettings.access.specific.find(u=>{
            return u.id.toString() === by._id.toString() && !u.details.seeSubscribers
        }) ){
            return { status:401, error: 'Not allowed to see this users subs'}
        }
        const checkSub = by.subscriptions.find(s=>{return s.id.toString() == to._id.toString()})
        if (!checkSub){
            return { status:300, error: 'Not subscribed'}
        }
        checkSub.notify = notify
        await by.save()
        return {}
    }
}

module.exports = UserService