import { AuthService } from "../../Services/Auth/index.js";
import { RefreshToken } from "../../utils/GenerateRefreshToken.js";
import { AccessToken } from "../../utils/GenerateAcessToken.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { LoginValidation } from "../../validation/authValidation.js";
import { AUTH_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Login Controller
 * Handles user login with email and password
 * Checks for passkey, MFA, and 2FA requirements
 */
export const Login = async (req, res, next) => {
  try {
    // Validate request body
    const validatedData = LoginValidation.parse(req.body);
    const { email, password } = validatedData;

    logger.info("Login attempt", { email });

    // Verify user credentials
    const user = await AuthService.verifyCredentials(email, password);

    // Check if email is verified
    const emailVerified = await AuthService.isEmailVerified(email);
    if (!emailVerified) {
      await AuthService.sendEmailVerificationCode(email);
      logger.warn("Login failed: Email not verified", { email });
      return res.status(HTTP_STATUS.CREATED).json({
        message: AUTH_MESSAGES.VERIFY_EMAIL,
      });
    }

    // Check for passkey, MFA, and 2FA
    if (user.passKeyEnabled === "1") {
      logger.info("Login with passkey required", { email });
      return res.status(HTTP_STATUS.OK).json({
        message: AUTH_MESSAGES.PASSKEY_ENABLED,
      });
    }

    if (user.MfaEnabled) {
      logger.info("Login with MFA required", { email });
      return res.status(HTTP_STATUS.OK).json({
        message: AUTH_MESSAGES.MFA_ENABLED,
      });
    }

    if (user.isTwoFaEnabled) {
      await AuthService.send2FACode(email);
      logger.info("2FA code sent", { email });
      return res.status(HTTP_STATUS.OK).json({
        message: AUTH_MESSAGES.TWO_FA_ENABLED,
        isTwoFaEnabled: user.isTwoFaEnabled,
      });
    }

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

    logger.info("Login successful", { email });
    res.status(HTTP_STATUS.OK).json({
      user: userResponse,
      accessToken,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      logger.warn("Login validation failed", {
        errors: error.errors.map((e) => e.message),
      });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, error.errors[0].message)
      );
    }

    logger.error("Login error", {
      email: req.body?.email,
      message: error.message,
    });
    next(error);
  }
};
