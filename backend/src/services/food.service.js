/**
 * FitMaster AI – Food Reference Service
 * Handles food querying, category filtering, and proportional nutritional scaling per custom gram weights.
 */

const db = require('../config/database');

/**
 * Search foods by query substring and/or category
 * @param {string} query
 * @param {string} category
 * @param {number} limit
 * @param {number} offset
 */
async function searchFoods(query = '', category = '', limit = 50, offset = 0) {
  let sql = `
    SELECT food_id, food_name, category, calories_per_100g, protein_per_100g, 
           carbs_per_100g, fat_per_100g, fibre_per_100g, serving_size, source 
    FROM foods 
    WHERE 1=1
  `;
  const params = [];

  if (query && query.trim() !== '') {
    sql += ' AND food_name LIKE ?';
    params.push(`%${query.trim()}%`);
  }

  if (category && category.trim() !== '') {
    sql += ' AND category = ?';
    params.push(category.trim());
  }

  sql += ' ORDER BY food_name ASC LIMIT ? OFFSET ?';
  params.push(parseInt(limit, 10) || 50, parseInt(offset, 10) || 0);

  const foods = await db.query(sql, params);

  // Also get total count
  let countSql = 'SELECT COUNT(*) AS total FROM foods WHERE 1=1';
  const countParams = [];
  if (query && query.trim() !== '') {
    countSql += ' AND food_name LIKE ?';
    countParams.push(`%${query.trim()}%`);
  }
  if (category && category.trim() !== '') {
    countSql += ' AND category = ?';
    countParams.push(category.trim());
  }
  const countResult = await db.query(countSql, countParams);
  const total = countResult[0]?.total || 0;

  return {
    foods,
    total,
    limit: parseInt(limit, 10) || 50,
    offset: parseInt(offset, 10) || 0
  };
}

/**
 * Get single food by ID
 * @param {number} foodId
 */
async function getFoodById(foodId) {
  const foods = await db.query(
    `SELECT food_id, food_name, category, calories_per_100g, protein_per_100g, 
            carbs_per_100g, fat_per_100g, fibre_per_100g, serving_size, source 
     FROM foods 
     WHERE food_id = ?`,
    [foodId]
  );

  if (!foods || foods.length === 0) {
    const error = new Error('Food item not found.');
    error.statusCode = 404;
    throw error;
  }

  return foods[0];
}

/**
 * Get distinct categories present in the database
 */
async function getCategories() {
  const categories = await db.query(
    'SELECT DISTINCT category FROM foods ORDER BY category ASC'
  );
  return categories.map((c) => c.category);
}

/**
 * Scale nutritional values for a given serving in grams
 * Formula: (Per100g * grams) / 100
 * @param {Object} food
 * @param {number} grams
 */
function scaleNutrition(food, grams) {
  const multiplier = grams / 100;
  return {
    food_id: food.food_id,
    food_name: food.food_name,
    category: food.category,
    quantity_grams: grams,
    calories: Number((food.calories_per_100g * multiplier).toFixed(2)),
    protein: Number((food.protein_per_100g * multiplier).toFixed(2)),
    carbs: Number((food.carbs_per_100g * multiplier).toFixed(2)),
    fat: Number((food.fat_per_100g * multiplier).toFixed(2)),
    fibre: Number(((food.fibre_per_100g || 0) * multiplier).toFixed(2))
  };
}

module.exports = {
  searchFoods,
  getFoodById,
  getCategories,
  scaleNutrition
};
