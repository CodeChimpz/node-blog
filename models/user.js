const mongoose = require('mongoose')
// const getDb = require('../connect_mongodb').getDb

const Schema = mongoose.Schema
const userSchema = new Schema({
    tag:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    profile:{
        pf_img:{
            type:String,
        },
        status:String,
    },
    settings:{
        foo1:{
            type:String,
        },
        foo2:{
            type:String,
        },
        foo3:{
            type:String,
        }
    }
},{
    timestamps:true
})

userSchema.virtual('posts',{
    ref:'Post',
    localField:'_id',
    foreignField:'creator'
})


module.exports =  mongoose.model('User',userSchema)

