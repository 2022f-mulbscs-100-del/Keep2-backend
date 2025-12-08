import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";
// import { ErrorHandler } from "./ErrorHandler";
export const RefreshToken = (user) => {
  const token = uuidv4();
  const NewRefreshToken = jwt.sign(
    {
      // id: decodedToken.id,
      id: user.id,
      data: token,
    },
    process.env.REFRESH_SECRET,
    { expiresIn: "1m" }
  );
  return NewRefreshToken;
};
