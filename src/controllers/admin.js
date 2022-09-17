const Token = require('../models').Token

exports.getRefreshTokenFamily = async (req,res,next)=>{
    try{
        const token = req.body.refreshToken
        const list = []
        async function getNext (token,list){
            const current = await Token.findOne({'token':token})
            list.push(current)
            if(!current.previous){
                return
            }
            await getNext(current.previous,list)
        }
        await getNext(token,list)
        // const tokenList = await Token.find({'user':userId}).sort({createdAt:1})
        res.status(201).json({'family':list})
    }
    catch(err){
        next(err)
    }
}