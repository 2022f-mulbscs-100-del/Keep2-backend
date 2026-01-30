import User from "../../Modals/UserModal.js";
import Auth from "../../Modals/AuthModal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { RefreshToken } from "../../utils/GenerateRefreshToken.js";
import { AccessToken } from "../../utils/GenerateAcessToken.js";
import { checkExpiration } from "../../utils/CheckExpiration.js";
import { logger } from "../../utils/Logger.js";
import Stripe from "stripe";
import { CodeCheck } from "../../validation/authValidation.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const signUpConfirmation = async (req, res, next) => {
  //------ validate request body
  const { email, code } = CodeCheck.parse(req.body);

  logger.info("signUpConfirmation called with: ", { email });
  try {
    // ------ find user by email
    const user = await User.findOne({
      where: { email },
      include: [{ model: Auth, as: "auth" }],
    });

    if (!user) {
      logger.warn(
        "signUpConfirmation failed: User not found for email: ",
        email
      );
      return next(ErrorHandler(404, "User not found"));
    }

    // ------ get auth record
    const auth = user.auth;

    // ------ verify code
    if (auth.signUpConfirmationToken === code) {
      logger.info("signUpConfirmation code verified for email: ", email);

      if (!checkExpiration(auth.signUpConfirmationTokenExpiry)) {
        logger.warn("signUpConfirmation token expired for email: ", email);
        return next(ErrorHandler(400, "Token expired"));
      }

      auth.signUpConfirmationToken = null;
      auth.signUpConfirmationTokenExpiry = null;
      auth.signUpConfirmation = true;

      // ------ update user and auth records
      await user.save();
      await auth.save();

      // ------ create Stripe customer if not exists

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
          return next(error);
        }
      }

      // ------ generate tokens
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
        sameSite: process.env.NODE_ENV === "development" ? "lax" : "none", // CSRF protection
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
