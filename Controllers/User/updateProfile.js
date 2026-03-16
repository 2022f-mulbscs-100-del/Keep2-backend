// import redisClient from "../../config/redisClient.js";
import User from "../../Modals/UserModal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";

export const updateProfile = async (req, res, next) => {
  logger.info("Update profile called in UserController");

  const profileData = req.body.profileData ?? req.body;

  const {
    name,
    profileImage,
    isTwoFaEnabled,
    autoLogoutEnabled,
    autoLogoutTime,
    MfaEnabled,
    layout,
  } = profileData || {};
  logger.info("params from request body:", { profileData });

  const userData = req.user;

  logger.info("User data from token:", { userData: userData });

  // const cahedKey = `userProfile:${userData.id}`;
  try {
    const user = await User.findByPk(userData.id);
    if (!user) {
      logger.error("user not found", { userId: userData.id });
      return next(ErrorHandler(404, "not found"));
    }
    if (name !== undefined) {
      user.name = name;
      logger.info("Name updated", { name: name });
    }
    if (profileImage !== undefined) {
      user.profileImage = profileImage;
      logger.info("Profile image updated", { profileImage: profileImage });
    }
    if (isTwoFaEnabled !== undefined) {
      user.isTwoFaEnabled = isTwoFaEnabled;
      logger.info("Two FA status updated", { isTwoFaEnabled: isTwoFaEnabled });
    }
    if (layout !== undefined) {
      user.layout = layout;
      logger.info("Layout updated", { layout: layout });
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
    // await redisClient.del(cahedKey);
    // await redisClient.del(`userProfile:${userData.email}`);
    //eslint-disable-next-line
    const { password, ...rest } = user.dataValues;
    // await redisClient.set(cahedKey, JSON.stringify(rest));

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
