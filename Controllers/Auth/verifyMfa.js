import User from "../../Modals/UserModal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import speakeasy from "speakeasy";
import Auth from "../../Modals/AuthModal.js";

export const VerifyMFA = async (req, res, next) => {
  const { email, token } = req.body;
  logger.info("VerifyMFA called with: ", { email });
  const user = await User.findOne({
    where: { email },
    include: [{ model: Auth, as: "auth" }],
  });
  try {
    if (!user) {
      logger.warn("VerifyMFA failed: User not found for email: ", { email });
      return next(ErrorHandler(400, "User not found"));
    }
    const auth = user.auth;

    const verified = speakeasy.totp.verify({
      secret: auth.twoFaSecret,
      encoding: "base32",
      token: token,
      window: 1,
    });

    if (!verified) {
      logger.warn("VerifyMFA failed: Invalid MFA token for email: ", { email });
      return next(ErrorHandler(400, "Invalid MFA Token"));
    }
    logger.info("VerifyMFA token verified for email: ", { email });

    user.MfaEnabled = true;
    await user.save();
    await auth.save();

    logger.info("MFA enabled successfully for email: ", { email });

    res.status(200).json({ message: "MFA verified and enabled successfully" });
  } catch (error) {
    logger.error("VerifyMFA error for email: ", { email }, " - ", {
      message: error.message,
    });
    return next(error);
  }
};
