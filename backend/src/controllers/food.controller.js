const foodService = require('../services/food.service');
const { sendSuccess } = require('../utils/response');

async function getFoods(req, res, next) {
  try {
    const { page = 1, limit = 50, category } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const result = await foodService.searchFoods('', category, limit, offset);
    return sendSuccess(res, 200, 'Foods retrieved successfully.', result);
  } catch (error) {
    next(error);
  }
}

async function searchFoods(req, res, next) {
  try {
    const { q = '', category = '', limit = 50, offset = 0 } = req.query;
    const result = await foodService.searchFoods(q, category, limit, offset);
    return sendSuccess(res, 200, 'Food search results.', result);
  } catch (error) {
    next(error);
  }
}

async function getFoodById(req, res, next) {
  try {
    const foodId = parseInt(req.params.id, 10);
    const food = await foodService.getFoodById(foodId);
    return sendSuccess(res, 200, 'Food item details retrieved.', food);
  } catch (error) {
    next(error);
  }
}

async function getCategories(req, res, next) {
  try {
    const categories = await foodService.getCategories();
    return sendSuccess(res, 200, 'Food categories retrieved.', categories);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFoods,
  searchFoods,
  getFoodById,
  getCategories
};
