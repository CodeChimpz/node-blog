const bcrypt = require('bcrypt')

const files = require('../util').files

const User = require('../models').User
const Post = require('../models').Post


class UserService {
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
            return { error: emailCheck || tagCheck }
        }
        //save user and return
        const hashed = await bcrypt.hash(password,12)
        const newUser = new User({
            name, tag, email, password:hashed
        })
        await newUser.save()
        return { user:newUser }
    }
    //
    async login(userObj){
        const { name, tag, email, password } = userObj
        const user = await User.findOne({'email':email})
        if(!user){
            return { error : 'User not found' }
        }
        const checkPass = await bcrypt.compare(password, user.password)
        if(!checkPass){
            return { error : 'Incorrect password' }
        }
        return { user }
    }
    //
    async terminate(userObj){
        const user = await User.findById(userObj.id)
        if(!await bcrypt.compare(userObj.password,user.password)){
            return { error: "Invalid password" }
        }
        await User.findByIdAndRemove(userObj.id)
    }
    // user profile actions
    //
    //get detailed user info ( as is in DB)
    //parameter:value - to search in db
    //options - include additional info about user
    async getUser(idObj,options){
        const parameter = Object.keys(idObj)[0]
        const value = idObj[parameter]
        let user;
        if (parameter === "id"){
            user = await User.findById(value).populate(options.including)
        } else {
            user = await User.findOne({parameter:value}).populate(options.including)
        }
        if (!user){
            return { error : "User not found" }
        }
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
        user.save()
    }
    //subscription stuff
}

module.exports = UserService