/**
 * FitMaster AI – Meal Planner Service
 * Manages daily dietary planning across Breakfast, Lunch, Dinner, and Snacks slots,
 * calculates total plan macros, and suggests meals based on remaining daily goals.
 */

const db = require('../config/database');
const { getFoodById, scaleNutrition } = require('./food.service');
const { getUserGoals } = require('./nutrition.service');

/**
 * Retrieve meal plan and items for a user on a given date
 * @param {number} userId
 * @param {string} date - 'YYYY-MM-DD'
 */
async function getMealPlanByDate(userId, date) {
  const targetDate = date || new Date().toISOString().split('T')[0];

  const plans = await db.query(
    `SELECT plan_id, user_id, plan_date, plan_name, target_calories, 
            target_protein, target_carbs, target_fat, notes, created_at 
     FROM meal_plans 
     WHERE user_id = ? AND plan_date = ?`,
    [userId, targetDate]
  );

  if (plans.length === 0) {
    const goals = await getUserGoals(userId);
    return {
      plan_date: targetDate,
      plan_id: null,
      plan_name: `Planned Menu for ${targetDate}`,
      items: [],
      totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      targets: goals ? {
        calories: parseFloat(goals.daily_calories),
        protein: parseFloat(goals.protein_g),
        carbs: parseFloat(goals.carbs_g),
        fat: parseFloat(goals.fat_g)
      } : { calories: 2000, protein: 150, carbs: 250, fat: 65 }
    };
  }

  const plan = plans[0];

  const items = await db.query(
    `SELECT mpi.plan_item_id, mpi.plan_id, mpi.food_id, mpi.meal_type, 
            mpi.quantity_grams, mpi.calculated_calories, mpi.calculated_protein, 
            mpi.calculated_carbs, mpi.calculated_fat,
            f.food_name, f.category, f.serving_size, f.source
     FROM meal_plan_items mpi
     JOIN foods f ON mpi.food_id = f.food_id
     WHERE mpi.plan_id = ?
     ORDER BY FIELD(mpi.meal_type, 'breakfast', 'lunch', 'dinner', 'snacks'), mpi.plan_item_id ASC`,
    [plan.plan_id]
  );

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const itm of items) {
    totalCalories += parseFloat(itm.calculated_calories || 0);
    totalProtein += parseFloat(itm.calculated_protein || 0);
    totalCarbs += parseFloat(itm.calculated_carbs || 0);
    totalFat += parseFloat(itm.calculated_fat || 0);
  }

  const goals = await getUserGoals(userId);

  return {
    ...plan,
    items,
    totals: {
      calories: Number(totalCalories.toFixed(2)),
      protein: Number(totalProtein.toFixed(2)),
      carbs: Number(totalCarbs.toFixed(2)),
      fat: Number(totalFat.toFixed(2))
    },
    targets: goals ? {
      calories: parseFloat(goals.daily_calories),
      protein: parseFloat(goals.protein_g),
      carbs: parseFloat(goals.carbs_g),
      fat: parseFloat(goals.fat_g)
    } : { calories: 2000, protein: 150, carbs: 250, fat: 65 }
  };
}

/**
 * Save or replace a meal plan with itemized food items
 * @param {number} userId
 * @param {Object} planData - { plan_date, plan_name, notes, items: [ { food_id, meal_type, quantity_grams } ] }
 */
async function saveMealPlan(userId, planData) {
  const { plan_date, plan_name, notes, items } = planData;
  const targetDate = plan_date || new Date().toISOString().split('T')[0];
  const name = plan_name || `Daily Meal Plan for ${targetDate}`;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Calculate scaled totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const computedItems = [];
    if (items && items.length > 0) {
      for (const itm of items) {
        const food = await getFoodById(itm.food_id);
        const scaled = scaleNutrition(food, parseFloat(itm.quantity_grams));

        totalCalories += scaled.calories;
        totalProtein += scaled.protein;
        totalCarbs += scaled.carbs;
        totalFat += scaled.fat;

        computedItems.push({
          food_id: itm.food_id,
          meal_type: itm.meal_type || 'lunch',
          quantity_grams: scaled.quantity_grams,
          calculated_calories: scaled.calories,
          calculated_protein: scaled.protein,
          calculated_carbs: scaled.carbs,
          calculated_fat: scaled.fat
        });
      }
    }

    // Upsert meal plan header
    const [existing] = await connection.query(
      'SELECT plan_id FROM meal_plans WHERE user_id = ? AND plan_date = ?',
      [userId, targetDate]
    );

    let planId;
    if (existing.length > 0) {
      planId = existing[0].plan_id;
      await connection.query(
        `UPDATE meal_plans 
         SET plan_name = ?, target_calories = ?, target_protein = ?, target_carbs = ?, target_fat = ?, notes = ? 
         WHERE plan_id = ?`,
        [name, totalCalories, totalProtein, totalCarbs, totalFat, notes || '', planId]
      );
      // Delete old items
      await connection.query('DELETE FROM meal_plan_items WHERE plan_id = ?', [planId]);
    } else {
      const [insertRes] = await connection.query(
        `INSERT INTO meal_plans (user_id, plan_date, plan_name, target_calories, target_protein, target_carbs, target_fat, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, targetDate, name, totalCalories, totalProtein, totalCarbs, totalFat, notes || '']
      );
      planId = insertRes.insertId;
    }

    // Insert new items
    for (const itm of computedItems) {
      await connection.query(
        `INSERT INTO meal_plan_items (plan_id, food_id, meal_type, quantity_grams, calculated_calories, calculated_protein, calculated_carbs, calculated_fat) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [planId, itm.food_id, itm.meal_type, itm.quantity_grams, itm.calculated_calories, itm.calculated_protein, itm.calculated_carbs, itm.calculated_fat]
      );
    }

    await connection.commit();
    return await getMealPlanByDate(userId, targetDate);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Delete a meal plan
 * @param {number} userId
 * @param {number} planId
 */
async function deleteMealPlan(userId, planId) {
  const result = await db.query(
    'DELETE FROM meal_plans WHERE plan_id = ? AND user_id = ?',
    [planId, userId]
  );

  if (result.affectedRows === 0) {
    const error = new Error('Meal plan not found or unauthorized.');
    error.statusCode = 404;
    throw error;
  }

  return { message: 'Meal plan successfully deleted.' };
}

/**
 * Generate smart meal suggestions to satisfy remaining calorie and macronutrient targets
 * @param {number} userId
 * @param {string} date
 */
async function getMealPlanSuggestions(userId, date) {
  const plan = await getMealPlanByDate(userId, date);
  const remainingCal = Math.max(0, plan.targets.calories - plan.totals.calories);
  const remainingProtein = Math.max(0, plan.targets.protein - plan.totals.protein);

  // Query database candidate foods that fit the remaining profile
  const candidates = await db.query(
    `SELECT food_id, food_name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, serving_size
     FROM foods 
     WHERE calories_per_100g <= ?
     ORDER BY (protein_per_100g / calories_per_100g) DESC 
     LIMIT 12`,
    [Math.max(250, remainingCal)]
  );

  return {
    remaining_calories: Math.round(remainingCal),
    remaining_protein: Math.round(remainingProtein),
    suggestions: candidates.map((c) => ({
      ...c,
      recommended_grams: remainingCal > 200 ? 150 : 100,
      rationale: `Provides high protein density (${c.protein_per_100g}g / 100g) to help hit your target of ${Math.round(plan.targets.protein)}g.`
    }))
  };
}

module.exports = {
  getMealPlanByDate,
  saveMealPlan,
  deleteMealPlan,
  getMealPlanSuggestions
};
