class UserDto {
    id
    tag
    email
    constructor(data){
        this.id = data.id || data._id
        this.tag = data.tag
        this.email = data.email
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
}
module.exports = {
    UserDto,
    UserProfileDto
}