import { createClient } from 'redis';

const redisClient = createClient({
  username: 'default', 
  password: process.env.REDIS_PASSWORD, 
  socket: {
    host: 'redis-13303.crce179.ap-south-1-1.ec2.redns.redis-cloud.com',
    port: 13303
  }
});

// Asynchronously connect to Redis and log success/failure
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis Cloud");
  } catch (error) {
    console.error("Failed to connect to Redis:", error.message);
  }
};

connectRedis();

// Listen for Redis errors
redisClient.on("error", (err) => {
  console.error("Redis Error:", err.message, err.stack);
});

const cache = {
  // Get value from cache by key
  async get(key) {
    try {
      if (!redisClient.isOpen) {
        console.warn("Redis client is closed, skipping GET operation");
        return null;
      }
      const data = await redisClient.get(key);
      
      console.log("Redis GET - Raw Data:", data); // Debug log
  
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Redis GET Error:", error.message);
      return null;
    }
  }
  ,

  // Set value in cache with TTL
  async set(key, ttl, value) {
    try {
      if (!redisClient.isOpen) {
        console.warn("Redis client is closed, skipping SET operation");
        return;
      }
      
      // Prevent caching empty arrays
      if (!value || (Array.isArray(value) && value.length === 0)) {
        console.warn(`Skipping cache SET for key ${key} - Empty value`);
        return;
      }
  
      const dataString = JSON.stringify(value);
      await redisClient.setEx(key, ttl, dataString);
  
      console.log(`Cached ${key} with TTL ${ttl} seconds`);
    } catch (error) {
      console.error("Redis SET Error:", error.message);
    }
  }
  
  ,

  // Delete keys matching the pattern
  async delPattern(pattern) {
    try {
      if (!redisClient.isOpen) {
        console.warn("Redis client is closed, skipping DELETE operation");
        return;
      }
      
      let cursor = '0';
      do {
        const [newCursor, keys] = await redisClient.scan(cursor, { MATCH: pattern });
        cursor = newCursor;
        if (keys.length > 0) {
          await Promise.all(keys.map((key) => redisClient.del(key)));
        }
      } while (cursor !== '0');
    } catch (error) {
      console.error("Redis DELETE Error:", error.message);
    }
  },
};

export { redisClient, cache };
