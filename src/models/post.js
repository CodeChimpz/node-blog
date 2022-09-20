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
        creator:{
            type:Schema.Types.ObjectId,
            ref:'User'
        },
},{
    timestamps:true
})

// postSchema.virtual('author',{
//     ref:'User',
//     localField:'creator',
//     foreignField:'tag'
// })

module.exports = mongoose.model('Post',postSchema)