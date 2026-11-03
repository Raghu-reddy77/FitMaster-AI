const mealService = require('../services/meal.service');
const { sendSuccess } = require('../utils/response');

async function getMeals(req, res, next) {
  try {
    const userId = req.user.userId;
    const { date } = req.query;
    const result = await mealService.getMealsByDate(userId, date);
    return sendSuccess(res, 200, 'Meals retrieved successfully.', result);
  } catch (error) {
    next(error);
  }
}

async function logMeal(req, res, next) {
  try {
    const userId = req.user.userId;
    const result = await mealService.logMeal(userId, req.body);
    return sendSuccess(res, 201, 'Meal logged successfully.', result);
  } catch (error) {
    next(error);
  }
}

async function deleteMeal(req, res, next) {
  try {
    const userId = req.user.userId;
    const mealId = parseInt(req.params.id, 10);
    const result = await mealService.deleteMeal(userId, mealId);
    return sendSuccess(res, 200, 'Meal deleted successfully.', result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMeals,
  logMeal,
  deleteMeal
};
