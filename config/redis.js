const redis = require('redis')
require('dotenv').config();


const redisClient = redis.createClient({
    username: 'default',
    password:process.env.pass,
    socket: {
        // host: "redis-17103.crce179.ap-south-1-1.ec2.redns.redis-cloud.com",     
        host: 'redis-10261.c259.us-central1-2.gce.redns.redis-cloud.com',
        port: 10261

    }
})


module.exports=redisClient;

// const connected = async ()=>{
// await redisClient.connect();
// console.log('connected with redis')
// }
// connected();
