exports.tagStringSanitizer = (tagString) => {
    if(tagString) {
        if (tagString[0] == '#') tagString = tagString.substring(1,)
        const lst = tagString.length - 1
        if (tagString[lst] == '#') tagString = tagString.substring(0, lst)
        return tagString
    }
}