const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser(name, email, password);
    return sendSuccess(res, 201, 'User account registered successfully.', result);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return sendSuccess(res, 200, 'User logged in successfully.', result);
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    // JWT is stateless; client removes token. We return acknowledgment.
    return sendSuccess(res, 200, 'User logged out successfully.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout
};
