import { AuthService } from "../../Services/Auth/index.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { emailValidation } from "../../validation/authValidation.js";
import { AUTH_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Forget Password Token Controller
 * Generates password reset token and sends email
 */
export const forgetPasswordToken = async (req, res, next) => {
  try {
    // Validate request body
    const validatedData = emailValidation.parse(req.body);
    const { email } = validatedData;

    logger.info("Forget password request", { email });

    // Check if user exists
    const user = await AuthService.getUserByEmail(email);
    if (!user) {
      logger.warn("Forget password failed: User not found", { email });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND)
      );
    }

    // Generate reset token and send email
    const resetToken = await AuthService.generatePasswordResetToken(email);

    logger.info("Password reset email sent", { email });

    res.status(HTTP_STATUS.OK).json({
      resetToken,
      message: AUTH_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      logger.warn("Forget password validation failed", {
        errors: error.errors.map((e) => e.message),
      });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, error.errors[0].message)
      );
    }

    logger.error("Forget password error", {
      email: req.body?.email,
      message: error.message,
    });
    next(error);
  }
};
