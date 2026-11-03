const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const authenticateToken = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', mealController.getMeals);
router.post('/', mealController.logMeal);
router.delete('/:id', mealController.deleteMeal);

module.exports = router;
