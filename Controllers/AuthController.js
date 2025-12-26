import User from "../Modals/UserModal.js";
import bcrypt from "bcrypt";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { RefreshToken } from "../utils/GenerateRefreshToken.js";
import { AccessToken } from "../utils/GenerateAcessToken.js";
import { checkExpiration } from "../utils/CheckExpiration.js";
import axios from "axios";

export const SignUp = async (req, res, next) => {
  const { name, email, password: preHashPassword } = req.body;

  try {
    const checkUser = await User.findOne({
      where: { email },
    });
    if (checkUser) {
      return next(ErrorHandler(400, "User already exist"));
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
      path: "/",
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
      return next(ErrorHandler(400, "User not found"));
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
      path: "/",
    });
    res.status(200).json({
      rest,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const {
    email,
    password: preHashPassword,
    code,
    resetThroughToken,
    currentPassword,
  } = req.body;

  if (resetThroughToken) {
    if (!code) {
      return next(ErrorHandler(400, "token is missing"));
    }
  }

  try {
    const checkUser = await User.findOne({ where: { email } });
    if (!checkUser) {
      next(ErrorHandler(400, "User not found"));
    }
    if (resetThroughToken) {
      if (checkUser.resetPasswordToken !== code) {
        return next(ErrorHandler(400, "Invalid token"));
      }
      if (!checkExpiration(checkUser.resetPasswordExpiry)) {
        return next(ErrorHandler(400, "Token expired"));
      }
    }

    if (!resetThroughToken) {
      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        checkUser.dataValues.password
      );

      if (!isPasswordCorrect) {
        return next(ErrorHandler(400, "Invalid Current Password"));
      }
    }
    const hashPassword = await bcrypt.hash(preHashPassword, 10);
    await User.update({ password: hashPassword }, { where: { email } });
    res.status(200).json("Password Updated");
  } catch (error) {
    next(error);
  }
};

export const CodeCheck = async (req, res, next) => {
  const { code, email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return ErrorHandler(404, "User not found");
    }

    console.log("user", user);
    console.log(user.resetPasswordToken, code);

    if (user.resetPasswordToken === code) {
      if (checkExpiration(user.resetPasswordExpiry)) {
        res.status(200).json("Token verified sucessfully");
      } else {
        res.status(400).json("Token expired");
      }
    } else {
      res.status(400).json("Invalid token");
    }
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
      path: "/",
    });
    res.status(200).json("Logged out successfully");
  } catch (error) {
    next(error);
  }
};

export const forgetPasswordToken = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(ErrorHandler(404, "User not exist"));
    }
    const uniqueToken = Math.floor(100000 + Math.random() * 900000);
    const expiryData = Date.now() + 15 * 60 * 1000;
    const dateObj = new Date(expiryData);
    user.resetPasswordToken = uniqueToken;
    user.resetPasswordExpiry = dateObj.getTime();
    await user.save();

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        to: [{ email: user.email, name: user.name }],
        templateId: 2,
        params: {
          code: uniqueToken,
        },
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res
      .status(200)
      .json({ uniqueToken, message: "token generated sucessfully" });
  } catch (error) {
    next(error);
  }
};
