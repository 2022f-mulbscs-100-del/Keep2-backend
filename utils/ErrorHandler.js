import { logger } from "./Logger.js";

export const ErrorHandler = (statusCode, message) => {
  const error = new Error();
  error.statusCode = statusCode;
  error.message = message;
  logger.warn("Error created", { statusCode, message });
  return error;
};
