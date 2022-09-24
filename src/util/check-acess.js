exports.post = (post,user,settings)=>{
    if(post.hidden.forbidden.users.find(u=>{return u.id.toString() === user.toString()}) ){
        return 0
    }
    if(settings.find(
        u=>{
            return u.id.toString() === user.toString() && u.forbidTags.find(
                d=>{
                    return post.hidden.forbidden.tags.find(
                        t=>{
                            return d.tag === t.tag
                        })})})){
        return 0
    }
    return 1
}