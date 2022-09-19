const fs = require('fs')
const path = require('path')

exports.removeImage = function removeImage(img){
    fs.unlink(path.join(__dirname,'..','..',img.img_url),err=>{
        return err
    })
}
