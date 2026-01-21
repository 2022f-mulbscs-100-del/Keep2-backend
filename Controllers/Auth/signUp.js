import User from "../../Modals/UserModal.js";
import bcrypt from "bcrypt";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { RefreshToken } from "../../utils/GenerateRefreshToken.js";
import { AccessToken } from "../../utils/GenerateAcessToken.js";
import { checkExpiration } from "../../utils/CheckExpiration.js";
import axios from "axios";
import { logger } from "../../utils/Logger.js";
import Auth from "../../Modals/AuthModal.js";
import Stripe from "stripe";
import { SignUpValidation } from "../../validation/authValidation.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const SignUp = async (req, res, next) => {
  const validateData = SignUpValidation.parse(req.body);
  const { name, email, password: preHashPassword, code } = validateData;

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
      });
      const auth = await user.createAuth({ password: hashPassword });

      const token = Math.floor(100000 + Math.random() * 900000);
      auth.signUpConfirmationToken = token;
      const dateObj = new Date(Date.now() + 15 * 60 * 1000);
      auth.signUpConfirmationTokenExpiry = dateObj.getTime();

      await auth.save();

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

      return res.status(201).json({ message: "verify email" });
    } else {
      const user = await User.findOne({
        where: { email },
      });
      if (!user) {
        return next(ErrorHandler(404, "User not found"));
      }
      const auth = await Auth.findOne({
        where: { userId: user.id },
      });
      if (auth.signUpConfirmationToken === code) {
        if (!checkExpiration(auth.signUpConfirmationTokenExpiry)) {
          logger.warn("Signup token expired for email: ", { email });
          return next(ErrorHandler(400, "Token expired"));
        }
        auth.signUpConfirmationToken = null;
        auth.signUpConfirmationTokenExpiry = null;
        user.signUpConfirmation = true;
        await auth.save();

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
          return next(error);
        }
        const refreshToken = RefreshToken(user);
        const accessToken = AccessToken(user);
        logger.info("Refresh token generated: ", { refreshToken });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });
        logger.info("Refresh token cookie set for signup confirmation : ", {
          refreshToken,
        });
        const { rest } = user.dataValues;

        res.status(201).json({ rest, accessToken });
      } else {
        logger.warn("Signup failed for email: ", { email }, " - Invalid code");
        return next(ErrorHandler(400, "Invalid code"));
      }
    }
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
    return next(error);
  }
};
