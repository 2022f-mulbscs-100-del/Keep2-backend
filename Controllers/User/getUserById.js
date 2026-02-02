import { UserService } from "../../Services/User/index.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { HTTP_STATUS, USER_MESSAGES } from "../../Constants/messages.js";

/**
 * Get User By ID Controller
 * Fetches public user profile data by email
 */
export const getUserById = async (req, res, next) => {
  try {
    const { email } = req.params;

    logger.info("Get user by email request", { email });

    const user = await UserService.getUserByEmail(email);
    if (!user) {
      logger.warn("User not found", { email });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND)
      );
    }

    const userData = {
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
    };

    logger.info("User fetched successfully", { email });

    res.status(HTTP_STATUS.OK).json(userData);
  } catch (error) {
    logger.error("Get user by email error", {
      email: req.params?.email,
      message: error.message,
    });
    next(error);
  }
};
