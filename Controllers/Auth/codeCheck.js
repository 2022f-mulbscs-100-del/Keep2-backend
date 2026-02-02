import { AuthService } from "../../Services/Auth/index.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { CodeCheck as codeCheckValidation } from "../../validation/authValidation.js";
import { AUTH_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Code Check Controller
 * Verifies password reset token is valid
 */
export const CodeCheck = async (req, res, next) => {
  try {
    // Validate request body
    const validateData = codeCheckValidation.parse(req.body);
    const { code, email } = validateData;

    logger.info("Code check request", { email });

    // Check if user exists
    const user = await AuthService.getUserByEmail(email);
    if (!user) {
      logger.warn("Code check failed: User not found", { email });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND)
      );
    }

    // Verify reset password token
    const isValid = await AuthService.verifyPasswordResetToken(email, code);
    if (!isValid) {
      logger.warn("Code check failed: Invalid or expired token", { email });
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: AUTH_MESSAGES.INVALID_RESET_TOKEN,
      });
    }

    logger.info("Code check successful", { email });
    res.status(HTTP_STATUS.OK).json({
      message: AUTH_MESSAGES.TOKEN_VERIFIED,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      logger.warn("Code check validation failed", {
        errors: error.errors.map((e) => e.message),
      });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, error.errors[0].message)
      );
    }

    logger.error("Code check error", {
      email: req.body?.email,
      message: error.message,
    });
    next(error);
  }
};
