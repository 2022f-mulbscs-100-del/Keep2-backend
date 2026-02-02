/**
 * Middleware organization and exports
 * Centralizes all middleware used in the application
 */

import { VerifyToken } from "../utils/VerifyToken.js";
import { AuthRateLimiter, GeneralRateLimiter } from "../utils/RateLimiter.js";
import { logger } from "../utils/Logger.js";

/**
 * Authentication middleware to verify JWT tokens
 * Adds user data to request object
 */
export const authenticateUser = VerifyToken;

/**
 * Rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
export const authRateLimit = AuthRateLimiter;

/**
 * General rate limiter for all other endpoints
 * Prevents API abuse
 */
export const generalRateLimit = GeneralRateLimiter;

/**
 * Request logging middleware
 * Logs all incoming requests with method, path, and user info
 */
export const requestLogger = (req, res, next) => {
  logger.info("Incoming request", {
    method: req.method,
    path: req.path,
    userId: req.user?.id || "anonymous",
    ip: req.ip,
  });
  next();
};

/**
 * Error handling middleware
 * Catches and formats all application errors
 */
export const errorHandler = (err, req, res) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  logger.error("Request error", {
    statusCode,
    message,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * CORS middleware configuration
 */
export const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

/**
 * JSON parser middleware config
 */
export const jsonParserOptions = {
  limit: "10mb",
};

/**
 * Validation middleware factory
 * Creates a middleware that validates request data against a schema
 * @param {object} schema - Zod validation schema
 * @returns {function} Middleware function
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      logger.warn("Validation failed", {
        path: req.path,
        errors: error.errors,
      });
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }
  };
};

/**
 * Async wrapper middleware
 * Wraps async route handlers to catch errors automatically
 * @param {function} fn - Async handler function
 * @returns {function} Middleware function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found middleware
 * Should be placed at the end of route definitions
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
  });
};

export default {
  authenticateUser,
  authRateLimit,
  generalRateLimit,
  requestLogger,
  errorHandler,
  corsOptions,
  jsonParserOptions,
  validateRequest,
  asyncHandler,
  notFoundHandler,
};
