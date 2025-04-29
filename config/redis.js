const redis = require('redis')

const redisClient = redis.createClient({
    username: 'default',
    password:"Y47cslwPZmHE12OLXaSNMiu5gQynsKrl",
    socket: {
        // host: "redis-17103.crce179.ap-south-1-1.ec2.redns.redis-cloud.com",     
        host: '13.233.86.159',
        port: 17103
    }
})


module.exports=redisClient;

// const connected = async ()=>{
// await redisClient.connect();
// console.log('connected with redis')
// }
// connected();
