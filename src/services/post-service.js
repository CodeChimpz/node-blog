const files = require('../util').files
const PAGE_SZ = parseInt(require('../config.json').page.pageSize)

const Post = require('../models').Post

class PostService{
    formGallery(files){
        return files.map(img=>{
            return { path: img.path,
                metadata:{
                    encoding:img.encoding,
                    mimetype:img.mimetype,
                    size:img.size
                }}
        })
    }
    async checkOwnership(idObj){
        const {userId, postId} = idObj
        const check = await Post.findById(postId)
        if(!check){
            return { status:404, error : "No such post" }
        }
        if(check.creator != userId){
            return { status:401, error:'Not authenticated to perform this action' }
        }
        return check
    }
    async getPost(id,include){
        const query =  include ? Post.findById(id).populate(include.include,include.fields) : Post.findById(id)
        const post = await query.exec()
        if(!post){
            return { error : 'No such post'}
        }
        return post
    }
    async createPost(dataObj){
        const post = new Post({...dataObj})
        await post.save()
        return post
    }
    async editPost(dataObj,prePost){
        const post = prePost || Post.findById(dataObj.id)
        if (dataObj.gallery) {
            const urlArray = dataObj.gallery.map(file=> {
                return file.path
            })
            post.gallery.forEach(img=>{
                if (!urlArray.includes(img.path)){
                    if (files.removeImage(img)) throw new Error('Unlink error')
                }}
            )
        }
        post.hidden = dataObj.hidden || post.hidden
        post.content = dataObj.content || post.content
        post.tags = dataObj.tags || post.tags
        await post.save()
        return post
    }
    async deletePost(id,prePost){
        const post = prePost || Post.findById(id)
        await post.remove()
        post.gallery.forEach(img=>{
            if (files.removeImage(img)) throw new Error('Unlink error')
        })
    }
    async deleteUserPosts(id){
        await Post.deleteMany({creator:id})
    }
    async getByTags(tags,page=0,options){
        const genArray = await Post.find(
            {
                tags:{$in:tags},
            }
        )
            .skip(page*PAGE_SZ)
            .limit(page*PAGE_SZ+PAGE_SZ)
            .sort(options)
            .lean()

        const generated = genArray.map((elem)=>{
            //array intersection power
            let tagNum = 0
            tags.forEach(tag=>{
                if(elem.tags.includes(tag)){
                    tagNum++
                }
            })
            //todo idk about float accuracy here and idc
            const relevanceCoeff = tagNum/elem.tags.length
            //
            const weightInit = tagNum/tags.length
            elem._weight = weightInit * relevanceCoeff
            return elem
        })
        if(!generated.length){
            return {error:'No posts found with the tags!'}
        }
        return generated
    }
}

module.exports = PostService