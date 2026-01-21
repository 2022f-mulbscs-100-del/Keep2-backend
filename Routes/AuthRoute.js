import express from "express";
import {
  resetPassword,
  CodeCheck,
  Login,
  Logout,
  SignUp,
  forgetPasswordToken,
  TwoFaLogin,
  signUpConfirmation,
  generateMFA,
  VerifyMFA,
  LoginVerifyMFA,
} from "../Controllers/AuthController.js";
// import { VerifyToken } from "../utils/VerifyToken.js";

const route = express.Router();

route.post("/login", Login);
route.post("/signup", SignUp);
route.get("/logout", Logout);
route.post("/code-check", CodeCheck);
route.post("/reset-password", resetPassword);
route.post("/forget-password-token", forgetPasswordToken);
route.post("/2fa-login", TwoFaLogin);
route.post("/signUpConfirmation", signUpConfirmation);
route.post("/MFA-generate", generateMFA);
route.post("/verify-mfa", VerifyMFA);
route.post("/login-verify-mfa", LoginVerifyMFA);
export default route;
