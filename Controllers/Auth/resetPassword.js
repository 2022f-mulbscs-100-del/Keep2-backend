import bcrypt from "bcrypt";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { checkExpiration } from "../../utils/CheckExpiration.js";
import { logger } from "../../utils/Logger.js";
import User from "../../Modals/UserModal.js";
import Auth from "../../Modals/AuthModal.js";
import { ResetPasswordValidation } from "../../validation/authValidation.js";

export const resetPassword = async (req, res, next) => {
  //------ validate request body
  const validatedData = ResetPasswordValidation.parse(req.body);

  const { email, password: preHashPassword, code } = validatedData;

  const { resetThroughToken, currentPassword } = req.body;

  logger.info("resetPassword called with: ", { email, resetThroughToken });

  //------ check if token is required
  if (resetThroughToken) {
    //------ validate code presence

    if (!code) {
      logger.warn("resetPassword failed: token is missing for email: ", email);
      return next(ErrorHandler(400, "token is missing"));
    }
  }

  try {
    // ------ find user by email
    const checkUser = await User.findOne({
      where: { email },
      include: [{ model: Auth, as: "auth" }],
    });

    if (!checkUser) {
      logger.warn("resetPassword failed: User not found for email: ", email);
      return next(ErrorHandler(400, "User not found"));
    }

    // ------ get auth record
    const auth = checkUser.auth;

    if (resetThroughToken) {
      if (auth.resetPasswordToken !== code) {
        logger.warn("resetPassword failed: Invalid token for email: ", email);
        return next(ErrorHandler(400, "Invalid token"));
      }
      if (!checkExpiration(auth.resetPasswordExpiry)) {
        logger.warn("resetPassword token expired for email: ", email);
        return next(ErrorHandler(400, "Token expired"));
      }
    }

    // ------ if not reset through token, validate current password
    if (!resetThroughToken) {
      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        auth.password
      );

      // ------ if current password is incorrect, return error
      if (!isPasswordCorrect) {
        logger.warn(
          "resetPassword failed: Invalid current password for email: ",
          email
        );

        return next(ErrorHandler(400, "Invalid Current Password"));
      }
      logger.info("resetPassword current password verified for email: ", email);
    }
    // ------ hash new password and update
    const hashPassword = await bcrypt.hash(preHashPassword, 10);
    await Auth.update(
      { password: hashPassword },
      { where: { userId: auth.userId } }
    );

    logger.info("resetPassword successfully updated for email: ", email);
    res.status(200).json("Password Updated");
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
