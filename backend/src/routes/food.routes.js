const express = require('express');
const router = express.Router();
const foodController = require('../controllers/food.controller');
const authenticateToken = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', foodController.getFoods);
router.get('/search', foodController.searchFoods);
router.get('/categories', foodController.getCategories);
router.get('/:id', foodController.getFoodById);

module.exports = router;
