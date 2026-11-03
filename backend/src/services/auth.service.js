/**
 * FitMaster AI – Authentication Service
 * Handles user registration, password encryption via bcryptjs, and JWT generation.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'fitmaster_super_secret_jwt_key_2026_academic_project';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new user
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} Created user payload and JWT token
 */
async function registerUser(name, email, password) {
  // Check if email already registered
  const existing = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
  if (existing && existing.length > 0) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Hash password using bcrypt salt cost factor 10
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Insert user
  const result = await db.query(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash]
  );

  const userId = result.insertId;

  // Generate JWT token
  const token = jwt.sign(
    { userId, email, name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    user: {
      userId,
      name,
      email
    },
    token
  };
}

/**
 * Authenticate existing user credentials
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} Authenticated user payload and JWT token
 */
async function loginUser(email, password) {
  const users = await db.query(
    'SELECT user_id, name, email, password_hash FROM users WHERE email = ?',
    [email]
  );

  if (!users || users.length === 0) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const user = users[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { userId: user.user_id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    user: {
      userId: user.user_id,
      name: user.name,
      email: user.email
    },
    token
  };
}

module.exports = {
  registerUser,
  loginUser
};
