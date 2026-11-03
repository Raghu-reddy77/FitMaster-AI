const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticateToken = require('../middleware/auth.middleware');
const { profileValidator } = require('../validators/user.validator');
const validate = require('../middleware/validate');

router.use(authenticateToken);

router.get('/profile', userController.getProfile);
router.put('/profile', profileValidator, validate, userController.updateProfile);

module.exports = router;
