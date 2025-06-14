export const addAuditContext = (req, res, next) => {
  req.auditContext = {
    ipAddress: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
    userAgent: req.headers["user-agent"],
  };
  next();
};
