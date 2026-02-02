import { UserService } from "../../Services/User/index.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { HTTP_STATUS, USER_MESSAGES } from "../../Constants/messages.js";
import Stripe from "stripe";

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Delete Profile Controller
 * Permanently deletes user account after password verification
 */
export const DeleteProfile = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { password } = req.body;

    logger.info("Delete profile request", { userId });

    if (!password) {
      logger.warn("Password not provided for profile deletion", { userId });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, USER_MESSAGES.PASSWORD_REQUIRED)
      );
    }

    // Verify password and delete account
    const stripeCustomerId = await UserService.deleteUserAccountWithPassword(
      userId,
      password
    );

    // Delete Stripe customer
    if (stripeCustomerId) {
      logger.info("Deleting Stripe customer", { userId, stripeCustomerId });
      await stripe.customers.del(stripeCustomerId);
    }

    logger.info("User profile deleted successfully", { userId });

    res.status(HTTP_STATUS.OK).json({
      message: USER_MESSAGES.PROFILE_DELETED_SUCCESS,
    });
  } catch (error) {
    logger.error("Delete profile error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};
