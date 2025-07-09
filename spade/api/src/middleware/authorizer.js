import { findUserByToken } from "../utils/jwt";
import { logger } from "../utils/logger";

export default async (req, res, next) => {
  try {
    //  Only extract from x-access-token header
    const token = req.headers["x-access-token"];
    console.log("Token from request:", token);

    if (!token) {
      return res.status(400).send("No token provided");
    }

    const user = await findUserByToken(token);

    if (!user) {
      console.log("Invalid token or user not found");
      return res.status(401).send("Authentication error");
    }

    if (user.is_banned || user.is_deleted) {
      logger.warn(`User is banned: ${user.id}`);
      return res.status(403).send("User is banned");
    }

    const user_agent = user.role ? "" : req.headers["user-agent"] || "";
    const ip = user.role
      ? ""
      : req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;

    await user.update({
      lastActive: new Date(),
      user_agent,
      ip,
    });

    req.user = user;
    next();
  } catch (error) {
    console.error("🔥 Authorizer failed:", error.message);
    logger.error("Authorizer failed", error.message);
    logger.verbose(error);
    return res.status(500).send("Authentication failed");
  }
};
