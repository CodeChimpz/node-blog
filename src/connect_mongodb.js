// const mongodb = require('mongodb')
// const MongoClient = mongodb.MongoClient
//
// let DB;
//
// const mongoConnect = (callback) =>{
//     MongoClient.connect(process.env.der_parol)
//         .then((client)=>{
//             DB = client.db('cluster0')
//             callback()
//         })
//         .catch(err=>{console.log(err)})
// }
// exports.mongoConnect = mongoConnect
// exports.getDb =()=>{
//     if(DB) return DB
//     throw 'Not connected to Database!'
// }