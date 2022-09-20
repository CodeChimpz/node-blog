//endpoint controllers for /user/:post
const services = require('../services')
const UserService = new services.userService()
const PostService = new services.postService()

exports.getUserPost = async (req,res,next) => {
    try{
        //get info from request
        const postId = req.params.post
        //
        const post = await PostService.getPost(postId,{include:'creator',fields:['tag','name']})
        if(post.error){
            return res.status(404).json({message:post.error})
        }
        return res.status(200).json({result:post})
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
        const dataObj = {
            content: req.body.content,
            tags: req.body.tags,
            gallery : PostService.formGallery(req.files),
            creator: req.userId
        }
        console.log(dataObj)
        //
        if(dataObj.creator.error){
            return res.status(403).json({message:"Not authorized to perform this action"})
        }
        const created = await PostService.createPost(dataObj)
        //
        return res.status(201).json({
            message:"Post uploaded successfully!",
            result:created
        })
    }catch(err){
        next(err)
    }
}

exports.editUserPost = async (req,res,next) => {
    try{
        //get info from request
        const dataObj = {
            id:req.params.post,
            content: req.body.content,
            tags: req.body.tags,
            gallery : req.files.length ? PostService.formGallery(req.files) : null,
        }
        const check = await PostService.checkOwnership({
            userId:req.userId,
            postId:dataObj.id
        })
        if(check.error){
            return res.status(check.status).json({message:check.error})
        }
        const updated = await PostService.editPost(dataObj,check)
        return res.status(201).json({message:updated})
    }catch(err){
        next(err)
    }

}

exports.deleteUserPost = async (req,res,next) => {
    try{
        const check = await PostService.checkOwnership({
            userId:req.userId,
            postId:req.params.post
        })
        if(check.error){
            return res.status(check.status).json({message:check.error})
        }
        await PostService.deletePost(null,check)
        return res.status(200).json({message:'Post deleted successfully'})
    }catch(err){
        next(err)
    }
}

//endpoints for ->posts
//get a set of posts for /posts '{tags:...}'
exports.getPostsByTags = async (req,res,next) => {
    try{
        if(!req.query.tags){
            return res.status(204).json({message:'no tags provided'})
        }
        const tags = req.query.tags
        const page = req.query.page
        const sort = req.body.sortBy
        const generated = await PostService.getByTags(tags,page,sort)
        if(generated.error){
            return res.status(404).json({message:generated.error})
        }
        res.status(200).json({message:'success',posts:generated})
    }
    catch(err){
        next(err)
    }
}
