const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutrition.controller');
const authenticateToken = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/goals', nutritionController.getGoals);
router.post('/calculate', nutritionController.calculateGoals);

module.exports = router;
