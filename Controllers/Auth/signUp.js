import { AuthService } from "../../Services/Auth/index.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { SignUpValidation } from "../../validation/authValidation.js";
import { AUTH_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";
import Subscription from "../../Modals/SubscriptionModal.js";

/**
 * Sign Up Controller
 * Handles new user registration
 */
export const SignUp = async (req, res, next) => {
  try {
    // Validate request body
    const validateData = SignUpValidation.parse(req.body);
    const { name, email, password } = validateData;

    logger.info("Sign up attempt", { name, email });

    // Check if user already exists
    const userExists = await AuthService.userExists(email);
    if (userExists) {
      logger.warn("Sign up failed: User already exists", { email });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.USER_EXISTS)
      );
    }

    // Create new user and auth record
    const user = await AuthService.createUser(name, email, password);

    // Create default subscription
    await Subscription.create({ userId: user.id });

    // Send email verification code
    await AuthService.sendEmailVerificationCode(email);

    logger.info("Sign up successful, verification email sent", { email });

    return res.status(HTTP_STATUS.CREATED).json({
      message: AUTH_MESSAGES.VERIFY_EMAIL,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      logger.warn("Sign up validation failed", {
        errors: error.errors.map((e) => e.message),
      });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, error.errors[0].message)
      );
    }

    logger.error("Sign up error", {
      email: req.body?.email,
      message: error.message,
    });
    return next(error);
  }
};
