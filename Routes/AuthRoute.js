import express from "express";
import {
  resetPassword,
  CodeCheck,
  Login,
  Logout,
  SignUp,
  forgetPasswordToken,
} from "../Controllers/AuthController.js";

const route = express.Router();

route.post("/login", Login);
route.post("/signup", SignUp);
route.get("/logout", Logout);
route.post("/code-check", CodeCheck);
route.post("/reset-password", resetPassword);
route.post("/forget-password-token", forgetPasswordToken);

export default route;
