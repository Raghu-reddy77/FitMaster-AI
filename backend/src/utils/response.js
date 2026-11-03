/**
 * FitMaster AI – Standardized API Response Utilities
 * Enforces uniform JSON response schema across all backend endpoints.
 */

/**
 * Standard success response wrapper
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message - Human-readable success message
 * @param {any} data - Response payload
 */
function sendSuccess(res, statusCode = 200, message = 'Success', data = null) {
  const responsePayload = {
    success: true,
    message,
    data
  };
  return res.status(statusCode).json(responsePayload);
}

/**
 * Standard error response wrapper
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default 400 or 500)
 * @param {string} message - Human-readable error message
 * @param {any} errors - Detailed validation errors or debug info
 */
function sendError(res, statusCode = 500, message = 'Internal Server Error', errors = null) {
  const responsePayload = {
    success: false,
    message,
    ...(errors && { errors })
  };
  return res.status(statusCode).json(responsePayload);
}

module.exports = {
  sendSuccess,
  sendError
};
