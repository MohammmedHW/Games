import { logger } from "../utils/logger";
import Log from "../models/Log";

export default async (req, res, next) => {
  const start = Date.now();

  res.on("finish", async () => {
    const duration = Date.now() - start;

    try {
      await Log.create({
        type: "request",
        message: `${req.method} ${req.url} ${res.statusCode}`,
        metadata: {
          method: req.method,
          url: req.url,
          status: res.statusCode,
          duration,
          ip: req.ip,
          user: req.user?._id || null,
        },
      });

      logger.verbose(
        `Request: ${req.method} ${req.url} | Status: ${res.statusCode} | Duration: ${duration}ms`
      );
    } catch (err) {
      logger.error("Failed to log request", err);
    }
  });

  next();
};
