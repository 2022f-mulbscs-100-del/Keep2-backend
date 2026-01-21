import axios from "axios";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { logger } from "../utils/Logger.js";
import { BrevoValidation } from "../validation/BrevoValidation.js";

export const EmailController = async (req, res, next) => {
  const { email, name, templateId, params } = req.body;

  console.log(req.body);
  console.log(process.env.BREVO_API_KEY);
  try {
    if (!email || !name || !templateId) {
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
    next(error);
  }
};

// await axios.post(
//   "https://api.brevo.com/v3/smtp/email",
//   {
//     to: [{ email, name }],
//     templateId,
//     params
//   },
//   {
//     headers: {
//       "api-key": process.env.BREVO_API_KEY,
//       "Content-Type": "application/json",
//     },
//   }
// );
