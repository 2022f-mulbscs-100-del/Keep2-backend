import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";

export const RefreshToken = (user) => {
  const token = uuidv4();
  const NewRefreshToken = jwt.sign(
    {
      id: user.id,
      data: token,
    },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return NewRefreshToken;
};
