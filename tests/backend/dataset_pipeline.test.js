/**
 * FitMaster AI – Dataset Pipeline & Nutritional Data Integrity Test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { parseCSVLine } = require('../../dataset/scripts/import_to_mysql');

const PROCESSED_CSV_PATH = path.resolve(__dirname, '../../dataset/processed/cleaned_foods.csv');

test('Dataset Processing Integrity & Column Structure', (t) => {
  assert.ok(fs.existsSync(PROCESSED_CSV_PATH), 'Cleaned dataset CSV must exist in dataset/processed/');

  const content = fs.readFileSync(PROCESSED_CSV_PATH, 'utf8');
  const lines = content.split('\n').filter((l) => l.trim().length > 0);

  assert.ok(lines.length > 50, `Cleaned dataset must contain significant food records (found ${lines.length})`);

  const header = parseCSVLine(lines[0]);
  const requiredColumns = [
    'food_name',
    'category',
    'calories_per_100g',
    'protein_per_100g',
    'carbs_per_100g',
    'fat_per_100g',
    'fibre_per_100g',
    'serving_size',
    'source'
  ];

  for (const col of requiredColumns) {
    assert.ok(header.includes(col), `Header must contain required column: ${col}`);
  }
});

test('Nutritional Value Validity & No Duplication', (t) => {
  const content = fs.readFileSync(PROCESSED_CSV_PATH, 'utf8');
  const lines = content.split('\n').filter((l) => l.trim().length > 0);

  const seenNames = new Set();
  const allowedCategories = new Set([
    'Grains & Cereals',
    'Legumes & Pulses',
    'Dairy & Alternatives',
    'Poultry & Meat',
    'Fish & Seafood',
    'Vegetables',
    'Fruits',
    'Nuts & Seeds',
    'Oils & Fats',
    'Snacks & Other'
  ]);

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    const name = fields[0];
    const category = fields[1];
    const calories = parseFloat(fields[2]);
    const protein = parseFloat(fields[3]);
    const carbs = parseFloat(fields[4]);
    const fat = parseFloat(fields[5]);
    const fibre = parseFloat(fields[6]);

    // Check duplicate
    assert.ok(!seenNames.has(name.toLowerCase()), `Duplicate food name detected: ${name}`);
    seenNames.add(name.toLowerCase());

    // Check category validity
    assert.ok(allowedCategories.has(category), `Invalid category "${category}" for food "${name}"`);

    // Check nutrient boundaries
    assert.ok(!isNaN(calories) && calories >= 0, `Calories must be non-negative for ${name}`);
    assert.ok(!isNaN(protein) && protein >= 0, `Protein must be non-negative for ${name}`);
    assert.ok(!isNaN(carbs) && carbs >= 0, `Carbs must be non-negative for ${name}`);
    assert.ok(!isNaN(fat) && fat >= 0, `Fat must be non-negative for ${name}`);
    assert.ok(!isNaN(fibre) && fibre >= 0, `Fibre must be non-negative for ${name}`);
  }
});

test('CSV Parser Handles Quoted Commas Correctly', (t) => {
  const testLine = '"Chicken, breast, grilled","Poultry & Meat",165.00,31.00,0.00,3.50,0.00,"1 breast (172g)","USDA"';
  const parsed = parseCSVLine(testLine);

  assert.strictEqual(parsed.length, 9);
  assert.strictEqual(parsed[0], 'Chicken, breast, grilled');
  assert.strictEqual(parsed[1], 'Poultry & Meat');
  assert.strictEqual(parsed[2], '165.00');
  assert.strictEqual(parsed[7], '1 breast (172g)');
});
