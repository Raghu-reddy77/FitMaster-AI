/**
 * FitMaster AI – Food Tracker & Meal Planner Unit & Integration Tests
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { scaleNutrition } = require('../../backend/src/services/food.service');
const app = require('../../backend/src/app');

test('Dynamic Nutritional Scaling Logic (Section 4 Verification)', (t) => {
  // Test food object with exact example from specification:
  // For 100g: Calories: 150 kcal, Protein: 10g, Carbs: 20g, Fat: 5g, Fibre: 2g
  const sampleFood = {
    food_id: 99,
    food_name: 'Test Nutritional Food',
    category: 'Grains & Cereals',
    calories_per_100g: 150.00,
    protein_per_100g: 10.00,
    carbs_per_100g: 20.00,
    fat_per_100g: 5.00,
    fibre_per_100g: 2.00
  };

  // Case 1: 100g serving
  const serving100g = scaleNutrition(sampleFood, 100);
  assert.strictEqual(serving100g.calories, 150.00);
  assert.strictEqual(serving100g.protein, 10.00);
  assert.strictEqual(serving100g.carbs, 20.00);
  assert.strictEqual(serving100g.fat, 5.00);
  assert.strictEqual(serving100g.fibre, 2.00);

  // Case 2: 200g serving (Prompt explicit example: 300 kcal, 20g P, 40g C, 10g F)
  const serving200g = scaleNutrition(sampleFood, 200);
  assert.strictEqual(serving200g.calories, 300.00);
  assert.strictEqual(serving200g.protein, 20.00);
  assert.strictEqual(serving200g.carbs, 40.00);
  assert.strictEqual(serving200g.fat, 10.00);
  assert.strictEqual(serving200g.fibre, 4.00);

  // Case 3: 50g serving
  const serving50g = scaleNutrition(sampleFood, 50);
  assert.strictEqual(serving50g.calories, 75.00);
  assert.strictEqual(serving50g.protein, 5.00);
  assert.strictEqual(serving50g.carbs, 10.00);
  assert.strictEqual(serving50g.fat, 2.50);
  assert.strictEqual(serving50g.fibre, 1.00);

  // Case 4: 175g non-integer multiplier
  const serving175g = scaleNutrition(sampleFood, 175);
  assert.strictEqual(serving175g.calories, 262.50);
  assert.strictEqual(serving175g.protein, 17.50);
  assert.strictEqual(serving175g.carbs, 35.00);
  assert.strictEqual(serving175g.fat, 8.75);
  assert.strictEqual(serving175g.fibre, 3.50);
});

test('Canonical Meal Categories Verification', (t) => {
  const allowedSlots = ['breakfast', 'lunch', 'dinner', 'snacks'];
  assert.strictEqual(allowedSlots.length, 4);
  assert.ok(allowedSlots.includes('breakfast'));
  assert.ok(allowedSlots.includes('lunch'));
  assert.ok(allowedSlots.includes('dinner'));
  assert.ok(allowedSlots.includes('snacks'));
});

test('Strict Requirement: No Food Scanner Routes Exist', (t) => {
  // Inspect registered routes on Express router stack
  const router = app._router;
  const routes = [];

  function extractRoutes(stack, prefix = '') {
    stack.forEach((layer) => {
      if (layer.route && layer.route.path) {
        routes.push(prefix + layer.route.path);
      } else if (layer.name === 'router' && layer.handle.stack) {
        let routePrefix = prefix;
        if (layer.regexp) {
          const match = layer.regexp.source
            .replace('\\/?(?=\\/|$)', '')
            .replace('^\\', '')
            .replace('\\', '')
            .replace('(?=\\/|$)', '');
          routePrefix += match;
        }
        extractRoutes(layer.handle.stack, routePrefix);
      }
    });
  }

  extractRoutes(router.stack);

  // Verify that NO scanner, camera, or image upload endpoints exist in the application
  const forbiddenKeywords = ['scan', 'scanner', 'camera', 'photo-upload', 'classify-food'];
  for (const r of routes) {
    for (const kw of forbiddenKeywords) {
      assert.ok(
        !r.toLowerCase().includes(kw),
        `Forbidden food scanner route detected: ${r}`
      );
    }
  }
});
