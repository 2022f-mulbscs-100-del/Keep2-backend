import { AuthService } from "../../Services/Auth/index.js";
import { RefreshToken } from "../../utils/GenerateRefreshToken.js";
import { AccessToken } from "../../utils/GenerateAcessToken.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { TwoFaValidation } from "../../validation/authValidation.js";
import { AUTH_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Login Verify MFA Controller
 * Completes login after MFA verification during login
 */
export const LoginVerifyMFA = async (req, res, next) => {
  try {
    // Validate request body
    const { email, token } = TwoFaValidation.parse(req.body);

    logger.info("Login verify MFA request", { email });

    // Check if user exists
    const user = await AuthService.getUserByEmail(email);
    if (!user) {
      logger.warn("Login verify MFA failed: User not found", { email });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.USER_NOT_FOUND)
      );
    }

    // Verify MFA token
    const isValid = await AuthService.verifyMFAToken(email, token);
    if (!isValid) {
      logger.warn("Login verify MFA failed: Invalid token", { email });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.INVALID_MFA_TOKEN)
      );
    }

    logger.info("Login verify MFA successful", { email });

    // Generate tokens
    const refreshToken = RefreshToken(user);
    const accessToken = AccessToken(user);

    // Prepare response (exclude sensitive auth data)
    // eslint-disable-next-line
    const { auth: authData, ...userResponse } = user.dataValues;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(HTTP_STATUS.OK).json({
      user: userResponse,
      accessToken,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      logger.warn("Login verify MFA validation failed", {
        errors: error.errors.map((e) => e.message),
      });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, error.errors[0].message)
      );
    }

    logger.error("Login verify MFA error", {
      email: req.body?.email,
      message: error.message,
    });
    next(error);
  }
};
