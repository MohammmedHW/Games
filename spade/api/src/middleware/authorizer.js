import { findUserByToken } from "../utils/jwt";
import { logger } from "../utils/logger";
import User from "../models/User";

export default async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers["x-access-token"];
    if (!token) return res.sendStatus(400);

    // Find user by token
    const user = await findUserByToken(token);
    if (!user) {
      res.clearCookie("token");
      return res.status(401).send("Authentication error");
    }

    // Check if user is banned or deleted
    if (user.is_banned || user.is_deleted) {
      logger.warn(`User is banned: ${user._id}`);
      res.clearCookie("token");
      return res.status(403).send("User is banned");
    }

    // Prepare update data
    const updateData = {
      lastActive: new Date(),
    };

    // Only track user-agent and IP for non-admin users
    if (!user.role || user.role === "user") {
      updateData.user_agent = req.headers["user-agent"] || "";
      updateData.ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.headers["x-forwarded-for"] ||
        req.ip;
    }

    // Update user activity
    await User.findByIdAndUpdate(user._id, updateData);

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error("Authentication failed", error.message);
    logger.verbose(error);
    next("Authentication failed");
  }
};
