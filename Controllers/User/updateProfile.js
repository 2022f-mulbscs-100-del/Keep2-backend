import { UserService } from "../../Services/User/index.js";
import { logger } from "../../utils/Logger.js";
import { HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Update Profile Controller
 * Updates user profile information
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { profileData } = req.body;

    const {
      name,
      profileImage,
      isTwoFaEnabled,
      autoLogoutEnabled,
      autoLogoutTime,
      MfaEnabled,
      layout,
    } = profileData || {};

    logger.info("Update profile request", { userId, profileData });

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (isTwoFaEnabled !== undefined)
      updateData.isTwoFaEnabled = isTwoFaEnabled;
    if (layout !== undefined) updateData.layout = layout;
    if (autoLogoutEnabled !== undefined)
      updateData.autoLogoutEnabled = autoLogoutEnabled;
    if (autoLogoutTime !== undefined)
      updateData.autoLogoutTime = autoLogoutTime;
    if (MfaEnabled !== undefined) {
      updateData.MfaEnabled = MfaEnabled;
      updateData.MfaSeceret = null;
    }

    const updatedUser = await UserService.updateUserProfile(userId, updateData);

    logger.info("User profile updated successfully", { userId });

    res.status(HTTP_STATUS.OK).json(updatedUser);
  } catch (error) {
    logger.error("Update profile error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};
