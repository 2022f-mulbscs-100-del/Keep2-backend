/**
 * Utilities organization and exports
 * Centralizes all utility functions
 */

export { logger } from "./Logger.js";
export { VerifyToken } from "./VerifyToken.js";
export { AccessToken } from "./GenerateAcessToken.js";
export { RefreshToken } from "./GenerateRefreshToken.js";
export { ErrorHandler } from "./ErrorHandler.js";
export { AuthRateLimiter, GeneralRateLimiter } from "./RateLimiter.js";
export { NormalizeDate } from "./NormalizeDate.js";
export { CalculateProration } from "./CalculateProration.js";
export { checkExpiration } from "./CheckExpiration.js";

// Helper functions
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const isEmpty = (value) => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && Object.keys(value).length === 0)
  );
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const truncateString = (str, length) => {
  return str.length > length ? str.substring(0, length) + "..." : str;
};

export const formatError = (error) => {
  return {
    message: error.message,
    code: error.code || "UNKNOWN_ERROR",
    statusCode: error.statusCode || 500,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };
};

export const sanitizeObject = (obj, fieldsToRemove = ["password", "token"]) => {
  const sanitized = { ...obj };
  fieldsToRemove.forEach((field) => {
    delete sanitized[field];
  });
  return sanitized;
};

export const generateRandomToken = (length = 32) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const buildPaginationQuery = (page = 1, limit = 10) => {
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
  return {
    offset: (parsedPage - 1) * parsedLimit,
    limit: parsedLimit,
    page: parsedPage,
  };
};

export const buildSortQuery = (sortBy, sortOrder = "asc") => {
  const validOrders = ["asc", "desc"];
  const order = validOrders.includes(sortOrder?.toLowerCase())
    ? sortOrder.toLowerCase()
    : "asc";
  return { sortBy, order };
};

export default {
  delay,
  isEmpty,
  isValidEmail,
  isValidURL,
  truncateString,
  formatError,
  sanitizeObject,
  generateRandomToken,
  generateVerificationCode,
  buildPaginationQuery,
  buildSortQuery,
};
