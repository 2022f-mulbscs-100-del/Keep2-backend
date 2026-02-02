import { AuthService } from "../../Services/Auth/index.js";
import { RefreshToken } from "../../utils/GenerateRefreshToken.js";
import { AccessToken } from "../../utils/GenerateAcessToken.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { CodeCheck } from "../../validation/authValidation.js";
import { AUTH_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Sign Up Confirmation Controller
 * Verifies email confirmation code and completes registration
 */
export const signUpConfirmation = async (req, res, next) => {
  try {
    // Validate request body
    const { email, code } = CodeCheck.parse(req.body);

    logger.info("Sign up confirmation request", { email });

    // Check if user exists
    const user = await AuthService.getUserByEmail(email);
    if (!user) {
      logger.warn("Sign up confirmation failed: User not found", { email });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND)
      );
    }

    // Verify email confirmation code
    const isValid = await AuthService.verifyEmailConfirmationCode(email, code);
    if (!isValid) {
      logger.warn("Sign up confirmation failed: Invalid code", { email });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.INVALID_CODE)
      );
    }

    // Clear confirmation code
    await AuthService.clearEmailConfirmationCode(email);

    // Create Stripe customer if not exists
    if (!user.stripeCustomerId) {
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
        });

        user.stripeCustomerId = customer.id;
        await user.save();
        logger.info("Stripe customer created", { email });
      } catch (error) {
        logger.error("Stripe customer creation failed", {
          email,
          error: error.message,
        });
        return next(error);
      }
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

    logger.info("Sign up confirmation successful", { email });

    res.status(HTTP_STATUS.OK).json({
      user: userResponse,
      accessToken,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      logger.warn("Sign up confirmation validation failed", {
        errors: error.errors.map((e) => e.message),
      });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, error.errors[0].message)
      );
    }

    logger.error("Sign up confirmation error", {
      email: req.body?.email,
      message: error.message,
    });
    next(error);
  }
};
