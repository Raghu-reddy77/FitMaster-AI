const { body } = require('express-validator');

const profileValidator = [
  body('age')
    .isInt({ min: 12, max: 120 }).withMessage('Age must be an integer between 12 and 120 years.'),
  body('gender')
    .isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other.'),
  body('height_cm')
    .isFloat({ min: 50, max: 280 }).withMessage('Height must be between 50 cm and 280 cm.'),
  body('weight_kg')
    .isFloat({ min: 25, max: 350 }).withMessage('Weight must be between 25 kg and 350 kg.'),
  body('activity_level')
    .isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'])
    .withMessage('Activity level must be one of: sedentary, lightly_active, moderately_active, very_active, extra_active.'),
  body('fitness_goal')
    .isIn(['weight_loss', 'weight_maintenance', 'lean_muscle_gain'])
    .withMessage('Fitness goal must be one of: weight_loss, weight_maintenance, lean_muscle_gain.')
];

module.exports = {
  profileValidator
};
