import jwt from "jsonwebtoken";
import { ErrorHandler } from "./ErrorHandler.js";
import { logger } from "./Logger.js";

export const VerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  logger.info("Verifying token for request: ", { path: req.path });
  if (!authHeader) {
    logger.warn("No authorization header provided");
    return next(ErrorHandler(401, "Unauthorized"));
  }
  logger.info("Authorization header found");
  try {
    const token = authHeader.split(" ")[1];
    if (!token) {
      logger.warn("No token provided in authorization header");
      return next(ErrorHandler(401, "No token provided"));
    }

    jwt.verify(token, process.env.ACCESS_SECRET, (error, payload) => {
      if (error) {
        logger.warn("Token verification failed: ", { error: error.message });
        return next(ErrorHandler(401, "Wrong token"));
      }
      req.user = payload;
      next();
    });
  } catch (error) {
    logger.error("Token verification error: ", { error: error.message });
    next(error);
  }
};
