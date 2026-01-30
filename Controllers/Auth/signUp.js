import User from "../../Modals/UserModal.js";
import bcrypt from "bcrypt";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import axios from "axios";
import { logger } from "../../utils/Logger.js";
import { SignUpValidation } from "../../validation/authValidation.js";
import Subscription from "../../Modals/SubscriptionModal.js";

export const SignUp = async (req, res, next) => {
  //------ validate request body
  const validateData = SignUpValidation.parse(req.body);

  const { name, email, password: preHashPassword } = validateData;

  logger.info("params from signup controller : ", { name, email });

  try {
    // ------ check if user already exists
    const checkUser = await User.findOne({
      where: { email },
    });
    if (checkUser) {
      logger.warn("Signup failed", { email, reason: "User already exist" });
      return next(ErrorHandler(400, "User already exist"));
    }

    // ------ create new user
    const hashPassword = await bcrypt.hash(preHashPassword, 10);

    const user = await User.create({
      name,
      email,
    });
    // ------ create auth record and subscription
    const auth = await user.createAuth({ password: hashPassword });

    await Subscription.create({ userId: user.id });

    // ------ generate signup confirmation token and send email
    const token = Math.floor(100000 + Math.random() * 900000);
    auth.signUpConfirmationToken = token;
    const dateObj = new Date(Date.now() + 15 * 60 * 1000);
    auth.signUpConfirmationTokenExpiry = dateObj.getTime();

    await auth.save();

    logger.info("signup token generated for email: ", { email });

    // ------ send signup confirmation email
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
