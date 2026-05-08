import redisClient from "../../config/redisClient.js";
import Auth from "../../Modals/AuthModal.js";
import User from "../../Modals/UserModal.js";
import Subscription from "../../Modals/SubscriptionModal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";

export const userProfile = async (req, res, next) => {
  logger.info("User profile called in UserController");

  const userData = req.user;
  logger.info("User data from token:", { userData: userData });

  const { id } = userData;
  logger.info("params from the user profile request", { id: id });

  try {
    const cachedKey = `userProfile:${id}`;
    const cachedData = await redisClient.get(cachedKey);
    if (cachedData) {
      logger.info("User profile fetched from cache", { userId: id });
      return res.status(200).json(JSON.parse(cachedData));
    }

    let user;
    if (process.env.NODE_ENV === "development") {
      user = await User.findByPk(id, {
        include: [
          { model: Auth, as: "auth", attributes: { exclude: ["password"] } },
          { model: Subscription, as: "subscription" },
        ],
      });
    } else {
      user = await User.findByPk(id, {
        include: [{ model: Subscription, as: "subscription" }],
      });
    }

    if (!user) {
      logger.error("user not exists", { userId: id });
      return next(ErrorHandler(404, "user not exists"));
    }

    const userData = user.toJSON();
    if (userData.subscription) {
      userData.subscriptionPlan = userData.subscription.subscriptionPlan;
      userData.subscriptionExpiry = userData.subscription.subscriptionExpiry;
    }

    await redisClient.set(cachedKey, JSON.stringify(userData), {
      EX: 3600,
    });
    res.status(200).json(userData);
    logger.info("User profile fetched successfully", { userProfile: user });
  } catch (error) {
    logger.error("Error fetching user profile", {
      userId: id,
      error: error.message,
    });
    next(error);
  }
};
