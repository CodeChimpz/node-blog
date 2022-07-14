//endpoint controllers for /user/:post
function getUserPost(req,res) {
    console.log(req.params)
    console.log('got_post_foo')
}
function createUserPost(req,res){
    console.log('made_post_foo')
}
function editUserPost(req,res){
    console.log('edited_post_foo')
}
function deleteUserPost(req,res){
    console.log('deleted_post_foo')
}
//get a set of posts for /user/posts
function getUserPosts(req,res){

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