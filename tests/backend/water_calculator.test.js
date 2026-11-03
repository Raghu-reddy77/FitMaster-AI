/**
 * FitMaster AI – Hydration & Nutrition Calculator Unit Tests
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  computeNutritionTargets
} = require('../../backend/src/utils/calculations');

test('Mifflin-St Jeor Formula Precision & Differential Properties', (t) => {
  // Height: 180cm, Weight: 80kg, Age: 30
  // Base: 10*80 + 6.25*180 - 5*30 = 800 + 1125 - 150 = 1775
  const maleBmr = calculateBMR(80, 180, 30, 'male');
  assert.strictEqual(maleBmr, 1780); // 1775 + 5

  const femaleBmr = calculateBMR(80, 180, 30, 'female');
  assert.strictEqual(femaleBmr, 1614); // 1775 - 161

  // Age sensitivity: 10 years older should decrease BMR by exactly 50 kcal
  const olderMaleBmr = calculateBMR(80, 180, 40, 'male');
  assert.strictEqual(maleBmr - olderMaleBmr, 50);

  // Weight sensitivity: 10kg heavier should increase BMR by exactly 100 kcal
  const heavierMaleBmr = calculateBMR(90, 180, 30, 'male');
  assert.strictEqual(heavierMaleBmr - maleBmr, 100);
});

test('Hydration Calculation & Boundary Rules', (t) => {
  // 35 ml per kg bodyweight
  const target70kg = computeNutritionTargets({
    age: 25,
    gender: 'male',
    height_cm: 175,
    weight_kg: 70,
    activity_level: 'moderately_active',
    fitness_goal: 'weight_maintenance'
  });
  assert.strictEqual(target70kg.water_ml, 2450); // 70 * 35

  // Light bodyweight should maintain minimum threshold of 2000 ml
  const target45kg = computeNutritionTargets({
    age: 20,
    gender: 'female',
    height_cm: 155,
    weight_kg: 45,
    activity_level: 'sedentary',
    fitness_goal: 'weight_loss'
  });
  assert.strictEqual(target45kg.water_ml, 2000); // 45 * 35 = 1575 -> clamped to 2000
});

test('Hydration Math: Consumed, Remaining & Percentage', (t) => {
  const target = 2500;
  const logs = [
    { amount_ml: 500 },
    { amount_ml: 250 },
    { amount_ml: 500 }
  ];

  const totalConsumed = logs.reduce((acc, curr) => acc + curr.amount_ml, 0);
  assert.strictEqual(totalConsumed, 1250);

  const remaining = Math.max(0, target - totalConsumed);
  assert.strictEqual(remaining, 1250);

  const percentage = Math.round((totalConsumed / target) * 100);
  assert.strictEqual(percentage, 50);

  // Exceeding goal does not cause negative remaining
  const excessiveConsumed = 3000;
  assert.strictEqual(Math.max(0, target - excessiveConsumed), 0);
});
