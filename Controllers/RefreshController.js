import { ErrorHandler } from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import { AccessToken } from "../utils/GenerateAcessToken.js";
import User from "../Modals/UserModal.js";

export default async function Refresh(req, res, next) {
  const refreshToken = req.cookies.refreshToken;
  console.log("refreshTOken", refreshToken);
  if (!refreshToken) {
    return next(ErrorHandler(401, "Unauthorized"));
  }
  console.log("REFRESH_SECRET exists?", !!process.env.REFRESH_SECRET);
  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const user = await User.findByPk(payload.id);
    if (!user) return next(ErrorHandler(404, "User not found"));

    const newAccessToken = AccessToken(user);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return next(
        ErrorHandler(401, "Refresh token expired. Please login again.")
      );
    }

    return next(ErrorHandler(403, "Invalid token"));
  }
}
