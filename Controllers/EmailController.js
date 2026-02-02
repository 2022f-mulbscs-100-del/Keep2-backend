import axios from "axios";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { logger } from "../utils/Logger.js";
import { BrevoValidation } from "../validation/BrevoValidation.js";
import { HTTP_STATUS } from "../Constants/messages.js";

/**
 * Email Controller
 * Sends emails via Brevo API
 */
export const EmailController = async (req, res, next) => {
  try {
    const { email, name, templateId } = BrevoValidation.parse(req.body);
    const { params } = req.body;

    logger.info("Email request", { email, templateId });

    if (!email || !name || !templateId) {
      logger.warn("Invalid email parameters", { email, name, templateId });
      return next(
        ErrorHandler(
          HTTP_STATUS.BAD_REQUEST,
          "Please provide all required fields"
        )
      );
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

    logger.info("Email sent successfully", { email, templateId });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    if (error.name === "ZodError") {
      logger.warn("Email validation failed", {
        errors: error.errors.map((e) => e.message),
      });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, error.errors[0].message)
      );
    }

    logger.error("Email sending error", {
      email: req.body?.email,
      message: error.message,
    });
    next(error);
  }
};
