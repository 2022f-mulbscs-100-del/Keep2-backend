import { AuthService } from "../../Services/Auth/index.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { TwoFaValidation } from "../../validation/authValidation.js";
import { AUTH_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Verify MFA Controller
 * Verifies MFA token and enables MFA for user
 */
export const VerifyMFA = async (req, res, next) => {
  try {
    // Validate request body
    const { email, token } = TwoFaValidation.parse(req.body);

    logger.info("Verify MFA request", { email });

    // Check if user exists
    const user = await AuthService.getUserByEmail(email);
    if (!user) {
      logger.warn("Verify MFA failed: User not found", { email });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.USER_NOT_FOUND)
      );
    }

    // Verify MFA token
    const isValid = await AuthService.verifyMFAToken(email, token);
    if (!isValid) {
      logger.warn("Verify MFA failed: Invalid token", { email });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.INVALID_MFA_TOKEN)
      );
    }

    // Enable MFA for user
    await AuthService.enableMFA(email);

    logger.info("MFA verified and enabled successfully", { email });

    res.status(HTTP_STATUS.OK).json({
      message: AUTH_MESSAGES.MFA_ENABLED_SUCCESS,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      logger.warn("Verify MFA validation failed", {
        errors: error.errors.map((e) => e.message),
      });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, error.errors[0].message)
      );
    }

    logger.error("Verify MFA error", {
      email: req.body?.email,
      message: error.message,
    });
    return next(error);
  }
};
