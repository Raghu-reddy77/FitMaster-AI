/**
 * FitMaster AI – Hydration Tracking Service
 * Tracks fluid consumption (ml), evaluates progress toward daily goal, and maintains historical logs.
 */

const db = require('../config/database');

/**
 * Get hydration status for a given date
 * @param {number} userId
 * @param {string} date - 'YYYY-MM-DD'
 */
async function getWaterByDate(userId, date) {
  const targetDate = date || new Date().toISOString().split('T')[0];

  // Retrieve user hydration goal
  const goals = await db.query(
    'SELECT water_ml FROM nutrition_goals WHERE user_id = ?',
    [userId]
  );
  const targetWater = goals[0]?.water_ml ? parseFloat(goals[0].water_ml) : 2500;

  // Retrieve logs for this date
  const logs = await db.query(
    `SELECT water_id, user_id, intake_date, amount_ml, logged_at 
     FROM water_intake 
     WHERE user_id = ? AND intake_date = ? 
     ORDER BY logged_at ASC`,
    [userId, targetDate]
  );

  const totalConsumed = logs.reduce((acc, curr) => acc + parseInt(curr.amount_ml, 10), 0);
  const remaining = Math.max(0, targetWater - totalConsumed);
  const percentage = targetWater > 0 ? Math.min(100, Math.round((totalConsumed / targetWater) * 100)) : 0;

  return {
    date: targetDate,
    target_ml: targetWater,
    consumed_ml: totalConsumed,
    remaining_ml: remaining,
    percentage,
    logs
  };
}

/**
 * Add a water intake entry
 * @param {number} userId
 * @param {number} amountMl
 * @param {string} date
 */
async function addWaterIntake(userId, amountMl, date) {
  const targetDate = date || new Date().toISOString().split('T')[0];

  const result = await db.query(
    'INSERT INTO water_intake (user_id, intake_date, amount_ml) VALUES (?, ?, ?)',
    [userId, targetDate, parseInt(amountMl, 10)]
  );

  return await getWaterByDate(userId, targetDate);
}

/**
 * Delete a water intake entry
 * @param {number} userId
 * @param {number} waterId
 */
async function deleteWaterIntake(userId, waterId) {
  const result = await db.query(
    'DELETE FROM water_intake WHERE water_id = ? AND user_id = ?',
    [waterId, userId]
  );

  if (result.affectedRows === 0) {
    const error = new Error('Water entry not found or unauthorized.');
    error.statusCode = 404;
    throw error;
  }

  return { message: 'Water entry deleted successfully.' };
}

module.exports = {
  getWaterByDate,
  addWaterIntake,
  deleteWaterIntake
};
