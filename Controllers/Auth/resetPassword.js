import { AuthService } from "../../Services/Auth/index.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { ResetPasswordValidation } from "../../validation/authValidation.js";
import { AUTH_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Reset Password Controller
 * Resets user password either through token or current password verification
 */
export const resetPassword = async (req, res, next) => {
  try {
    // Validate request body
    const validatedData = ResetPasswordValidation.parse(req.body);
    const { email, password, code } = validatedData;
    const { resetThroughToken, currentPassword } = req.body;

    logger.info("Reset password request", { email, resetThroughToken });

    // Check if token is required but missing
    if (resetThroughToken && !code) {
      logger.warn("Reset password failed: Token missing", { email });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.TOKEN_MISSING)
      );
    }

    // Check if user exists
    const user = await AuthService.getUserByEmail(email);
    if (!user) {
      logger.warn("Reset password failed: User not found", { email });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.USER_NOT_FOUND)
      );
    }

    // Verify token if resetting through token
    if (resetThroughToken) {
      const isValid = await AuthService.verifyPasswordResetToken(email, code);
      if (!isValid) {
        logger.warn("Reset password failed: Invalid or expired token", {
          email,
        });
        return next(
          ErrorHandler(
            HTTP_STATUS.BAD_REQUEST,
            AUTH_MESSAGES.INVALID_RESET_TOKEN
          )
        );
      }
    } else {
      // Verify current password if resetting without token
      const isValid = await AuthService.verifyCredentials(
        email,
        currentPassword
      );
      if (!isValid) {
        logger.warn("Reset password failed: Invalid current password", {
          email,
        });
        return next(
          ErrorHandler(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.INVALID_PASSWORD)
        );
      }
    }

    // Update password
    await AuthService.updatePassword(email, password);

    logger.info("Password reset successfully", { email });
    res.status(HTTP_STATUS.OK).json({
      message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      logger.warn("Reset password validation failed", {
        errors: error.errors.map((e) => e.message),
      });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, error.errors[0].message)
      );
    }

    logger.error("Reset password error", {
      email: req.body?.email,
      message: error.message,
    });
    next(error);
  }
};
