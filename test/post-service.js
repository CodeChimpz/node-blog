const chai = require('chai')
const sinon = require('sinon')
const mongoose = require('mongoose')
require('dotenv').config()
const User = require('../src/models').User
const Post = require('../src/models').Post

const services = require('../src/services')
const PostService = new services.postService()
const UserService = new services.userService()


describe('checkOwnership method',()=> {
    //make two users with a post each
    before(async () => {
        await mongoose.connect(process.env.MONGO_TEST)
        console.log('connected to test db')
        for (i = 0; i < 2; i++) {
            let user = new User({
                    profile:{name: "user" + i},
                    tag: "user" + i,
                    email: "user" + i + "@something.com",
                    password: "user" + i + "user",
                }
            )
            let post = new Post({
                    gallery: [],
                    content: '',
                    creator: user._id,
                }
            )
            users.push(user._id)
            posts.push(post._id)
            await user.save()
            await post.save()
        }
    })
    const posts = []
    const users = []
    it('should return 404 error if postId is not a valid post',(done)=>{
        const data = {
            userId : users[1],
            postId : new mongoose.Types.ObjectId()
        }
        PostService.checkOwnership(data)
            .then((result)=>{
                chai.expect(result).to.have.property('error')
                chai.expect(result).to.have.property('status',404)
                done()
            })
            .catch(err=>{
                console.log(err)
                done(err)
            })
    })
    it('should return 401 error when passing unrelated userId and postId', (done) => {
        const data = {
            userId : users[1],
            postId : posts[0]
        }
        PostService.checkOwnership(data)
            .then((result)=>{
                chai.expect(result).to.have.property('error')
                chai.expect(result).to.have.property('status',401)
                done()
            })
            .catch(err=>{
                console.log(err)
                done(err)
            })

    })
    after(async() => {
        await User.deleteMany()
        await Post.deleteMany()
        await mongoose.disconnect()
    })
})