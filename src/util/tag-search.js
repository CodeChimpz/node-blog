//Helper functions
async function getWeightByTags(tagsArr,modelGoose){
    try{
        const genArray = await modelGoose.find(
            {tags:{$in:tagsArr}}
        ).lean()
        return genArray.map((elem)=>{
            //array intersection power
            let tagNum = 0
            tagsArr.forEach(tag=>{
                if(elem.tags.includes(tag)){
                    tagNum++
                }
            })
            //todo idk about float accuracy here and idc
            const relevanceCoeff = tagNum/elem.tags.length
            //
            const weightInit = tagNum/tagsArr.length
            elem._weight = weightInit * relevanceCoeff
            return elem
        })
    }
    catch(err){
        console.log(err)
        throw new Error(err.message)
    }
}

exports.getWeightByTags = getWeightByTags