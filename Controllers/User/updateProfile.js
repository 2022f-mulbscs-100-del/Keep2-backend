import User from "../../Modals/UserModal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";

export const updateProfile = async (req, res, next) => {
  logger.info("Update profile called in UserController");

  const { profileData } = req.body;

  const {
    name,
    profileImage,
    isTwoFaEnabled,
    autoLogoutEnabled,
    autoLogoutTime,
    MfaEnabled,
  } = profileData || {};
  logger.info("params from request body:", { profileData: profileData });

  const userData = req.user;

  logger.info("User data from token:", { userData: userData });

  try {
    const user = await User.findByPk(userData.id);
    if (!user) {
      logger.error("user not found", { userId: userData.id });
      return next(ErrorHandler(404, "not found"));
    }
    if (name || profileImage) {
      if (name !== undefined) {
        user.name = name;
        logger.info("Name updated", { name: name });
      }
      if (profileImage !== undefined) {
        user.profileImage = profileImage;
        logger.info("Profile image updated", { profileImage: profileImage });
      }
    }
    if (isTwoFaEnabled !== undefined) {
      user.isTwoFaEnabled = isTwoFaEnabled;
      logger.info("Two FA status updated", { isTwoFaEnabled: isTwoFaEnabled });
    }
    if (autoLogoutEnabled !== undefined) {
      user.autoLogoutEnabled = autoLogoutEnabled;
      logger.info("Auto logout status updated", {
        autoLogoutEnabled: autoLogoutEnabled,
      });
    }
    if (autoLogoutTime !== undefined) {
      user.autoLogoutTime = autoLogoutTime;
      logger.info("Auto logout time updated", {
        autoLogoutTime: autoLogoutTime,
      });
    }
    if (MfaEnabled !== undefined) {
      user.MfaEnabled = MfaEnabled;
      user.MfaSeceret = null;
      logger.info("MFA status updated", { MfaEnabled: MfaEnabled });
    }
    await user.save();
    //eslint-disable-next-line
    const { password, ...rest } = user.dataValues;
    res.status(200).json(rest);
    logger.info("User profile updated successfully", { rest: rest });
  } catch (error) {
    logger.error("Error updating user profile", {
      userId: userData.id,
      error: error.message,
    });
    next(error);
  }
};
