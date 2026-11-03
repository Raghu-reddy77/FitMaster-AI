const waterService = require('../services/water.service');
const { sendSuccess } = require('../utils/response');

async function getWater(req, res, next) {
  try {
    const userId = req.user.userId;
    const { date } = req.query;
    const result = await waterService.getWaterByDate(userId, date);
    return sendSuccess(res, 200, 'Hydration records retrieved successfully.', result);
  } catch (error) {
    next(error);
  }
}

async function addWater(req, res, next) {
  try {
    const userId = req.user.userId;
    const { amount_ml, date } = req.body;
    const result = await waterService.addWaterIntake(userId, amount_ml, date);
    return sendSuccess(res, 201, 'Water intake logged successfully.', result);
  } catch (error) {
    next(error);
  }
}

async function deleteWater(req, res, next) {
  try {
    const userId = req.user.userId;
    const waterId = parseInt(req.params.id, 10);
    const result = await waterService.deleteWaterIntake(userId, waterId);
    return sendSuccess(res, 200, 'Water entry deleted successfully.', result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWater,
  addWater,
  deleteWater
};
