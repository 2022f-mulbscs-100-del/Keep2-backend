import User from "../Modals/UserModal.js";
import bcrypt from "bcrypt";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { RefreshToken } from "../utils/GenerateRefreshToken.js";
import { AccessToken } from "../utils/GenerateAcessToken.js";
import { checkExpiration } from "../utils/CheckExpiration.js";
import axios from "axios";
import { logger } from "../utils/Logger.js";
import Stripe from "stripe";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const SignUp = async (req, res, next) => {
  const { name, email, password: preHashPassword, code } = req.body;

  logger.info("params from signup controller : ", { name, email });
  try {
    if (!code) {
      const checkUser = await User.findOne({
        where: { email },
      });
      if (checkUser) {
        logger.warn("Signup failed", { email, reason: "User already exist" });
        return next(ErrorHandler(400, "User already exist"));
      }
      const hashPassword = await bcrypt.hash(preHashPassword, 10);

      const user = await User.create({
        name,
        email,
        password: hashPassword,
      });

      const token = Math.floor(100000 + Math.random() * 900000);
      user.signUpConfirmationToken = token;
      const dateObj = new Date(Date.now() + 15 * 60 * 1000);
      user.signUpConfirmationTokenExpiry = dateObj.getTime();

      await user.save();

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
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      logger.info("signup code confirmation email sent to: ", { email });

      return res.status(201).json({ message: "verify email" });
    } else {
      const user = await User.findOne({
        where: { email },
      });
      if (user.signUpConfirmationToken === code) {
        if (!checkExpiration(user.signUpConfirmationTokenExpiry)) {
          logger.warn("Signup token expired for email: ", { email });
          return next(ErrorHandler(400, "Token expired"));
        }
        user.signUpConfirmationToken = null;
        user.signUpConfirmationTokenExpiry = null;
        user.signUpConfirmation = true;
        await user.save();

        try {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
          });

          user.stripeCustomerId = customer.id;
          await user.save();
        } catch (error) {
          logger.error(
            "Error creating Stripe customer for email: ",
            { email },
            " - ",
            error.message
          );
          next(error);
        }
        const refreshToken = RefreshToken(user);
        const accessToken = AccessToken(user);
        logger.info("Refresh token generated: ", { refreshToken });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });
        logger.info("Refresh token cookie set for signup confirmation : ", {
          refreshToken,
        });
        //eslint-disable-next-line
        const { password, ...rest } = user.dataValues;

        res.status(201).json({ rest, accessToken });
      } else {
        logger.warn("Signup failed for email: ", { email }, " - Invalid code");
        return next(ErrorHandler(400, "Invalid code"));
      }
    }
  } catch (error) {
    logger.error("Signup error for email: ", { email }, " - ", error.message);
    next(error);
  }
};

export const Login = async (req, res, next) => {
  const { email, password: pass } = req.body;
  logger.info("params from login controller : ", { email });
  logger.info("login attempt for email: ", { email });
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      logger.warn("Login failed", { email, reason: "User not found" });
      return next(ErrorHandler(400, "User not found"));
    }

    const isPasswordCorrect = await bcrypt.compare(
      pass,
      user.dataValues.password
    );

    if (!isPasswordCorrect) {
      logger.warn("Login failed for email: ", { email }, " - Invalid Password");
      return next(ErrorHandler(400, "Invalid Password"));
    }
    if (user.signUpConfirmation === false) {
      const token = Math.floor(100000 + Math.random() * 900000);
      user.signUpConfirmationToken = token;
      const dateObj = new Date(Date.now() + 15 * 60 * 1000);
      user.signUpConfirmationTokenExpiry = dateObj.getTime();

      await user.save();

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
        user.twoFaSecret = token;
        const expiryDate = Date.now() + 10 * 60 * 1000;
        const dateObj = new Date(expiryDate);
        user.isTwoFaVerifiedExpiration = dateObj.getTime();
        await user.save();
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
            headers: {
              "api-key": process.env.BREVO_API_KEY,
              "Content-Type": "application/json",
            },
          }
        );
        logger.info("2FA email sent to: ", { email });
      } catch (error) {
        next(error);
        logger.error(
          "Error sending 2FA email to: ",
          { email },
          " - ",
          error.message
        );
      }

      return res
        .status(200)
        .json({ message: "2FA enabled", isTwoFaEnabled: user.isTwoFaEnabled });
    }

    const refreshToken = RefreshToken(user);
    const accessToken = AccessToken(user);
    //eslint-disable-next-line
    const { password, ...rest } = user.dataValues;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "none", // CSRF protection
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
    logger.error("Login error for email: ", { email }, " - ", {
      message: error.message,
    });
    next(error);
  }
};

