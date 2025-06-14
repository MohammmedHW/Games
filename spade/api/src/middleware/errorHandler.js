import { logger } from "../utils/logger.js";
import AuditLog from "../models/AuditLog.js";

export const errorHandler = (err, req, res, next) => {
  // Log the error details
  logger.error(`Error occurred: ${err.message}`);
  logger.verbose(err.stack);

  // Determine status code
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal Server Error" : err.message;

  // Prepare error response
  const errorResponse = {
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  // Log to audit system for server errors (500)
  if (statusCode === 500) {
    AuditLog.create({
      action: "server_error",
      performedBy: req.user?.id || null,
      metadata: {
        error: err.message,
        stack: err.stack,
        route: req.path,
        method: req.method,
        params: req.params,
        query: req.query,
        body: req.body,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).catch((logErr) => {
      logger.error(`Failed to write error to audit log: ${logErr}`);
    });
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Custom error class for API errors
export class APIError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 Not Found handler
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};
