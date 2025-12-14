import User from "../Modals/UserModal.js";
import bcrypt from "bcrypt";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { RefreshToken } from "../utils/GenerateRefreshToken.js";
import { AccessToken } from "../utils/GenerateAcessToken.js";

export const SignUp = async (req, res, next) => {
  const { name, email, password: preHashPassword } = req.body;

  try {
    const checkUser = await User.findOne({
      where: { email },
    });
    if (checkUser) {
      next(ErrorHandler(400, "User already exist"));
    }
    const hashPassword = await bcrypt.hash(preHashPassword, 10);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
    });

    const refreshToken = RefreshToken(user);
    const accessToken = AccessToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    //eslint-disable-next-line
    const { password, ...rest } = user.dataValues;

    res.status(201).json({ rest, accessToken });
  } catch (error) {
    next(error);
  }
};

export const Login = async (req, res, next) => {
  const { email, password: pass } = req.body;
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      next(ErrorHandler(400, "User not found"));
    }
    const refreshToken = RefreshToken(user);
    const accessToken = AccessToken(user);

    const isPasswordCorrect = await bcrypt.compare(
      pass,
      user.dataValues.password
    );

    if (!isPasswordCorrect) {
      next(ErrorHandler(400, "Invalid Password"));
    }
    //eslint-disable-next-line
    const { password, ...rest } = user.dataValues;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      rest,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const forgetPassword = async (req, res, next) => {
  const { email, password: preHashPassword } = req.body;
  try {
    const checkUser = await User.findOne({ where: { email } });
    if (!checkUser) {
      next(ErrorHandler(400, "User not found"));
    }
    const hashPassword = bcrypt.hash(preHashPassword, 10);
    await User.update({ password: hashPassword }, { where: { email } });
    res.status(200).json("Password Updated");
  } catch (error) {
    next(error);
  }
};

export const Logout = (req, res, next) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json("Logged out successfully");
  } catch (error) {
    next(error);
  }
};
