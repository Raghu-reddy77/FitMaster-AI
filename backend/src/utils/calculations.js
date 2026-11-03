/**
 * FitMaster AI – Clinical Metabolic & Nutritional Calculations
 * Implements clinically verified formulas including Mifflin-St Jeor BMR,
 * BMI classification, TDEE, macronutrient partitioning, and hydration estimation.
 */

/**
 * Calculate Body Mass Index (BMI)
 * @param {number} weightKg - Body weight in kilograms
 * @param {number} heightCm - Height in centimeters
 * @returns {number} BMI rounded to 2 decimal places
 */
function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Number(bmi.toFixed(2));
}

/**
 * Get clinical BMI classification
 * @param {number} bmi
 * @returns {string} Category description
 */
function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 24.9) return 'Normal weight';
  if (bmi < 29.9) return 'Overweight';
  return 'Obese';
}

/**
 * Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation
 * Men: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
 * Women: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
 * Other / Non-binary: standard average factor
 * @param {number} weightKg
 * @param {number} heightCm
 * @param {number} age
 * @param {string} gender - 'male' | 'female' | 'other'
 * @returns {number} BMR in kcal/day
 */
function calculateBMR(weightKg, heightCm, age, gender) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  let bmr;
  const normalizedGender = (gender || '').toLowerCase();

  if (normalizedGender === 'male') {
    bmr = base + 5;
  } else if (normalizedGender === 'female') {
    bmr = base - 161;
  } else {
    bmr = base - 78; // Mathematical midpoint
  }

  return Number(bmr.toFixed(2));
}

/**
 * Physical Activity Level Multipliers
 */
const ACTIVITY_FACTORS = {
  sedentary: 1.2,          // Little or no exercise
  lightly_active: 1.375,   // Light exercise 1-3 days/week
  moderately_active: 1.55, // Moderate exercise 3-5 days/week
  very_active: 1.725,      // Hard exercise 6-7 days/week
  extra_active: 1.9        // Very hard exercise / physical job
};

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * @param {number} bmr
 * @param {string} activityLevel
 * @returns {number} TDEE in kcal/day
 */
function calculateTDEE(bmr, activityLevel) {
  const factor = ACTIVITY_FACTORS[activityLevel] || 1.2;
  return Number((bmr * factor).toFixed(2));
}

/**
 * Compute Complete Personalized Nutritional Targets
 * @param {Object} profile - { age, gender, height_cm, weight_kg, activity_level, fitness_goal }
 * @returns {Object} Full nutritional breakdown
 */
function computeNutritionTargets(profile) {
  const { age, gender, height_cm, weight_kg, activity_level, fitness_goal } = profile;

  const weight = parseFloat(weight_kg);
  const height = parseFloat(height_cm);
  const ageYears = parseInt(age, 10);

  const bmi = calculateBMI(weight, height);
  const bmiCategory = getBMICategory(bmi);
  const bmr = calculateBMR(weight, height, ageYears, gender);
  const tdee = calculateTDEE(bmr, activity_level);

  // Calorie adjustments based on fitness goal
  let targetCalories = tdee;
  let proteinFactor = 1.6; // grams per kg

  if (fitness_goal === 'weight_loss') {
    targetCalories = Math.max(1200, tdee - 500); // 500 kcal deficit
    proteinFactor = 2.0; // Higher protein to preserve lean muscle tissue
  } else if (fitness_goal === 'lean_muscle_gain') {
    targetCalories = tdee + 350; // Clean surplus
    proteinFactor = 2.2; // Optimal muscle protein synthesis
  } else {
    // weight_maintenance
    targetCalories = tdee;
    proteinFactor = 1.6;
  }

  // Macronutrient calculation
  // 1. Protein: 4 kcal per gram
  const protein_g = Number((proteinFactor * weight).toFixed(2));
  const proteinKcal = protein_g * 4;

  // 2. Fat: 25% of daily calories, 9 kcal per gram
  const fatKcal = targetCalories * 0.25;
  const fat_g = Number((fatKcal / 9).toFixed(2));

  // 3. Carbohydrates: Remaining calories, 4 kcal per gram
  const remainingKcal = Math.max(200, targetCalories - proteinKcal - fatKcal);
  const carbs_g = Number((remainingKcal / 4).toFixed(2));

  // 4. Hydration target: 35 ml per kg body weight (min 2000 ml)
  const water_ml = Number(Math.max(2000, weight * 35).toFixed(0));

  return {
    bmi,
    bmiCategory,
    bmr,
    tdee,
    daily_calories: Number(targetCalories.toFixed(2)),
    protein_g,
    carbs_g,
    fat_g,
    water_ml,
    disclaimer: 'Note: These calculations are estimates based on scientific formulas (Mifflin-St Jeor) and are not medical prescriptions. Individual metabolic needs may vary.'
  };
}

module.exports = {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  computeNutritionTargets,
  ACTIVITY_FACTORS
};
