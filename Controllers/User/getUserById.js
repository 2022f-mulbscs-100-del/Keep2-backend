import redisClient from "../../config/redisClient.js";
import User from "../../Modals/UserModal.js";

export const getUserById = async (req, res, next) => {
  const { email } = req.params;
  try {
    const cacheKey = `userProfile:${email}`;
    const cachedUser = await redisClient.get(cacheKey);
    if (cachedUser) {
      return res.status(200).json(JSON.parse(cachedUser));
    }

    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userData = {
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
    };
    await redisClient.set(cacheKey, JSON.stringify(userData), {
      EX: 3600,
    });
    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
};
