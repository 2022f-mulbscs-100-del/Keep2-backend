import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";
import { logger } from "./Logger.js";
// import { ErrorHandler } from "./ErrorHandler";
export const AccessToken = (user) => {
  logger.info("Generating access token for user", { userId: user.id });
  const token = uuidv4();
  const subscription = user.getSubscription();

  const NewRefreshToken = jwt.sign(
    {
      id: user.id,
      data: token,
      subscription: {
        subscriptionActive: user.subscriptionStatus,
        type: subscription.subscriptionPlan,
      },
    },
    process.env.ACCESS_SECRET,
    { expiresIn: "1m" }
  );

  return NewRefreshToken;
};
