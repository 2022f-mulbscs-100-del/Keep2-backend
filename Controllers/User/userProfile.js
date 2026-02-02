import { UserService } from "../../Services/User/index.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { HTTP_STATUS, USER_MESSAGES } from "../../Constants/messages.js";

/**
 * User Profile Controller
 * Fetches authenticated user's complete profile
 */
export const userProfile = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    logger.info("User profile request", { userId });

    const user = await UserService.getUserProfile(userId);
    if (!user) {
      logger.warn("User profile not found", { userId });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND)
      );
    }

    logger.info("User profile fetched successfully", { userId });

    res.status(HTTP_STATUS.OK).json(user);
  } catch (error) {
    logger.error("User profile error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};
