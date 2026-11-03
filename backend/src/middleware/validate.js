/**
 * FitMaster AI – Express Validator Validation Result Middleware
 * Extracts validation errors from express-validator chains and sends structured 422/400 errors.
 */

const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(
      res,
      422,
      'Validation failed. Please verify the provided request data.',
      errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    );
  }
  next();
}

module.exports = validate;
