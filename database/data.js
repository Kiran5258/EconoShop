const mongodb=require('mongodb')
const mongodbclient=mongodb.MongoClient
let database;
async function connectToDatabase(){
    const client=await mongodbclient.connect('mongodb://localhost:27017')
    database=client.db('shop')
}
function getDb(){
    if(!database){
        throw{message:"Database does not connected"}
    }
    return database
}
module.exports={
    connectToDatabase:connectToDatabase,
    getDb:getDb
}