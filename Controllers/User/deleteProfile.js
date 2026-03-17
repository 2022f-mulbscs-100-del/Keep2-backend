import User from "../../Modals/UserModal.js";
import Auth from "../../Modals/AuthModal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import bcrypt from "bcrypt";
import { logger } from "../../utils/Logger.js";
import { getStripeClient } from "../../utils/StripeClient.js";
import redisClient from "../../config/redisClient.js";
// import redisClient from "../../config/redisClient.js";

export const DeleteProfile = async (req, res, next) => {
  const stripe = getStripeClient();

  logger.info("Delete profile called in UserController");
  const userData = req.user;
  logger.info("User data from token:", { userData: userData });
  const { password } = req.body;
  logger.info("params from request body:", { password: "****" });
  logger.info(userData);
  try {
    const user = await User.findByPk(userData.id, {
      include: [{ model: Auth, as: "auth" }],
    });

    if (!user) {
      logger.error("user not found", { userId: userData.id });
      return next(ErrorHandler(404, "user not found"));
    }

    if (!password) {
      logger.error("Password is required to delete profile", {
        userId: userData.id,
      });
      return next(ErrorHandler(400, "Password is required"));
    }

    if (!user.auth?.password) {
      logger.error("No local password found for profile deletion", {
        userId: userData.id,
      });
      return next(
        ErrorHandler(400, "This account does not support password deletion")
      );
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.auth.password
    );

    if (!isPasswordCorrect) {
      logger.error("Invalid password provided for profile deletion", {
        userId: userData.id,
      });
      return next(ErrorHandler(400, "Invalid Password"));
    }

    logger.info("Deleting user profile from Stripe and database", {
      userId: userData.id,
      stripeCustomerId: user.stripeCustomerId,
    });
    if (user.stripeCustomerId && stripe) {
      await stripe.customers.del(user.stripeCustomerId);
    } else if (user.stripeCustomerId && !stripe) {
      logger.warn("Skipping Stripe customer deletion: Stripe not configured", {
        userId: userData.id,
      });
    }
    await User.destroy({ where: { id: userData.id } });
    await redisClient.del(`userProfile:${req.user.id}`);
    await redisClient.del(`userProfile:${userData.email}`);
    res.status(200).json({ message: "User profile deleted successfully" });
    logger.info("User profile deleted successfully", { userId: userData.id });
  } catch (error) {
    next(error);
  }
};
