/**
 * FitMaster AI – AI Integration Service
 * Manages communication between Node.js backend and Python AI microservice (FastAPI),
 * with transparent, mathematically grounded rule-based fallbacks.
 */

const db = require('../config/database');
const { getDailyProgress } = require('./progress.service');
const { getUserProfile } = require('./user.service');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_SERVICE_TIMEOUT = parseInt(process.env.AI_SERVICE_TIMEOUT, 10) || 5000;

/**
 * Generate personalized food and nutrition recommendations
 * @param {number} userId
 */
async function generateRecommendations(userId) {
  const profileData = await getUserProfile(userId);
  const dailyProgress = await getDailyProgress(userId);

  // If user profile is missing, throw informative error
  if (!profileData.profile || !profileData.goal) {
    const error = new Error('Please set up your user profile and nutrition goals to receive AI recommendations.');
    error.statusCode = 400;
    throw error;
  }

  // Fetch top candidate foods from database
  const candidateFoods = await db.query(
    `SELECT food_id, food_name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fibre_per_100g, serving_size
     FROM foods 
     ORDER BY protein_per_100g DESC 
     LIMIT 50`
  );

  const payload = {
    user_id: userId,
    profile: profileData.profile,
    goals: profileData.goal,
    daily_intake: {
      calories: dailyProgress.calories.consumed,
      protein: dailyProgress.macros.protein.consumed,
      carbs: dailyProgress.macros.carbs.consumed,
      fat: dailyProgress.macros.fat.consumed
    },
    candidate_foods: candidateFoods
  };

  let aiResponse = null;

  // Attempt communication with Python microservice
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_SERVICE_TIMEOUT);

    const res = await fetch(`${AI_SERVICE_URL}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      aiResponse = await res.json();
    }
  } catch (err) {
    console.warn('[AI Service Warning]: Python microservice unreachable, activating rule-based AI engine:', err.message);
  }

  // If Python microservice was not reached or returned an error, execute Stage 1 Rule-Based Engine
  if (!aiResponse || !aiResponse.recommendations) {
    aiResponse = executeRuleBasedRecommendation(payload);
  }

  // Persist recommendation record in database
  try {
    await db.query(
      `INSERT INTO ai_recommendations 
       (user_id, recommendation_date, gap_type, current_calories, current_protein, current_carbs, current_fat, 
        target_calories, target_protein, target_carbs, target_fat, food_suggestions_json, rationale, model_version)
       VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        aiResponse.gap_type,
        payload.daily_intake.calories,
        payload.daily_intake.protein,
        payload.daily_intake.carbs,
        payload.daily_intake.fat,
        payload.goals.daily_calories,
        payload.goals.protein_g,
        payload.goals.carbs_g,
        payload.goals.fat_g,
        JSON.stringify(aiResponse.recommendations),
        aiResponse.rationale,
        aiResponse.model_version || 'v1.0-rule_based_fallback'
      ]
    );
  } catch (err) {
    console.error('[AI Recommendation Log Error]:', err.message);
  }

  return aiResponse;
}

/**
 * Stage 1: Rule-Based Nutrition Recommendation Engine (Academic Implementation)
 * Evaluates dietary gaps and scores foods mathematically.
 */
function executeRuleBasedRecommendation(payload) {
  const { goals, daily_intake, candidate_foods } = payload;

  const calRemaining = Math.max(0, goals.daily_calories - daily_intake.calories);
  const pRemaining = Math.max(0, goals.protein_g - daily_intake.protein);
  const cRemaining = Math.max(0, goals.carbs_g - daily_intake.carbs);
  const fRemaining = Math.max(0, goals.fat_g - daily_intake.fat);

  const pRatio = goals.protein_g > 0 ? daily_intake.protein / goals.protein_g : 1;
  const calRatio = goals.daily_calories > 0 ? daily_intake.calories / goals.daily_calories : 1;

  let gapType = 'balanced';
  let rationale = '';

  if (pRatio < 0.70 && calRatio < 0.85) {
    gapType = 'protein_deficit_and_calories_available';
    rationale = `You have consumed only ${Math.round(pRatio * 100)}% of your target protein with ${Math.round(calRemaining)} kcal remaining. Prioritize lean, high-protein foods to support recovery and muscle preservation.`;
  } else if (pRatio < 0.75 && calRatio >= 0.85) {
    gapType = 'protein_deficit_low_calories';
    rationale = `You have a protein deficit but are nearing your calorie budget. Focus on pure, ultra-lean protein sources like Egg Whites, Low-Fat Paneer, or Whey.`;
  } else if (calRatio > 1.05) {
    gapType = 'calorie_surplus';
    rationale = `You have exceeded your daily calorie baseline by ${Math.round(daily_intake.calories - goals.daily_calories)} kcal. Focus on low-calorie density vegetables and high hydration for remainder of the day.`;
  } else {
    gapType = 'optimal_distribution';
    rationale = `Your nutritional intake is on track. Select balanced whole-food meals to meet your remaining micronutrient and macronutrient goals.`;
  }

  // Score candidate foods
  const scoredFoods = candidate_foods.map((food) => {
    let score = 0;
    const protein = parseFloat(food.protein_per_100g) || 0;
    const calories = parseFloat(food.calories_per_100g) || 1;
    const carbs = parseFloat(food.carbs_per_100g) || 0;
    const fat = parseFloat(food.fat_per_100g) || 0;

    // Protein density score (protein grams per 100 kcal)
    const proteinDensity = (protein / calories) * 100;

    if (gapType.includes('protein_deficit')) {
      score += proteinDensity * 2.5;
      if (food.category === 'Poultry & Meat' || food.category === 'Dairy & Alternatives' || food.category === 'Legumes & Pulses') {
        score += 15;
      }
    } else {
      score += (protein * 1.5) + (carbs * 0.8) - (fat * 0.5);
    }

    return {
      food_id: food.food_id,
      food_name: food.food_name,
      category: food.category,
      serving_size: food.serving_size,
      calories_per_100g: calories,
      protein_per_100g: protein,
      carbs_per_100g: carbs,
      fat_per_100g: fat,
      recommendation_score: Number(score.toFixed(1)),
      reason: `Provides ${protein}g protein per 100g with a favorable macro-calorie density ratio.`
    };
  });

  scoredFoods.sort((a, b) => b.recommendation_score - a.recommendation_score);

  return {
    gap_type: gapType,
    model_version: 'v1.0-rule_based_engine',
    rationale,
    remaining_macros: {
      calories: Math.round(calRemaining),
      protein_g: Math.round(pRemaining),
      carbs_g: Math.round(cRemaining),
      fat_g: Math.round(fRemaining)
    },
    recommendations: scoredFoods.slice(0, 6)
  };
}

/**
 * Get AI recommendation history
 * @param {number} userId
 */
async function getRecommendationHistory(userId) {
  const rows = await db.query(
    `SELECT recommendation_id, recommendation_date, gap_type, current_calories, current_protein, 
            current_carbs, current_fat, target_calories, target_protein, target_carbs, target_fat, 
            food_suggestions_json, rationale, model_version, created_at 
     FROM ai_recommendations 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT 10`,
    [userId]
  );
  return rows;
}

module.exports = {
  generateRecommendations,
  getRecommendationHistory
};
