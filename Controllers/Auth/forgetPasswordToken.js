import User from "../../Modals/UserModal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import axios from "axios";
import { logger } from "../../utils/Logger.js";
import Auth from "../../Modals/AuthModal.js";

export const forgetPasswordToken = async (req, res, next) => {
  const { email } = req.body;
  logger.info("forgetPasswordToken called with: ", { email });
  try {
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
    const auth = user.auth;
    const uniqueToken = Math.floor(100000 + Math.random() * 900000);
    const expiryData = Date.now() + 15 * 60 * 1000;
    const dateObj = new Date(expiryData);
    auth.resetPasswordToken = uniqueToken;
    auth.resetPasswordExpiry = dateObj.getTime();
    await auth.save();
    logger.info("Reset password token generated for email: ", email);

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
