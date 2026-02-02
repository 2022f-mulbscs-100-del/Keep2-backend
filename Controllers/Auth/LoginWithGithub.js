import passport from "passport";
import { logger } from "../../utils/Logger.js";

/**
 * Login With GitHub Controller
 * Initiates GitHub OAuth authentication
 */
export const LoginWithGithub = async (req, res, next) => {
  try {
    logger.info("GitHub login initiated");

    passport.authenticate("github", {
      scope: ["user:email"],
      prompt: "consent",
      accessType: "offline",
    })(req, res, next);
  } catch (error) {
    logger.error("GitHub login error", { message: error.message });
    next(error);
  }
};
