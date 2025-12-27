import User from "../Modals/UserModal.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import bcrypt from "bcrypt";

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
  const { name, profileImage, isTwoFaEnabled } = profileData;
  console.log("gettin data", name, profileImage);
  const userData = req.user;
  console.log(userData);

  try {
    const user = await User.findByPk(userData.id);
    if (!user) {
      return next(ErrorHandler(404, "not found"));
    }
    await user.update({ name, profileImage });
    if (isTwoFaEnabled !== undefined) {
      user.isTwoFaEnabled = isTwoFaEnabled;
    }
    await user.save();
    //eslint-disable-next-line
    const { password, ...rest } = user.dataValues;
    console.log("updated data", rest);
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const DeleteProfile = async (req, res, next) => {
  const userData = req.user;
  const { password } = req.body;
  console.log(userData);
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
