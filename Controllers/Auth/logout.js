import redisClient from "../../config/redisClient.js";
import { logger } from "../../utils/Logger.js";

export const Logout = async (req, res, next) => {
  logger.info("Logout called");
  try {
    const userId = req.user?.id;

    // Clear user profile cache from Redis
    if (userId) {
      const cachedKey = `userProfile:${userId}`;
      await redisClient.del(cachedKey);
      logger.info("User profile cache cleared", { userId });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
      path: "/",
    });

    logger.info("User logged out successfully");
    res.status(200).json("Logged out successfully");
  } catch (error) {
    logger.error("Logout error - ", error.message);
    next(error);
  }
};
