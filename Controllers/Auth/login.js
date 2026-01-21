import User from "../../Modals/UserModal.js";
import bcrypt from "bcrypt";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { RefreshToken } from "../../utils/GenerateRefreshToken.js";
import { AccessToken } from "../../utils/GenerateAcessToken.js";
import axios from "axios";
import { logger } from "../../utils/Logger.js";
import Auth from "../../Modals/AuthModal.js";
import { LoginValidation } from "../../validation/authValidation.js";

export const Login = async (req, res, next) => {
  try {
    const validatedData = LoginValidation.parse(req.body);
    const { email, password: pass } = validatedData;

    logger.info("params from login controller : ", {
      email,
      password: pass ? "****" : undefined,
    });

    const user = await User.findOne({
      where: { email },
      include: [{ model: Auth, as: "auth" }],
    });
    if (!user) {
      logger.warn("Login failed", { email, reason: "User not found" });
      return next(ErrorHandler(400, "User not found"));
    }
    const auth = user.auth;
    if (!auth) {
      logger.warn("Login failed", { email, reason: "Auth record not found" });
      return next(ErrorHandler(400, "Authentication details not found"));
    }

    const isPasswordCorrect = await bcrypt.compare(pass, auth.password);

    if (!isPasswordCorrect) {
      logger.warn("Login failed for email: ", { email }, " - Invalid Password");
      return next(ErrorHandler(400, "Invalid Password"));
    }

    if (auth.signUpConfirmation === false) {
      const token = Math.floor(100000 + Math.random() * 900000);
      auth.signUpConfirmationToken = token;
      const dateObj = new Date(Date.now() + 15 * 60 * 1000);
      auth.signUpConfirmationTokenExpiry = dateObj.getTime();
      await user.save();
      await auth.save();

      try {
        logger.info("signup token generated for email: ", { email });

        await axios.post(
          "https://api.brevo.com/v3/smtp/email",
          {
            to: [{ email: user.email, name: user.name || "User" }],
            templateId: 3,
            params: {
              code: token,
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
        logger.info("signup code confirmation email sent to: ", { email });
        logger.warn("Login failed", { email, reason: "Email not verified" });
        return res.status(201).json({ message: "verify email" });
      } catch (error) {
        logger.error("Error sending signup confirmation email to: ", {
          email: user.email,
          reason: error.message,
        });
        return next(error);
      }
    }

    if (user.MfaEnabled) {
      logger.info("Login attempt with MFA enabled for email: ", { email });
      return res.status(200).json({ message: "MFA enabled" });
    }

    if (user.isTwoFaEnabled) {
      try {
        const token = Math.floor(100000 + Math.random() * 900000);
        auth.twoFaSecret = token;
        const expiryDate = Date.now() + 10 * 60 * 1000;
        const dateObj = new Date(expiryDate);
        auth.isTwoFaVerifiedExpiration = dateObj.getTime();
        await user.save();
        await auth.save();
        logger.info("2FA token generated for email: ", { email });
        await axios.post(
          "https://api.brevo.com/v3/smtp/email",
          {
            to: [{ email: user.email, name: user.name || "User" }],
            templateId: 3,
            params: {
              code: token,
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
        logger.info("2FA email sent to: ", { email });
      } catch (error) {
        logger.error(
          "Error sending 2FA email to: ",
          { email },
          " - ",
          error.message
        );
        return next(error);
      }

      return res
        .status(200)
        .json({ message: "2FA enabled", isTwoFaEnabled: user.isTwoFaEnabled });
    }

    const refreshToken = RefreshToken(user);
    const accessToken = AccessToken(user);
    //eslint-disable-next-line
    const { auth: authData, ...rest } = user.dataValues;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    logger.info("Refresh token generated and cookie set for login : ", {
      refreshToken,
    });
    logger.debug(
      "Refresh token cookie details - httpOnly: true, sameSite: strict, maxAge: 7 days"
    );
    logger.info("Login successful for email: ", { email });
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
