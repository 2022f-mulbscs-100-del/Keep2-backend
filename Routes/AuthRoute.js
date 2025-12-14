import express from "express";
import { Login, Logout, SignUp } from "../Controllers/AuthController.js";

const route = express.Router();

route.post("/login", Login);
route.post("/signup", SignUp);
route.get("/logout", Logout);

export default route;
