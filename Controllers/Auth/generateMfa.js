import { AuthService } from "../../Services/Auth/index.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { emailValidation } from "../../validation/authValidation.js";
import { AUTH_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Generate MFA Controller
 * Generates MFA secret and QR code for user
 */
export const generateMFA = async (req, res, next) => {
  try {
    // Validate request body
    const { email } = emailValidation.parse(req.body);

    logger.info("Generate MFA request", { email });

    // Check if user exists
    const user = await AuthService.getUserByEmail(email);
    if (!user) {
      logger.warn("Generate MFA failed: User not found", { email });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.USER_NOT_FOUND)
      );
    }

    // Generate MFA secret and QR code
    const { qrCode, secret } = await AuthService.generateMFASecret(email);

    logger.info("MFA secret generated and QR code created", { email });

    res.status(HTTP_STATUS.OK).json({
      qrCode,
      secret,
      message: AUTH_MESSAGES.MFA_SETUP_INITIATED,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      logger.warn("Generate MFA validation failed", {
        errors: error.errors.map((e) => e.message),
      });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, error.errors[0].message)
      );
    }

    logger.error("Generate MFA error", {
      email: req.body?.email,
      message: error.message,
    });
    return next(error);
  }
};
