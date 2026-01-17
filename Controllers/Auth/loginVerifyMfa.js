import User from "../../Modals/UserModal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { RefreshToken } from "../../utils/GenerateRefreshToken.js";
import { AccessToken } from "../../utils/GenerateAcessToken.js";
import { logger } from "../../utils/Logger.js";
import speakeasy from "speakeasy";
import Auth from "../../Modals/AuthModal.js";

export const LoginVerifyMFA = async (req, res, next) => {
  const { email, token } = req.body;
  logger.info("LoginVerifyMFA called with: ", { email });
  try {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Auth, as: "auth" }],
    });

    if (!user) {
      logger.warn("LoginVerifyMFA failed: User not found for email: ", {
        email,
      });
      return next(ErrorHandler(400, "User not found"));
    }
    const auth = user.auth;

    const verified = speakeasy.totp.verify({
      secret: auth.MfaSeceret,
      encoding: "base32",
      token: token,
      window: 1,
    });

    if (!verified) {
      logger.warn("LoginVerifyMFA failed: Invalid MFA token for email: ", {
        email,
      });
      return next(ErrorHandler(400, "Invalid MFA Token"));
    }
    logger.info("LoginVerifyMFA token verified for email: ", { email });

    const refreshToken = RefreshToken(user);
    const accessToken = AccessToken(user);

    const { rest } = user.dataValues;

    logger.info(
      "Refresh token generated and cookie set for LoginVerifyMFA : ",
      { refreshToken }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    logger.info("checking environment for cookie settings", {
      nodeEnv: process.env.NODE_ENV,
    });
    logger.info("LoginVerifyMFA successful for email: ", { email });
    res.status(200).json({
      rest,
      accessToken,
    });
  } catch (error) {
    logger.error("LoginVerifyMFA error for email: ", { email }, " - ", {
      message: error.message,
    });
    next(error);
  }
};
