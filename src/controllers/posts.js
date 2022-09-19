//endpoint controllers for /user/:post
const Post = require('../models').Post
const User = require('../models').User

const files = require('../util').files
const tagSearch = require('../util').tagSearch


exports.getUserPost = async (req,res,next) => {
    try{
        //get info from request
        const postId = req.params.post
        //
        const post = await Post.findById(postId).populate('creator',['tag','name','profile'])
        if(!post){
            return res.status(404).json({message:"No such post"})
        }
        return res.status(200).json({message:post})
    }catch(err){
        next(err)
    }
}

exports.createUserPost = async (req,res,next) => {
    try{
        //get info from request
        if(!req.files[0]){
            return res.status(422).json({message:"No image file provided !"})
        }
        const {content,tags} = req.body
        const gallery = req.files.map(img=>{
            return {img_url:img.path,
                metadata:{
                    encoding:img.encoding,
                    mimetype:img.mimetype,
                    size:img.size
                }}
        })
        //
        const creator = await User.findById(req.userId).select('tag')
        if(!creator){
            return res.status(403).json({message:"Not authorized to perform this action"})
        }
        //
        const newPost = new Post({
            gallery,content,tags,creator:creator.tag
        })
        await newPost.save()
        return res.status(201).json({message:"Post uploaded successfully!",post:newPost, userId:creator})
    }catch(err){
        next(err)
    }
}

exports.editUserPost = async (req,res,next) => {
    try{
        //get info from request
        const postId = req.params.post
        const { content, tags } = req.body

        const post = await Post.findById(postId)
        if(!post){
            return res.status(404).json({message:"No such post"})
        }
        const checkCreator = await User.findById(req.userId).select('tag')
        if(checkCreator.tag !== post.creator || !checkCreator){
            return res.status(403).json({message:"Not authorized to perform this action"})
        }

        if (content) post.content = content
        if (tags) post.tags = tags
        if (req.files){
            //
            const newGallery = req.files.map(img=>{
                return {
                    img_url:img.path,
                    metadata:{
                        encoding:img.encoding,
                        mimetype:img.mimetype,
                        size:img.size
                    }}
            })
            //
            //delete old images that are not resent in updated gallery
            const urlArray = req.files.map(file=> {
                return file.path
            })
            post.gallery.forEach(img=>{
                    if (!urlArray.includes(img.img_url)){
                        if (files.removeImage(img)) throw new Error('Unlink error')
                    }}
                    )
            //
            post.gallery = newGallery
        }

        await post.save()
        return res.status(201).json({message:post})
    }catch(err){
        next(err)
    }

}

exports.deleteUserPost = async (req,res,next) => {
    try{
        const postId = req.params.post
        const post= await Post.findById(postId)

        if(!post){
            return res.status(404).json({message:"No such post"})
        }
        const checkCreator = await User.findById(req.userId).select('tag')
        if(checkCreator.tag !== post.creator || !checkCreator){
            return res.status(403).json({message:"Not authorized to perform this action"})
        }
        post.gallery.forEach(img=>{
            files.removeImage(img)
        })

        await post.remove()
        return res.status(200).json({message:'Post deleted successfully'})
    }catch(err){
        next(err)
    }
}

//endpoints for ->posts
//get a set of posts for /posts '{tags:...}'
exports.getPostsByTags = async (req,res,next) => {
    if(!req.query.tags){
        return res.status(204).json({message:'no tags provided'})
    }
    const tags = req.query.tags
    try{
        const generated = await tagSearch.getWeightByTags(tags,Post)
        if(!generated.length){
            return res.status(404).json({message:'No posts found with the tags!'})
        }
        res.status(200).json({message:'success',posts:generated})
    }
    catch(err){
        next(err)
    }
}
