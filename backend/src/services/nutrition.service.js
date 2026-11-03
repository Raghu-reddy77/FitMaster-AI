/**
 * FitMaster AI – Nutrition Goal Service
 * Computes, retrieves, and updates personalized metabolic targets.
 */

const db = require('../config/database');
const { computeNutritionTargets } = require('../utils/calculations');

/**
 * Get saved nutrition targets for a user
 * @param {number} userId
 */
async function getUserGoals(userId) {
  const goals = await db.query(
    `SELECT goal_id, user_id, daily_calories, protein_g, carbs_g, fat_g, water_ml, bmi, bmr, tdee, calculated_at 
     FROM nutrition_goals 
     WHERE user_id = ?`,
    [userId]
  );

  if (!goals || goals.length === 0) {
    return null;
  }

  const goal = goals[0];
  return {
    ...goal,
    disclaimer: 'Note: These calculations are estimates based on scientific formulas (Mifflin-St Jeor) and are not medical prescriptions. Individual metabolic needs may vary.'
  };
}

/**
 * Recalculate and persist nutrition goals based on updated or custom attributes
 * @param {number} userId
 * @param {Object} metricsOverride - Optional custom parameters to recalculate
 */
async function calculateGoals(userId, metricsOverride = {}) {
  // Fetch existing profile if overrides are not completely provided
  const profiles = await db.query(
    `SELECT age, gender, height_cm, weight_kg, activity_level, fitness_goal 
     FROM user_profiles 
     WHERE user_id = ?`,
    [userId]
  );

  if ((!profiles || profiles.length === 0) && (!metricsOverride.weight_kg || !metricsOverride.height_cm)) {
    const error = new Error('User profile is not configured. Please complete your profile first.');
    error.statusCode = 400;
    throw error;
  }

  const base = profiles[0] || {};
  const merged = {
    age: metricsOverride.age || base.age,
    gender: metricsOverride.gender || base.gender,
    height_cm: metricsOverride.height_cm || base.height_cm,
    weight_kg: metricsOverride.weight_kg || base.weight_kg,
    activity_level: metricsOverride.activity_level || base.activity_level,
    fitness_goal: metricsOverride.fitness_goal || base.fitness_goal
  };

  const calculated = computeNutritionTargets(merged);

  await db.query(
    `INSERT INTO nutrition_goals (user_id, daily_calories, protein_g, carbs_g, fat_g, water_ml, bmi, bmr, tdee)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       daily_calories = VALUES(daily_calories),
       protein_g = VALUES(protein_g),
       carbs_g = VALUES(carbs_g),
       fat_g = VALUES(fat_g),
       water_ml = VALUES(water_ml),
       bmi = VALUES(bmi),
       bmr = VALUES(bmr),
       tdee = VALUES(tdee)`,
    [
      userId,
      calculated.daily_calories,
      calculated.protein_g,
      calculated.carbs_g,
      calculated.fat_g,
      calculated.water_ml,
      calculated.bmi,
      calculated.bmr,
      calculated.tdee
    ]
  );

  return calculated;
}

module.exports = {
  getUserGoals,
  calculateGoals
};
