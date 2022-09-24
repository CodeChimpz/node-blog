const mongoose = require('mongoose')

const Schema = mongoose.Schema

const postSchema = new Schema({
        gallery:[
            {
                path:{
                    type:String,
                    required:true
                },
                metadata:{
                    type:Object,
                    required:true
                }
            }
        ],
        content:{
            type:String
        },
        tags:[
            {type:String}
        ],
        hidden:
            {
                mentions:[
                    { id:{type:Schema.Types.ObjectId,ref:'User'},tag:{type:String}}
                ],
                forbidden:{
                    tags:[
                        { tag:{type:String} }
                    ],
                    users:[
                        { id:{type:Schema.Types.ObjectId,ref:'User'}}
                ]}
            },
        creator:{
            type:Schema.Types.ObjectId,
            ref:'User'
        },
},{
    timestamps:true
})


module.exports = mongoose.model('Post',postSchema)