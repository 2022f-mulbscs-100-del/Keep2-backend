import exppress from "express";
import { VerifyToken } from "../utils/VerifyToken.js";
import {
  userProfile,
  updateProfile,
  DeleteProfile,
} from "../Controllers/UserController.js";

const route = exppress.Router();

route.get("/userProfile", VerifyToken, userProfile);
route.patch("/updateProfile", VerifyToken, updateProfile);
route.delete("/deleteProfile", VerifyToken, DeleteProfile);
// route.post("/auto-logout",VerifyToken,AutoLogout);

export default route;
