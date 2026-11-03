const nutritionService = require('../services/nutrition.service');
const { sendSuccess } = require('../utils/response');

async function getGoals(req, res, next) {
  try {
    const userId = req.user.userId;
    const goals = await nutritionService.getUserGoals(userId);
    return sendSuccess(res, 200, 'Nutrition targets retrieved successfully.', goals);
  } catch (error) {
    next(error);
  }
}

async function calculateGoals(req, res, next) {
  try {
    const userId = req.user.userId;
    const overrides = req.body;
    const targets = await nutritionService.calculateGoals(userId, overrides);
    return sendSuccess(res, 200, 'Nutrition goals calculated and saved successfully.', targets);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getGoals,
  calculateGoals
};
