import rateLimit from "express-rate-limit";

export const GeneralRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable the X-RateLimit headers
});

export const AuthRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message:
    "Too many authentication attempts from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
