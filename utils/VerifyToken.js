import jwt from "jsonwebtoken";
import { ErrorHandler } from "./ErrorHandler.js";

export const VerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(ErrorHandler(401, "Unauthorized"));
  }

  try {
    const token = authHeader.split(" ")[1];
    if (!token) {
      return next(ErrorHandler(401, "No token provided"));
    }

    jwt.verify(token, process.env.ACCESS_SECRET, (error, payload) => {
      if (error) {
        return next(ErrorHandler(401, "Wrong token"));
      }
      req.user = payload;
      next();
    });
  } catch (error) {
    next(error);
  }
};
