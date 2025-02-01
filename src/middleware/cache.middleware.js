import { createClient } from 'redis';

const redisClient = createClient({
  username: 'default', 
  password: process.env.REDIS_PASSWORD, 
  socket: {
    host: 'redis-16060.c301.ap-south-1-1.ec2.redns.redis-cloud.com',  
    port: 16060  
  }
});

redisClient.on("connect", () => {
  console.log("Connected to Redis Cloud");
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});


redisClient.get = redisClient.get.bind(redisClient);
redisClient.setEx = redisClient.setEx.bind(redisClient);
redisClient.del = redisClient.del.bind(redisClient);


const cache = {
  async get(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Redis GET Error:", error);
      return null;
    }
  },

  async set(key, ttl, value) {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error("Redis SET Error:", error);
    }
  },

  async delPattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map((key) => redisClient.del(key)));
      }
    } catch (error) {
      console.error("Redis DELETE Error:", error);
    }
  },
};

export default cache;
