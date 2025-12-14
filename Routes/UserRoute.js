import exppress from "express";
import { VerifyToken } from "../utils/VerifyToken.js";
import { userProfile, updateProfile } from "../Controllers/UserController.js";

const route = exppress.Router();

route.get("/userProfile", VerifyToken, userProfile);
route.post("/updateProfile", VerifyToken, updateProfile);

export default route;
