import { ErrorHandler } from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import { AccessToken } from "../utils/GenerateAcessToken.js";
import User from "../Modals/UserModal.js";
import { logger } from "../utils/Logger.js";
import { HTTP_STATUS, AUTH_MESSAGES } from "../Constants/messages.js";

/**
 * Refresh Token Controller
 * Generates new access token from refresh token
 */
export default async function Refresh(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;

    logger.info("Refresh token request");

    if (!refreshToken) {
      logger.warn("No refresh token provided");
      return next(
        ErrorHandler(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED)
      );
    }

    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const user = await User.findByPk(payload.id);
    if (!user) {
      logger.warn("User not found for refresh token", { userId: payload.id });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND)
      );
    }

    const newAccessToken = AccessToken(user);
    //eslint-disable-next-line
    const { password, ...userWithoutPassword } = user.dataValues;

    logger.info("Refresh token successful", { userId: user.id });

    res.status(HTTP_STATUS.OK).json({
      accessToken: newAccessToken,
      rest: userWithoutPassword,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      logger.warn("Refresh token expired");
      return next(
        ErrorHandler(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.TOKEN_EXPIRED)
      );
    }

    logger.error("Refresh token error", {
      message: error.message,
      errorName: error.name,
    });

    return next(
      ErrorHandler(HTTP_STATUS.FORBIDDEN, AUTH_MESSAGES.INVALID_TOKEN)
    );
  }
}
