import { AuthService } from "../../Services/Auth/index.js";
import { RefreshToken } from "../../utils/GenerateRefreshToken.js";
import { AccessToken } from "../../utils/GenerateAcessToken.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { MFAValidation } from "../../validation/authValidation.js";
import { AUTH_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Two FA Login Controller
 * Completes login after 2FA verification
 */
export const TwoFaLogin = async (req, res, next) => {
  try {
    // Validate request body
    const { email, twoFaCode } = MFAValidation.parse(req.body);

    logger.info("2FA login request", { email });

    // Check if user exists
    const user = await AuthService.getUserByEmail(email);
    if (!user) {
      logger.warn("2FA login failed: User not found", { email });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.USER_NOT_FOUND)
      );
    }

    // Verify 2FA code
    const isValid = await AuthService.verify2FACode(email, twoFaCode);
    if (!isValid) {
      logger.warn("2FA login failed: Invalid 2FA code", { email });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.INVALID_2FA_CODE)
      );
    }

    // Clear 2FA code after verification
    await AuthService.clear2FACode(email);

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

    logger.info("2FA login successful", { email });

    res.status(HTTP_STATUS.OK).json({
      user: userResponse,
      accessToken,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      logger.warn("2FA login validation failed", {
        errors: error.errors.map((e) => e.message),
      });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, error.errors[0].message)
      );
    }

    logger.error("2FA login error", {
      email: req.body?.email,
      message: error.message,
    });
    next(error);
  }
};
