const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const analyticsController = require('../controllers/analytics.controller');
const authenticateToken = require('../middleware/auth.middleware');

// Public route to serve statically cached Matplotlib charts
router.get('/static/:filename', (req, res) => {
  const filename = path.basename(req.params.filename); // Sanitize filename
  const filePath = path.resolve(__dirname, '../../../ai-service/generated_charts', filename);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'image/png');
    return res.sendFile(filePath);
  }
  return res.status(404).json({ success: false, message: 'Chart not yet generated.' });
});

router.use(authenticateToken);

router.get('/daily', analyticsController.getDailyChart);
router.get('/weekly', analyticsController.getWeeklyChart);
router.get('/monthly', analyticsController.getMonthlyChart);
router.get('/weight', analyticsController.getWeightChart);
router.get('/nutrition-charts', analyticsController.getAllNutritionCharts);
router.get('/model-performance', analyticsController.getModelPerformance);

module.exports = router;
