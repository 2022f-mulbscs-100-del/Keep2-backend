import User from "../Modals/UserModal.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import bcrypt from "bcrypt";
// import { RefreshToken } from "../utils/GenerateRefreshToken.js";
import { logger } from "../utils/Logger.js";

export const userProfile = async (req, res, next) => {
  const userData = req.user;
  const { id } = userData;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      next(ErrorHandler(404, "user not exists"));
    }

    //eslint-disable-next-line
    const { password, ...rest } = user.dataValues;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  const { profileData } = req.body;
  const {
    name,
    profileImage,
    isTwoFaEnabled,
    autoLogoutEnabled,
    autoLogoutTime,
    MfaEnabled,
  } = profileData;
  logger.info("getting data", name, profileImage);
  const userData = req.user;
  logger.info(userData);

  try {
    const user = await User.findByPk(userData.id);
    if (!user) {
      return next(ErrorHandler(404, "not found"));
    }
    await user.update({ name, profileImage });
    if (isTwoFaEnabled !== undefined) {
      user.isTwoFaEnabled = isTwoFaEnabled;
    }
    if (autoLogoutEnabled !== undefined) {
      user.autoLogoutEnabled = autoLogoutEnabled;
    }
    if (autoLogoutTime !== undefined) {
      user.autoLogoutTime = autoLogoutTime;
    }
    if (MfaEnabled !== undefined) {
      user.MfaEnabled = MfaEnabled;
      user.MfaSeceret = null;
    }
    await user.save();
    //eslint-disable-next-line
    const { password, ...rest } = user.dataValues;
    logger.info("updated data", rest);
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const DeleteProfile = async (req, res, next) => {
  const userData = req.user;
  const { password } = req.body;
  logger.info(userData);
  try {
    const user = await User.findByPk(userData.id);
    if (!user) {
      return next(ErrorHandler(404, "user not found"));
    }

    if (!password) {
      return next(ErrorHandler(400, "Password is required"));
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.dataValues.password
    );

    if (!isPasswordCorrect) {
      return next(ErrorHandler(400, "Invalid Password"));
    }

    await User.destroy({ where: { id: userData.id } });
    res.status(200).json({ message: "User profile deleted successfully" });
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
