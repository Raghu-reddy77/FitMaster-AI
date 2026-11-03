/**
 * FitMaster AI – JWT Authentication Middleware
 * Enforces authorization header validation and attaches authenticated user payload to req.user.
 */

const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'fitmaster_super_secret_jwt_key_2026_academic_project';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return sendError(res, 401, 'Access denied. No authorization token was provided.');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return sendError(res, 401, 'Invalid authorization format. Format must be: Bearer <token>');
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Authentication token has expired. Please log in again.');
    }
    return sendError(res, 401, 'Invalid or corrupted authentication token.');
  }
}

module.exports = authenticateToken;
