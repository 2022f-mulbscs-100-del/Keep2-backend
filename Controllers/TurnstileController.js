import axios from "axios";
import { logger } from "../utils/Logger.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { HTTP_STATUS } from "../Constants/messages.js";

/**
 * Verify Turnstile Token Controller
 * Verifies Cloudflare Turnstile captcha token
 */
export const verifyTurnstileToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    logger.info("Turnstile verification request");

    if (!token) {
      logger.warn("Turnstile token missing");
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, "Turnstile token is required")
      );
    }

    const params = new URLSearchParams();
    params.append("secret", process.env.TURNSTILE_SECRET_KEY);
    params.append("response", token);

    const response = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      params
    );

    const data = response.data;

    if (data.success) {
      logger.info("Turnstile verification successful");
      res.status(HTTP_STATUS.OK).json({
        message: "Turnstile verification successful",
      });
    } else {
      logger.warn("Turnstile verification failed", {
        errors: data["error-codes"],
      });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, "Turnstile verification failed")
      );
    }
  } catch (error) {
    logger.error("Turnstile verification error", { message: error.message });

    if (error.response) {
      return next(
        ErrorHandler(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "Error verifying Turnstile token"
        )
      );
    }

    next(error);
  }
};
