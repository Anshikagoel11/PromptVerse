
const express = require('express')
const main = require('./model')
const redis = require('redis');
const redisClient = require('./config/redis');
const uuid = require('uuid')
const app = express();
const cors = require('cors'); //browser is very strict that if you made request anywhere (even locally) ,it is not allowed until that server is saying to browser to approave the request so for that we use cors

app.use(cors())  //all req first go to cors otherwise will reject by browser
app.use(express.json()); //parse



app.listen(4000,async()=>{
    console.log('server is listening at post no 4000')
})


async function connect() {
    await redisClient.connect();
    console.log('Connected with redis')
}
connect();



app.post('/askQues', async (req, res) => {
    try {

      const { ques ,sessionId } = req.body;
      // console.log(req.body)
      console.log("session id:", sessionId);

     if(!sessionId){
        console.log('session id missing')
        return res.status(400).send('some error occured')     
     }

     let previousData = await redisClient.get(sessionId);

    //  console.log("previous data",previousData)

     if(!previousData){
        // previousData = JSON.stringify([]) //not valid since it ia string now so push operation cannot be done
        previousData=[]
     }else{
        previousData=JSON.parse(previousData); //necessary to parse(convert json to js obj since redis have store it as a string previously and we need js obj to read)
        //'{"name":"Anshika","age":20}'   ------>  {"name":"Anshika","age":20}
     }

      
     const userMessage = {
      role:"user",
      parts:[{text:ques}]
   };

     previousData.push(userMessage);
// console.log(' data with user's current ques',previousData);
     
      const answer = await main(previousData);

      const modelMessage ={
        role:"model",
        parts:[{text:answer}]
      };

      previousData.push(modelMessage);
      // console.log(' data with user's current ques and model's output',previousData);


      await redisClient.set(sessionId,JSON.stringify(previousData)); //necessary to convert to string here because redis does not store object directly ,it stores string only

      res.status(200).send(answer);


    } catch (err) {
      console.error('Error processing request:', err);
      res.status(500).send('Some error occurred');
    }
  });



// Handle request to delete session data from Redis
app.post('/deleteSession', async (req, res) => {
    try {
        const { sessionId } = req.body;
        // console.log('Deleting session data for sessionId:', sessionId);

        // Remove the session data from Redis , data corresponding to this id will also delete
        await redisClient.del(sessionId);
        // await localStorage.del(sessionId);-invalid here since  localStorage doesn’t exist in Node.js — it's a browser API.

        console.log('Session data deleted from Redis');
        res.status(200).send('Session data deleted');
    } catch (error) {
        console.error('Error deleting session data:', error);
        res.status(500).send('Error deleting session data');
    }
});
