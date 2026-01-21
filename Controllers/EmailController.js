import axios from "axios";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { logger } from "../utils/Logger.js";
import { BrevoValidation } from "../validation/BrevoValidation.js";

export const EmailController = async (req, res, next) => {
  const { email, name, templateId } = BrevoValidation.parse(req.body);
  const { params } = req.body;
  logger.info("Email request received", { email, templateId });

  try {
    if (!email || !name || !templateId) {
      logger.warn("Invalid email parameters", { email, name, templateId });
      return next(ErrorHandler(400, "Please provide all required fields"));
    }
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        to: [{ email, name }],
        templateId,
        params,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    if (error.name === "ZodError") {
      logger.warn("Login validation failed", { errors: error.errors });
      return next(ErrorHandler(400, error.errors[0].message));
    }
    logger.error("Login error", {
      email: req.body?.email,
      message: error.message,
      errorType: error.name,
    });
    next(error);
  }
};
