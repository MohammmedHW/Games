import { logger } from "../utils/logger";

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn("Unauthorized access attempt - no user");
      return res.status(401).send("Unauthorized");
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        `Forbidden access: User ${req.user._id} with role ${req.user.role} tried accessing ${req.path}`
      );
      return res.status(403).send("Forbidden");
    }

    next();
  };
};

// Specific role checkers
export const requireSuperAdmin = requireRole(["superAdmin"]);
export const requireAdmin = requireRole(["superAdmin", "admin"]);
export const requireAgent = requireRole([
  "superAdmin",
  "admin",
  "masterAgent",
  "agent",
]);
