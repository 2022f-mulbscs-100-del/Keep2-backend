import User from "../../Modals/UserModal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { RefreshToken } from "../../utils/GenerateRefreshToken.js";
import { AccessToken } from "../../utils/GenerateAcessToken.js";
import { logger } from "../../utils/Logger.js";
import Auth from "../../Modals/AuthModal.js";
import { MFAValidation } from "../../validation/authValidation.js";

export const TwoFaLogin = async (req, res, next) => {
  const { email, twoFaCode } = MFAValidation.parse(req.body);

  logger.info("TwoFaLogin called with: ", { email });
  try {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Auth, as: "auth" }],
    });

    if (!user) {
      logger.warn("TwoFaLogin failed: User not found for email: ", email);
      return next(ErrorHandler(400, "User not found"));
    }
    const auth = user.auth;
    if (auth.twoFaSecret != twoFaCode) {
      logger.warn("TwoFaLogin failed: Invalid 2FA code for email: ", email);
      return next(ErrorHandler(400, "Invalid 2FA Code"));
    }
    logger.info("TwoFaLogin verified for email: ", email);

    auth.twoFaSecret = null;
    auth.isTwoFaVerifiedExpiration = null;
    await user.save();
    await auth.save();

    logger.info("TwoFaLogin successful for email: ", email);

    const refreshToken = RefreshToken(user);
    const accessToken = AccessToken(user);

    const { rest } = user.dataValues;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    logger.info(
      "Refresh token generated and cookie set for TwoFaLogin for email: ",
      refreshToken
    );
    res.status(200).json({
      rest,
      accessToken,
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
