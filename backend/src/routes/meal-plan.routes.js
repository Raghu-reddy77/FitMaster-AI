const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/meal-plan.controller');
const authenticateToken = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', mealPlanController.getPlan);
router.post('/', mealPlanController.savePlan);
router.delete('/:id', mealPlanController.deletePlan);
router.get('/suggestions', mealPlanController.getSuggestions);

module.exports = router;
