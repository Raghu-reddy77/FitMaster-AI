const mealPlanService = require('../services/meal-plan.service');
const { sendSuccess } = require('../utils/response');

async function getPlan(req, res, next) {
  try {
    const userId = req.user.userId;
    const { date } = req.query;
    const plan = await mealPlanService.getMealPlanByDate(userId, date);
    return sendSuccess(res, 200, 'Meal plan retrieved successfully.', plan);
  } catch (error) {
    next(error);
  }
}

async function savePlan(req, res, next) {
  try {
    const userId = req.user.userId;
    const plan = await mealPlanService.saveMealPlan(userId, req.body);
    return sendSuccess(res, 200, 'Meal plan saved successfully.', plan);
  } catch (error) {
    next(error);
  }
}

async function deletePlan(req, res, next) {
  try {
    const userId = req.user.userId;
    const planId = parseInt(req.params.id, 10);
    const result = await mealPlanService.deleteMealPlan(userId, planId);
    return sendSuccess(res, 200, 'Meal plan deleted successfully.', result);
  } catch (error) {
    next(error);
  }
}

async function getSuggestions(req, res, next) {
  try {
    const userId = req.user.userId;
    const { date } = req.query;
    const suggestions = await mealPlanService.getMealPlanSuggestions(userId, date);
    return sendSuccess(res, 200, 'Meal plan suggestions generated.', suggestions);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPlan,
  savePlan,
  deletePlan,
  getSuggestions
};
