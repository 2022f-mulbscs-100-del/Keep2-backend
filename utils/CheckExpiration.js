import { logger } from "./Logger.js";

export const checkExpiration = (date) => {
  const validTokenTime = 10 * 60 * 1000;
  const dbDate = new Date(date).getTime();
  const currentDate = Date.now();

  const diff = currentDate - dbDate;
  const isValid = diff <= validTokenTime;

  if (!isValid) {
    logger.warn("Token expired", {
      expirationTime: new Date(date).toISOString(),
    });
    return false;
  }

  return isValid;
};