export const signUpConfirmation = async (req, res, next) => {
  const { email, code } = req.body;
  logger.info("signUpConfirmation called with: ", { email });
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn(
        "signUpConfirmation failed: User not found for email: ",
        email
      );
      return next(ErrorHandler(404, "User not found"));
    }

    if (user.signUpConfirmationToken === code) {
      logger.info("signUpConfirmation code verified for email: ", email);
      if (!checkExpiration(user.signUpConfirmationTokenExpiry)) {
        logger.warn("signUpConfirmation token expired for email: ", email);
        return next(ErrorHandler(400, "Token expired"));
      }
      user.signUpConfirmationToken = null;
      user.signUpConfirmationTokenExpiry = null;
      user.signUpConfirmation = true;
      await user.save();

      if (!user.stripeCustomerId) {
        try {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
          });

          user.stripeCustomerId = customer.id;
          await user.save();
        } catch (error) {
          logger.error(
            "Error creating Stripe customer for email: ",
            email,
            " - ",
            error.message
          );
          next(error);
        }
      }
      const refreshToken = RefreshToken(user);
      const accessToken = AccessToken(user);
      //eslint-disable-next-line
      const { password, ...rest } = user.dataValues;
      logger.info(
        "Refresh token generated for signUpConfirmation for email: ",
        email
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "none", // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });
      logger.info(
        "Refresh token cookie set for signUpConfirmation for email: ",
        refreshToken
      );
      res.status(200).json({
        rest,
        accessToken,
      });
    } else {
      logger.warn("signUpConfirmation failed: Invalid code for email: ", email);
      return next(ErrorHandler(400, "Invalid code"));
    }
  } catch (error) {
    logger.error(
      "signUpConfirmation error for email: ",
      email,
      " - ",
      error.message
    );
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const {
    email,
    password: preHashPassword,
    code,
    resetThroughToken,
    currentPassword,
  } = req.body;
  logger.info("resetPassword called with: ", { email, resetThroughToken });
  if (resetThroughToken) {
    if (!code) {
      logger.warn("resetPassword failed: token is missing for email: ", email);
      return next(ErrorHandler(400, "token is missing"));
    }
  }

  try {
    const checkUser = await User.findOne({ where: { email } });
    if (!checkUser) {
      logger.warn("resetPassword failed: User not found for email: ", email);
      next(ErrorHandler(400, "User not found"));
    }
    if (resetThroughToken) {
      if (checkUser.resetPasswordToken !== code) {
        logger.warn("resetPassword failed: Invalid token for email: ", email);
        return next(ErrorHandler(400, "Invalid token"));
      }
      if (!checkExpiration(checkUser.resetPasswordExpiry)) {
        logger.warn("resetPassword token expired for email: ", email);
        return next(ErrorHandler(400, "Token expired"));
      }
    }

    if (!resetThroughToken) {
      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        checkUser.dataValues.password
      );

      if (!isPasswordCorrect) {
        logger.warn(
          "resetPassword failed: Invalid current password for email: ",
          email
        );
        return next(ErrorHandler(400, "Invalid Current Password"));
      }
      logger.info("resetPassword current password verified for email: ", email);
    }
    const hashPassword = await bcrypt.hash(preHashPassword, 10);
    await User.update({ password: hashPassword }, { where: { email } });
    logger.info("resetPassword successfully updated for email: ", email);
    res.status(200).json("Password Updated");
  } catch (error) {
    logger.error(
      "resetPassword error for email: ",
      email,
      " - ",
      error.message
    );
    next(error);
  }
};

export const CodeCheck = async (req, res, next) => {
  const { code, email } = req.body;
  logger.info("CodeCheck called with: ", { email });
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn("CodeCheck failed: User not found for email: ", email);
      return ErrorHandler(404, "User not found");
    }

    if (user.resetPasswordToken === code) {
      if (checkExpiration(user.resetPasswordExpiry)) {
        logger.info("CodeCheck token verified successfully for email: ", email);
        res.status(200).json("Token verified sucessfully");
      } else {
        logger.warn("CodeCheck token expired for email: ", email);
        res.status(400).json("Token expired");
      }
    } else {
      logger.warn("CodeCheck invalid token for email: ", email);
      res.status(400).json("Invalid token");
    }
  } catch (error) {
    logger.error("CodeCheck error for email: ", email, " - ", error.message);
    next(error);
  }
};

