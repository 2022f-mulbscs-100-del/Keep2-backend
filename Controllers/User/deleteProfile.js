import User from "../../Modals/UserModal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import bcrypt from "bcrypt";
import { logger } from "../../utils/Logger.js";
import Stripe from "stripe";

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export const DeleteProfile = async (req, res, next) => {
  logger.info("Delete profile called in UserController");
  const userData = req.user;
  logger.info("User data from token:", { userData: userData });
  const { password } = req.body;
  logger.info("params from request body:", { password: "****" });
  logger.info(userData);
  try {
    const user = await User.findByPk(userData.id);
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

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

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
    await stripe.customers.del(user.stripeCustomerId);
    await User.destroy({ where: { id: userData.id } });
    res.status(200).json({ message: "User profile deleted successfully" });
    logger.info("User profile deleted successfully", { userId: userData.id });
  } catch (error) {
    next(error);
  }
};
