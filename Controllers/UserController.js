import User from "../Modals/UserModal.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";

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
  const { name, profileImage } = profileData;
  console.log("gettin data", name, profileImage);
  const userData = req.user;
  console.log(userData);

  try {
    const user = await User.findByPk(userData.id);
    if (!user) {
      return next(ErrorHandler(404, "not found"));
    }
    await user.update({ name, profileImage });
    await user.save();
    //eslint-disable-next-line
    const { password, ...rest } = user.dataValues;
    console.log("updated data", rest);
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
