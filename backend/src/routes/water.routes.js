const express = require('express');
const router = express.Router();
const waterController = require('../controllers/water.controller');
const authenticateToken = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', waterController.getWater);
router.post('/', waterController.addWater);
router.delete('/:id', waterController.deleteWater);

module.exports = router;
