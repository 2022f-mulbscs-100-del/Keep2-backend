import User from "../Modals/UserModal.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import bcrypt from "bcrypt";
import { logger } from "../utils/Logger.js";
import Stripe from "stripe";

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

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
    phoneNumber,
    secondaryEmail,
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
    if (phoneNumber !== undefined) {
      user.phoneNumber = phoneNumber;
      logger.info("Phone number updated", { phoneNumber: phoneNumber });
    }
    if (secondaryEmail !== undefined) {
      user.secondaryEmail = secondaryEmail;
      logger.info("Secondary email updated", {
        secondaryEmail: secondaryEmail,
      });
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

export const DeleteProfile = async (req, res, next) => {
  logger.info("Delete profile called in UserController");
  const userData = req.user;
  logger.info("User data from token:", { userData: userData });
  const { password } = req.body;
  logger.info("params from request body:", { password: "****" });
  logger.info(userData);
  try {
    const user = await User.findByPk(userData.id);
    if (!user) {
      logger.error("user not found", { userId: userData.id });
      return next(ErrorHandler(404, "user not found"));
    }

    if (!password) {
      logger.error("Password is required to delete profile", {
        userId: userData.id,
      });
      return next(ErrorHandler(400, "Password is required"));
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.dataValues.password
    );

    if (!isPasswordCorrect) {
      logger.error("Invalid password provided for profile deletion", {
        userId: userData.id,
      });
      return next(ErrorHandler(400, "Invalid Password"));
    }

    logger.info("Deleting user profile from Stripe and database", {
      userId: userData.id,
      stripeCustomerId: user.stripeCustomerId,
    });
    await stripe.customers.del(user.stripeCustomerId);
    await User.destroy({ where: { id: userData.id } });
    res.status(200).json({ message: "User profile deleted successfully" });
    logger.info("User profile deleted successfully", { userId: userData.id });
  } catch (error) {
    next(error);
  }
};

// export const AutoLogout = async (req, res, next) => {
//   const { autoLogoutTime } = req.body;
//   const userData = req.user;
//   logger.info("params from autologout controller : " , {autoLogoutTime, userData});
//   try {

//     const user = await User.findByPk(userData.id);
//     if (!user) {
//       logger.error("AutoLogout: user not found", { userId: userData.id });
//       return next(ErrorHandler(404, "user not found"));
//     }
//     if(!autoLogoutTime){
//       logger.error("AutoLogout: autoLogoutTime is required", { userId: userData.id });
//       return next(ErrorHandler(400, "Auto logout time is required"));
//     }
//     if (autoLogoutTime !== undefined) {
//       user.autoLogoutTime = autoLogoutTime;
//     }
//     await user.save();
//     const refreshToken = RefreshToken(user, autoLogoutTime);
//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: autoLogoutTime * 60 * 1000,
//       path: "/",
//     });
//     res.status(200).json({ message: "Auto logout time updated successfully" });
//   } catch (error) {
//     logger.error("AutoLogout: error updating auto logout time", { userId: userData.id, error: error.message });
//     next(error);
//   }
// };

// export const updateProfile = async (req, res, next) => {
//   logger.info("Update profile called", { userId: req.user.id });

//   const { profileData } = req.body;
//   const {
//     name,
//     profileImage,
//     isTwoFaEnabled,
//     autoLogoutEnabled,
//     autoLogoutTime,
//     MfaEnabled,
//     phoneNumber,
//     secondaryEmail,
//   } = profileData || {};

//   try {
//     const user = await User.findByPk(req.user.id);

//     if (!user) {
//       logger.error("User not found", { userId: req.user.id });
//       return next(ErrorHandler(404, "User not found"));
//     }

//     // Use transaction for atomic updates
//     await sequelize.transaction(async (t) => {
//       // Define allowed fields and their values
//       const updates = {
//         name,
//         profileImage,
//         isTwoFaEnabled,
//         autoLogoutEnabled,
//         autoLogoutTime,
//         MfaEnabled,
//         phoneNumber,
//         secondaryEmail,
//       };

//       // Filter out undefined values and apply updates
//       Object.keys(updates).forEach((key) => {
//         if (updates[key] !== undefined) {
//           user[key] = updates[key];
//         }
//       });

//       // Special handling for MFA
//       if (MfaEnabled !== undefined && !MfaEnabled) {
//         user.MfaSeceret = null; // Fix typo: should be MfaSecret
//       }

//       await user.save({ transaction: t });
//     });

//     // Return updated user without password
//     const { password, ...userProfile } = user.dataValues;

//     logger.info("Profile updated successfully", {
//       userId: req.user.id,
//       updatedFields: Object.keys(profileData || {})
//     });

//     res.status(200).json({
//       success: true,
//       data: userProfile
//     });

//   } catch (error) {
//     logger.error("Error updating profile", {
//       userId: req.user.id,
//       error: error.message,
//       stack: error.stack
//     });
//     next(error);
//   }
// };
