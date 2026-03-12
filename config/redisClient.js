import { createClient } from "redis";
import { logger } from "../utils/Logger.js";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

logger.info("Redis client created successfully");

export default redisClient;
