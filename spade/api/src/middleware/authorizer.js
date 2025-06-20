// import { findUserByToken } from "../utils/jwt";
// import { logger } from "../utils/logger";

// export default async (req, res, next) => {
//   try {
//     const token = req.cookies.token || req.headers["x-access-token"];
//     if (!token) return res.sendStatus(400);
//     const user = await findUserByToken(token);
//     if (!user) {
//       res.clearCookie("token"); // fix for when user logs in from different device/browser
//       return res.status(401).send("authentication error");
//     }

//     // check if user is banned
//     if (user.is_banned || user.is_deleted) {
//       logger.warn(`user is banned: ${user.id}`);
//       res.clearCookie("token"); // clear token cookie from user browser
//       return res.status(403).send("user is banned");
//     };

//     const user_agent = user.role ? "" : req.headers["user-agent"] || ""; // dont save user-agent for admins
//     const ip = user.role ? "" : req.headers["x-forwarded-for"]?.split(",")[0] || req.headers["x-forwarded-for"] || req.ip; // dont save ip for admins
//     // update user.lastActive to current time
//     await user.update({
//       lastActive: new Date(),
//       user_agent,
//       ip,
//     });
//     // add user to request
//     req.user = user;
//     // next
//     next();
//   } catch (error) {
//     logger.error("authorizer failed", error.message);
//     logger.verbose(error);
//     next("authentication failed");
//   }
// };

/////////////////////
// const jwt = require("jsonwebtoken");
// const config = require("../config/index");

// module.exports = function authorizer(req, res, next) {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Unauthorized: Token missing" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, config.sessionSecret);

//     req.user = { ...decoded, token };
//     next();
//   } catch (err) {
//     console.error("Authorization error:", err.message);
//     return res.status(401).json({ message: "Unauthorized: Invalid token" });
//   }
// };



// /////////////old one
// import { findUserByToken } from "../utils/jwt";
// import { logger } from "../utils/logger";

// export default async (req, res, next) => {
//   try {
//     const token = req.cookies.token || req.headers["x-access-token"];
//     console.log("🔐 Token from request:", token);

//     if (!token) {
//       console.log("⛔ No token provided in cookie or x-access-token");
//       return res.sendStatus(400);
//     }

//     const user = await findUserByToken(token);
//     if (!user) {
//       console.log("⛔ Invalid token or user not found");
//       res.clearCookie("token");
//       return res.status(401).send("authentication error");
//     }

//     if (user.is_banned || user.is_deleted) {
//       console.log("⛔ User is banned or deleted");
//       logger.warn(`user is banned: ${user.id}`);
//       res.clearCookie("token");
//       return res.status(403).send("user is banned");
//     }

//     const user_agent = user.role ? "" : req.headers["user-agent"] || "";
//     const ip = user.role ? "" : req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;

//     await user.update({
//       lastActive: new Date(),
//       user_agent,
//       ip,
//     });

//     req.user = user;
//     next();
//   } catch (error) {
//     console.error("🔥 Authorizer failed:", error.message);
//     logger.error("authorizer failed", error.message);
//     logger.verbose(error);
//     next("authentication failed");
//   }
// };

////////////////////


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
    const ip = user.role ? "" : req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;

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
