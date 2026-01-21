import User from "../../Modals/UserModal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import Auth from "../../Modals/AuthModal.js";
import { emailValidation } from "../../validation/authValidation.js";

export const generateMFA = async (req, res, next) => {
  const { email } = emailValidation.parse(req.body);
  logger.info("generateMFA called with:", { email });
  try {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Auth, as: "auth" }],
    });

    if (!user) {
      logger.warn("generateMFA failed: User not found for email: ", email);
      return next(ErrorHandler(400, "User not found"));
    }
    const auth = user.auth;

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `Keeper ${email}`,
    });
    logger.info("MFA secret generated for email: ", email);

    const qrCode = QRCode.toDataURL(secret.otpauth_url);

    auth.MfaSeceret = secret.base32;
    user.MfaEnabled = false;
    await user.save();
    await auth.save();
    logger.info("MFA QR code generated and saved for email: ", email);

    res
      .status(200)
      .json({ qrCode, message: "MFA settings updated successfully" });
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
