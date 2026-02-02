import { logger } from "../../utils/Logger.js";
import { AUTH_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Logout Controller
 * Clears refresh token and logs user out
 */
export const Logout = (req, res, next) => {
  logger.info("Logout request from user");
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
      path: "/",
    });

    logger.info("User logged out successfully");
    res.status(HTTP_STATUS.OK).json({ message: AUTH_MESSAGES.LOGOUT_SUCCESS });
  } catch (error) {
    logger.error("Logout error", { message: error.message });
    next(error);
  }
};
