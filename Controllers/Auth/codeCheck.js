import User from "../../Modals/UserModal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { checkExpiration } from "../../utils/CheckExpiration.js";
import { logger } from "../../utils/Logger.js";
import Auth from "../../Modals/AuthModal.js";

export const CodeCheck = async (req, res, next) => {
  const validateData = CodeCheck.parse(req.body);
  const { code, email } = validateData;
  logger.info("CodeCheck called with: ", { email });
  try {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Auth, as: "auth" }],
    });
    if (!user) {
      logger.warn("CodeCheck failed: User not found for email: ", email);
      return next(ErrorHandler(404, "User not found"));
    }
    const auth = user.auth;

    if (auth.resetPasswordToken === code) {
      if (checkExpiration(auth.resetPasswordExpiry)) {
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
