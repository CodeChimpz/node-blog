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
    },
    subscrMe:[
        {
            tag:{type:String},
            access:{
                type:Number,
                default:1
            }
        }
    ],
    subscrI:[
        {
            tag:{
                type:String
            },
            type:{
                type:String,
                default:'default'
            },
            notify:{
                type:Boolean,
                default:0
            }
        }
    ]

},{
    timestamps:true
})

userSchema.virtual('posts',{
    ref:'Post',
    localField:'tag',
    foreignField:'creator'
})


module.exports =  mongoose.model('User',userSchema)

