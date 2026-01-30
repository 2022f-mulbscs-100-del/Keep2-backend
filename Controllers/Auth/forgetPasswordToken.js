import User from "../../Modals/UserModal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import axios from "axios";
import { logger } from "../../utils/Logger.js";
import Auth from "../../Modals/AuthModal.js";
import { emailValidation } from "../../validation/authValidation.js";

export const forgetPasswordToken = async (req, res, next) => {
  //------ validate request body
  const validatedData = emailValidation.parse(req.body);

  const { email } = validatedData;

  logger.info("forgetPasswordToken called with: ", { email });
  try {
    // ------ find user by email
    const user = await User.findOne({
      where: { email },
      include: [{ model: Auth, as: "auth" }],
    });

    if (!user) {
      logger.warn(
        "forgetPasswordToken failed: User not found for email: ",
        email
      );
      return next(ErrorHandler(404, "User not exist"));
    }
    // ------ get auth record
    const auth = user.auth;
    // ------ generate unique token and expiry
    const uniqueToken = Math.floor(100000 + Math.random() * 900000);
    const expiryData = Date.now() + 15 * 60 * 1000;
    const dateObj = new Date(expiryData);

    auth.resetPasswordToken = uniqueToken;
    auth.resetPasswordExpiry = dateObj.getTime();

    await auth.save();
    logger.info("Reset password token generated for email: ", email);

    // ------ send password reset email
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        to: [{ email: user.email, name: user.name }],
        templateId: 2,
        params: {
          code: uniqueToken,
        },
      },
      {
        timeout: 10000,
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    logger.info("Password reset email sent to: ", email);

    res
      .status(200)
      .json({ uniqueToken, message: "token generated sucessfully" });
  } catch (error) {
    logger.error(
      "forgetPasswordToken error for email: ",
      email,
      " - ",
      error.message
    );
    next(error);
  }
};
