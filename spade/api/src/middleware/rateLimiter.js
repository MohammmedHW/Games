import rateLimit from "express-rate-limit";
import { logger } from "../utils/logger";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).send("Too many requests, please try again later");
  },
});

// More aggressive limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true, // only count failed attempts
});
