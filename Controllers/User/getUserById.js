import User from "../../Modals/UserModal.js";

export const getUserById = async (req, res, next) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userData = {
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
    };
    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
};
