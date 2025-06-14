import { logger } from "../utils/logger";
import Site from "../models/Site";

export const ipWhitelist = async (req, res, next) => {
  try {
    // Skip whitelist check for local development
    if (process.env.NODE_ENV === "development") return next();

    const settings = await Site.findOne({ key: "IP_WHITELIST" });
    const whitelist = settings?.value?.split(",") || [];

    // Get client IP considering proxies
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;

    if (whitelist.length > 0 && !whitelist.includes(ip)) {
      logger.warn(
        `IP not whitelisted: ${ip} attempted ${req.method} ${req.url}`
      );
      return res.status(403).send("Access denied");
    }

    next();
  } catch (err) {
    logger.error("IP whitelist check failed", err);
    next(err);
  }
};
