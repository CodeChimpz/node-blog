exports.tagStringSanitizer = (tags) => {
    if(tags) {
        if (tags[0] == '#') tags = tags.substring(1,)
        const lst = tags.length - 1
        if (tags[lst] == '#') tags = tags.substring(0, lst)
        tags = tags.split('#')
        return tags
    }
}