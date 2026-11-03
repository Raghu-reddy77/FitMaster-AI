/**
 * FitMaster AI – Backend Application & Calculation Integration Test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../../backend/src/app');
const {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  computeNutritionTargets
} = require('../../backend/src/utils/calculations');
const { sendSuccess, sendError } = require('../../backend/src/utils/response');

test('Metabolic & Nutritional Calculations Verification', (t) => {
  // 1. BMI calculation: 75kg, 178cm -> 75 / (1.78^2) = 23.67
  const bmi = calculateBMI(75, 178);
  assert.strictEqual(bmi, 23.67);
  assert.strictEqual(getBMICategory(bmi), 'Normal weight');

  // 2. BMR (Mifflin-St Jeor)
  // Male: 10 * 75 + 6.25 * 178 - 5 * 24 + 5 = 750 + 1112.5 - 120 + 5 = 1747.50
  const maleBmr = calculateBMR(75, 178, 24, 'male');
  assert.strictEqual(maleBmr, 1747.5);

  // Female: 10 * 60 + 6.25 * 165 - 5 * 28 - 161 = 600 + 1031.25 - 140 - 161 = 1330.25
  const femaleBmr = calculateBMR(60, 165, 28, 'female');
  assert.strictEqual(femaleBmr, 1330.25);

  // 3. TDEE
  // Moderately active (1.55): 1747.5 * 1.55 = 2708.625 -> 2708.63
  const tdee = calculateTDEE(maleBmr, 'moderately_active');
  assert.strictEqual(tdee, 2708.63);

  // 4. Complete Target Calculation (Lean Muscle Gain)
  const targets = computeNutritionTargets({
    age: 24,
    gender: 'male',
    height_cm: 178,
    weight_kg: 75,
    activity_level: 'moderately_active',
    fitness_goal: 'lean_muscle_gain'
  });

  assert.strictEqual(targets.daily_calories, 3058.63); // 2708.63 + 350
  assert.strictEqual(targets.protein_g, 165); // 2.2 * 75
  assert.ok(targets.carbs_g > 350, 'Carbs must be balanced based on remaining calories');
  assert.ok(targets.fat_g > 70, 'Fat must be allocated at 25%');
  assert.strictEqual(targets.water_ml, 2625); // 35 * 75
  assert.ok(targets.disclaimer.includes('medical prescriptions'));
});

test('Standard Response Utilities', (t) => {
  let capturedStatus = null;
  let capturedJson = null;

  const mockRes = {
    status(code) {
      capturedStatus = code;
      return this;
    },
    json(payload) {
      capturedJson = payload;
      return payload;
    }
  };

  sendSuccess(mockRes, 200, 'All good', { test: 123 });
  assert.strictEqual(capturedStatus, 200);
  assert.strictEqual(capturedJson.success, true);
  assert.strictEqual(capturedJson.data.test, 123);

  sendError(mockRes, 400, 'Bad request', ['Field missing']);
  assert.strictEqual(capturedStatus, 400);
  assert.strictEqual(capturedJson.success, false);
  assert.deepStrictEqual(capturedJson.errors, ['Field missing']);
});

test('Express App Routing Structure', (t) => {
  assert.ok(app, 'Express app must be defined');
  assert.strictEqual(typeof app.listen, 'function', 'App must expose listen method');
});
