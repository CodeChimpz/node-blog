//endpoint controllers for /user/:post
const Post = require('../models/post')
const User = require('../models/user')

const fs = require('fs')
const path = require('path')
//get a set of posts for /user/posts

//test function
async function getUserPosts(req,res){
    try{
        const user = req.params.user
        //get id from params
        const total = await User.find({tag:user}).populate('posts')
        //pagination
        const currPage = req.query.page || 1
        const perPage = 3
        const totalPosts = await Post.find({creator:getUserId}).countDocuments()
        //pagination
        const postsPopulated = await Post.find({creator:getUserId}).populate('creator').skip((currPage-1)*perPage).limit(perPage)
        res.status(200).json({posts:postsPopulated,totalPosts})
    }
    catch(err){
        console.log(err)
        res.status(err.statusCode || 500).json({message: 'error', error: err})
    }

}

function getUserPost(req,res,next) {
    const postId = req.params.post
    Post.findById(postId).populate('creator',['tag','name','profile'])
        .then(result=>{
                if(!result){
                    const error = new Error('No such post')
                    error.statusCode = 404
                    throw error
                }
                res.status(200).json({message:result})
            }
        )
        .catch(err=>{
            next(err)
        })
}

function createUserPost(req,res,next){
    if(!req.files){
        const error = new Error('No image file provided')
        error.statusCode = 422
        throw error
    }
    const {
        content,tags,mentionedString
    } = req.body
    //preparing data for model
    const gallery = req.files.map(img=>{
        return {img_url:img.path,
            metadata:{
            encoding:img.encoding,
            mimetype:img.mimetype,
            size:img.size
            }}
    })
    //reference handling
    const creator = req.userId
    const newPost = new Post({
        gallery,content,tags,creator
    })
    newPost.save()
        .then((result)=>{
            return User.findById(req.userId).populate('posts')
        })
        .then(user=>{
            user.posts.push(newPost)
            return user.save()})
        .then(()=>{
            res.status(201).json({message:"Post uploaded successfully!",post:newPost, userId:creator})
        })
        .catch(err=>{
            next(err)
        })
}

function editUserPost(req,res,next){
    //validate user
    const postId = req.params.post
    const { content,tags,mentionedString } = req.body
    Post.findById(postId)
        .then(post=>{
            if(!post){
                const error = new Error('No such post')
                error.statusCode = 404
                throw error
            }
            if(post.creator !== req.userId){
                const error = new Error('Not authorized to delete')
                error.statusCode = 403
                throw error
            }
            if (req.files){
                const newGallery = req.files.map(img=>{
                    return {
                        img_url:img.path,
                        metadata:{
                            encoding:img.encoding,
                            mimetype:img.mimetype,
                            size:img.size
                        }}
                })
                //delete old images that are not resent in updated gallery
                const urlArray = req.files.map(file=> {
                    return file.path
                })
                post.gallery.forEach(img=>{
                    if (!urlArray.includes(img.img_url)){
                            removeImage(img)
                        }
                    }
                )
                post.gallery = newGallery
            }
            post.content = content
            post.tags = tags
            return post.save()
    })
        .then(result=>{
            res.status(201).json({message:result})
    })
        .catch(
            err=>{
                next(err)
            }
        )

}
function deleteUserPost(req,res,next){
    const postId = req.params.post
    Post.findById(postId)
        .then(post=>{
            if(!post){
                const error = new Error('No such post')
                error.statusCode = 404
                throw error
            }
            if(post.creator !== req.userId){
                const error = new Error('Not authorized to delete')
                error.statusCode = 403
                throw error
            }
            post.gallery.forEach(img=>{
                removeImage(img)
            })
            return Post.findByIdAndRemove(postId)
        })
        .then(result=>{
            return User.findById(req.userId)
        })
        .then(user=>{
            user.posts.pull(postId)
            return user.save()
        })
        .then(result=>{
            res.status(200).json({message:'Post deleted successfully'})}
        )
        .catch(err=>{
            next(err)
        })
}

//endpoint controllers for ->posts
//get a set of posts for /posts '{tags:...}'
function getPostsByTags(req,res){}

function getFeed(req,res){}

function getExp(req,res){}

//feedback for algorythms
// function postFeed(req,res){}
//
// function postExp(req,res){}
//
// function putExp(req,res){}


//Helper functions
function getPostsGallery(filter_,settings){

}
function byTags(req,res,settings){}

function byId(req,res,settings){}

function forExp(req,res,settings){}

function forFeed(req,res,settings){}

//helper functions
function removeImage(img){
    fs.unlink(path.join(__dirname,'..',img.img_url),err=>{
        if(err){
            const error = new Error
            error.message = err
            throw error
        }
    })
}

module.exports = {
    getUserPost,
    editUserPost,
    deleteUserPost,
    createUserPost,
    getUserPosts,
    getPostsByTags,
    getFeed,
    getExp

}