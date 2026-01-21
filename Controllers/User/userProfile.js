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
    const user = await User.findByPk(id);
    if (!user) {
      logger.error("user not exists", { userId: id });
      return next(ErrorHandler(404, "user not exists"));
    }

    //eslint-disable-next-line
    const { password, ...rest } = user.dataValues;
    res.status(200).json(rest);
    logger.info("User profile fetched successfully", { userProfile: rest });
  } catch (error) {
    logger.error("Error fetching user profile", {
      userId: id,
      error: error.message,
    });
    next(error);
  }
};
