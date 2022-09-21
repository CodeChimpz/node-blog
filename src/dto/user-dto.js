class UserDto {
    id
    tag
    email
    settings
    constructor(data){
        this.id = data.id || data._id
        this.tag = data.tag
        this.email = data.email
        this.settings = data.settings
    }
}

class UserProfileDto extends UserDto{
    profile
    posts
    constructor(data) {
        super(data);
        this.posts = data.posts
        this.profile = data.profile
    }
}

class UserPeopleDto extends UserDto {
    subscriptions
    subscribers
    constructor(data,owned) {
        super(data);
        this.subscriptions = data.subscriptions ? data.subscriptions.map(sub=>{
            const res =  {
                id:sub._id,
                tag:sub._id,
                name:sub.profile.name,
                pfImg:sub.profile.pf_img
            }
            if (owned) {
                res.notify = sub.notify
            }
        }) : null
        this.subscribers = data.subscribers ? data.subscribers.map((sub)=>{
          return {
              id:sub._id,
              tag:sub._id,
              name:sub.profile.name,
              pfImg:sub.profile.pf_img
          }
        }) : null
    }
}

module.exports = {
    UserDto,
    UserProfileDto,
    UserPeopleDto
}