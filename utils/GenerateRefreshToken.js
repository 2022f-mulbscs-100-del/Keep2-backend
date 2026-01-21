import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";
import { logger } from "./Logger.js";

export const RefreshToken = (user) => {
  logger.info("Generating refresh token for user", { userId: user.id });
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
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return NewRefreshToken;
};
