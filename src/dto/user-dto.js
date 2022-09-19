class UserDto {
    id
    tag
    email
    constructor(data){
        Object.keys(data).forEach(attr => {
            if (this.hasOwnProperty(attr)) {
                this.attr = data.attr
            }
        })
    }
    toJSON(){

    }
}

class UserProfileDto extends UserDto{
    profile
    posts
    constructor(data) {
        super(data);
        this.posts = data.posts
        this.profile = data.profile || { ...data }
    }
    toJSON(){

    }
}
module.exports = {
    UserDto,
    UserProfileDto
}