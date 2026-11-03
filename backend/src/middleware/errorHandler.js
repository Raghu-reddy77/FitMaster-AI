/**
 * FitMaster AI – Centralized Error Handling Middleware
 * Catches unhandled errors, formats structured JSON responses, and prevents crashes.
 */

const { sendError } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  // MySQL specific errors
  if (err.code === 'ER_DUP_ENTRY') {
    return sendError(res, 409, 'A record with the specified unique identifier already exists.', {
      detail: err.sqlMessage
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return sendError(res, 400, 'Referenced record does not exist in the database.', {
      detail: err.sqlMessage
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid authentication token provided.');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Authentication token has expired. Please log in again.');
  }

  // Custom status code if provided on error object
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || 'Internal server error occurred.';

  return sendError(res, statusCode, message, process.env.NODE_ENV === 'development' ? err.stack : null);
}

module.exports = errorHandler;
