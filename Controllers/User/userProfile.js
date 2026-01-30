import Auth from "../../Modals/AuthModal.js";
import User from "../../Modals/UserModal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";

export const userProfile = async (req, res, next) => {
  logger.info("User profile called in UserController");

  const userData = req.user;
  logger.info("User data from token:", { userData: userData });

  const { id } = userData;
  logger.info("params from the user profile request", { id: id });

  try {
    let user;
    if (process.env.NODE_ENV === "development") {
      user = await User.findByPk(id, {
        include: [
          { model: Auth, as: "auth", attributes: { exclude: ["password"] } },
        ],
      });
    } else {
      user = await User.findByPk(id);
    }

    if (!user) {
      logger.error("user not exists", { userId: id });
      return next(ErrorHandler(404, "user not exists"));
    }

    res.status(200).json(user);
    logger.info("User profile fetched successfully", { userProfile: user });
  } catch (error) {
    logger.error("Error fetching user profile", {
      userId: id,
      error: error.message,
    });
    next(error);
  }
};