export const Logout = (req, res, next) => {
  logger.info("Logout called");
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    });
    logger.info("User logged out successfully");
    res.status(200).json("Logged out successfully");
  } catch (error) {
    logger.error("Logout error - ", error.message);
    next(error);
  }
};

export const forgetPasswordToken = async (req, res, next) => {
  const { email } = req.body;
  logger.info("forgetPasswordToken called with: ", { email });
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn(
        "forgetPasswordToken failed: User not found for email: ",
        email
      );
      return next(ErrorHandler(404, "User not exist"));
    }
    const uniqueToken = Math.floor(100000 + Math.random() * 900000);
    const expiryData = Date.now() + 15 * 60 * 1000;
    const dateObj = new Date(expiryData);
    user.resetPasswordToken = uniqueToken;
    user.resetPasswordExpiry = dateObj.getTime();
    await user.save();
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

export const TwoFaLogin = async (req, res, next) => {
  const { email, twoFaCode } = req.body;
  logger.info("TwoFaLogin called with: ", { email });
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      logger.warn("TwoFaLogin failed: User not found for email: ", email);
      return next(ErrorHandler(400, "User not found"));
    }
    if (user.twoFaSecret != twoFaCode) {
      logger.warn("TwoFaLogin failed: Invalid 2FA code for email: ", email);
      return next(ErrorHandler(400, "Invalid 2FA Code"));
    }
    logger.info("TwoFaLogin verified for email: ", email);

    user.twoFaSecret = null;
    user.isTwoFaVerifiedExpiration = null;
    await user.save();

    const refreshToken = RefreshToken(user);
    const accessToken = AccessToken(user);

    //eslint-disable-next-line
    const { password, ...rest } = user.dataValues;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "none", // CSRF protection
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
    logger.error("TwoFaLogin error for email: ", email, " - ", error.message);
    next(error);
  }
};

export const generateMFA = async (req, res, next) => {
  const { email } = req.body;
  logger.info("generateMFA called with:", { email });
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      logger.warn("generateMFA failed: User not found for email: ", email);
      return next(ErrorHandler(400, "User not found"));
    }

    const secert = speakeasy.generateSecret({
      length: 20,
      name: `Keeper ${email}`,
    });
    logger.info("MFA secret generated for email: ", email);

    const qrCode = await QRCode.toDataURL(secert.otpauth_url);

    user.MfaSeceret = secert.base32;
    user.MfaEnabled = false;
    await user.save();
    logger.info("MFA QR code generated and saved for email: ", email);

    res
      .status(200)
      .json({ qrCode, message: "MFA settings updated successfully" });
  } catch (error) {
    logger.error("generateMFA error for email: ", email, " - ", error.message);
    next(error);
  }
};

export const VerifyMFA = async (req, res, next) => {
  const { email, token } = req.body;
  logger.info("VerifyMFA called with: ", { email });
  const user = await User.findOne({ where: { email } });
  try {
    if (!user) {
      logger.warn("VerifyMFA failed: User not found for email: ", { email });
      return next(ErrorHandler(400, "User not found"));
    }

    const verified = speakeasy.totp.verify({
      secret: user.MfaSeceret,
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
    logger.info("MFA enabled successfully for email: ", { email });

    res.status(200).json({ message: "MFA verified and enabled successfully" });
  } catch (error) {
    logger.error("VerifyMFA error for email: ", { email }, " - ", {
      message: error.message,
    });
    await user.save();
    next(error);
  }
};

export const LoginVerifyMFA = async (req, res, next) => {
  const { email, token } = req.body;
  logger.info("LoginVerifyMFA called with: ", { email });
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      logger.warn("LoginVerifyMFA failed: User not found for email: ", {
        email,
      });
      return next(ErrorHandler(400, "User not found"));
    }

    const verified = speakeasy.totp.verify({
      secret: user.MfaSeceret,
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
    //eslint-disable-next-line
    const { password, ...rest } = user.dataValues;

    logger.info(
      "Refresh token generated and cookie set for LoginVerifyMFA : ",
      { refreshToken }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "none", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
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
