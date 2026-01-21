import axios from "axios";
import { logger } from "../utils/Logger.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";

export const verifyTurnstileToken = async (req, res, next) => {
  const { token } = req.body;
  logger.info("Turnstile token verification requested");

  if (!token) {
    logger.warn("Turnstile token is missing");
    return next(ErrorHandler(400, "Turnstile token is missing"));
  }

  try {
    const params = new URLSearchParams();
    params.append("secret", process.env.TURNSTILE_SECRET_KEY);
    params.append("response", token);
    axios
      .post("https://challenges.cloudflare.com/turnstile/v0/siteverify", params)
      .then((response) => {
        const data = response.data;
        if (data.success) {
          res
            .status(200)
            .json({ message: "Turnstile verification successful" });
        } else {
          return next(ErrorHandler(400, "Turnstile verification failed"));
        }
      })
      .catch(() => {
        return next(ErrorHandler(500, "Error verifying Turnstile token"));
      });
  } catch (error) {
    next(error);
  }
};
