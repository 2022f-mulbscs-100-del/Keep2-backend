import { logger } from "../../utils/Logger.js";

export const Logout = (req, res, next) => {
  logger.info("Logout called");
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
    logger.info("User logged out successfully");
    res.status(200).json("Logged out successfully");
  } catch (error) {
    logger.error("Logout error - ", error.message);
    next(error);
  }
};
