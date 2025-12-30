import { ErrorHandler } from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import { AccessToken } from "../utils/GenerateAcessToken.js";
import User from "../Modals/UserModal.js";

export default async function Refresh(req, res, next) {
  const refreshToken = req.cookies.refreshToken;
  console.log("Received refresh token:", refreshToken);
  if (!refreshToken) {
    return next(ErrorHandler(401, "Unauthorized"));
  }
  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const rest = await User.findByPk(payload.id);
    if (!rest) return next(ErrorHandler(404, "User not found"));

    const newAccessToken = AccessToken(rest);
    //eslint-disable-next-line
    const { password, ...restWithoutPassword } = rest.dataValues;
    res
      .status(200)
      .json({ accessToken: newAccessToken, rest: restWithoutPassword });
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
