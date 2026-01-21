import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";
// import { ErrorHandler } from "./ErrorHandler";
export const AccessToken = (user) => {
  const token = uuidv4();
  // let decodedToken
  // if(Usertoken){
  //     try {

  //         decodedToken = jwt.verify(Usertoken,process.env.REFRESH_SECRET)
  //     } catch (error) {
  //         ErrorHandler(400,"Invalid Token");
  //         console.error(error)
  //          decodedToken = null;
  //     }
  // }

  const NewRefreshToken = jwt.sign(
    {
      // id: decodedToken.id,
      id: user.id,
      data: token,
    },
    process.env.ACCESS_SECRET,
    { expiresIn: "1m" }
  );

  return NewRefreshToken;
};
