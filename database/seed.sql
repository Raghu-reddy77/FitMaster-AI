-- =============================================================================
-- FITMASTER AI – SEED DATA SCRIPT
-- Verified Nutritional Reference Foods & Initial Test User Data
-- Sources: USDA FoodData Central & Indian Nutrient Databank (Anuvaad)
-- All nutrient measurements are strictly per 100 grams
-- =============================================================================

USE fitmaster_ai;

-- Disable foreign key checks for clean seed execution
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ai_recommendations;
TRUNCATE TABLE meal_plan_items;
TRUNCATE TABLE meal_plans;
TRUNCATE TABLE weight_history;
TRUNCATE TABLE water_intake;
TRUNCATE TABLE meal_items;
TRUNCATE TABLE meals;
TRUNCATE TABLE foods;
TRUNCATE TABLE nutrition_goals;
TRUNCATE TABLE user_profiles;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. Insert Verified Real Nutritional Foods (per 100g)
-- -----------------------------------------------------------------------------
INSERT INTO foods (food_name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fibre_per_100g, serving_size, source) VALUES
-- Grains & Cereals
('Brown Rice (Cooked)', 'Grains & Cereals', 123.00, 2.74, 25.58, 0.97, 1.60, '1 cup (195g)', 'USDA FoodData Central'),
('White Basmati Rice (Cooked)', 'Grains & Cereals', 130.00, 2.70, 28.20, 0.30, 0.40, '1 cup (158g)', 'Indian Nutrient Databank'),
('Rolled Oats (Raw)', 'Grains & Cereals', 379.00, 13.15, 67.70, 6.52, 10.10, '1/2 cup (40g)', 'USDA FoodData Central'),
('Whole Wheat Roti / Chapati', 'Grains & Cereals', 297.00, 9.80, 52.30, 4.20, 9.60, '1 piece (40g)', 'Indian Nutrient Databank'),
('Quinoa (Cooked)', 'Grains & Cereals', 120.00, 4.40, 21.30, 1.92, 2.80, '1 cup (185g)', 'USDA FoodData Central'),
('Whole Wheat Bread', 'Grains & Cereals', 247.00, 12.96, 41.27, 3.42, 6.00, '1 slice (32g)', 'USDA FoodData Central'),

-- Pulses, Dal & Legumes
('Yellow Lentil Dal (Cooked)', 'Legumes & Pulses', 116.00, 9.02, 20.13, 0.38, 7.90, '1 cup (198g)', 'Indian Nutrient Databank'),
('Chickpeas / Chana (Cooked)', 'Legumes & Pulses', 164.00, 8.86, 27.42, 2.59, 7.60, '1 cup (164g)', 'Indian Nutrient Databank'),
('Kidney Beans / Rajma (Cooked)', 'Legumes & Pulses', 127.00, 8.67, 22.80, 0.50, 6.40, '1 cup (177g)', 'Indian Nutrient Databank'),
('Moong Dal (Cooked)', 'Legumes & Pulses', 105.00, 7.02, 19.15, 0.38, 7.60, '1 cup (202g)', 'Indian Nutrient Databank'),
('Black Beans (Cooked)', 'Legumes & Pulses', 132.00, 8.86, 23.71, 0.54, 8.70, '1 cup (172g)', 'USDA FoodData Central'),
('Soybeans (Boiled)', 'Legumes & Pulses', 172.00, 18.20, 8.40, 8.90, 6.00, '1 cup (172g)', 'USDA FoodData Central'),

-- Dairy & Plant Alternatives
('Paneer (Indian Cottage Cheese)', 'Dairy & Alternatives', 296.00, 18.30, 3.40, 22.80, 0.00, '50g slice', 'Indian Nutrient Databank'),
('Low-Fat Paneer', 'Dairy & Alternatives', 173.00, 25.00, 4.50, 5.50, 0.00, '50g slice', 'Indian Nutrient Databank'),
('Greek Yogurt (Plain, Non-fat)', 'Dairy & Alternatives', 59.00, 10.19, 3.60, 0.39, 0.00, '1 container (170g)', 'USDA FoodData Central'),
('Curd / Dahi (Whole Milk)', 'Dairy & Alternatives', 98.00, 3.50, 4.70, 4.30, 0.00, '1 cup (200g)', 'Indian Nutrient Databank'),
('Skimmed Milk', 'Dairy & Alternatives', 35.00, 3.40, 5.00, 0.10, 0.00, '1 cup (245ml)', 'USDA FoodData Central'),
('Tofu (Firm)', 'Dairy & Alternatives', 76.00, 8.08, 1.87, 4.78, 0.30, '100g slice', 'USDA FoodData Central'),

-- Poultry, Eggs, Meat & Fish
('Chicken Breast (Skinless, Grilled)', 'Poultry & Meat', 165.00, 31.02, 0.00, 3.57, 0.00, '1 breast (172g)', 'USDA FoodData Central'),
('Chicken Thigh (Skinless, Cooked)', 'Poultry & Meat', 209.00, 25.97, 0.00, 10.88, 0.00, '1 thigh (86g)', 'USDA FoodData Central'),
('Whole Egg (Hard Boiled)', 'Poultry & Meat', 155.00, 12.58, 1.12, 10.61, 0.00, '1 large (50g)', 'USDA FoodData Central'),
('Egg White (Boiled)', 'Poultry & Meat', 52.00, 10.90, 0.73, 0.17, 0.00, '1 large (33g)', 'USDA FoodData Central'),
('Atlantic Salmon (Baked)', 'Fish & Seafood', 206.00, 22.10, 0.00, 12.35, 0.00, '1 fillet (154g)', 'USDA FoodData Central'),
('Tilapia (Cooked, Dry Heat)', 'Fish & Seafood', 128.00, 26.15, 0.00, 2.65, 0.00, '1 fillet (116g)', 'USDA FoodData Central'),

-- Vegetables & Greens
('Spinach (Palak, Raw)', 'Vegetables', 23.00, 2.86, 3.63, 0.39, 2.20, '1 cup (30g)', 'Indian Nutrient Databank'),
('Broccoli (Steamed)', 'Vegetables', 35.00, 2.38, 7.18, 0.41, 3.30, '1 cup (156g)', 'USDA FoodData Central'),
('Cauliflower (Gobi, Cooked)', 'Vegetables', 23.00, 1.84, 4.11, 0.45, 2.30, '1 cup (124g)', 'Indian Nutrient Databank'),
('Tomatoes (Ripe, Raw)', 'Vegetables', 18.00, 0.88, 3.89, 0.20, 1.20, '1 medium (123g)', 'USDA FoodData Central'),
('Cucumber (with peel, Raw)', 'Vegetables', 15.00, 0.65, 3.63, 0.11, 0.50, '1 cup sliced (104g)', 'USDA FoodData Central'),
('Carrots (Raw)', 'Vegetables', 41.00, 0.93, 9.58, 0.24, 2.80, '1 medium (61g)', 'USDA FoodData Central'),
('Green Peas (Boiled)', 'Vegetables', 84.00, 5.36, 15.63, 0.22, 5.50, '1 cup (160g)', 'Indian Nutrient Databank'),

-- Fruits
('Apple (with skin, Raw)', 'Fruits', 52.00, 0.26, 13.81, 0.17, 2.40, '1 medium (182g)', 'USDA FoodData Central'),
('Banana (Raw)', 'Fruits', 89.00, 1.09, 22.84, 0.33, 2.60, '1 medium (118g)', 'USDA FoodData Central'),
('Orange (Navel, Raw)', 'Fruits', 47.00, 0.94, 11.75, 0.12, 2.40, '1 medium (131g)', 'USDA FoodData Central'),
('Papaya (Raw)', 'Fruits', 43.00, 0.47, 10.82, 0.26, 1.70, '1 cup (145g)', 'Indian Nutrient Databank'),
('Guava (Amrood, Raw)', 'Fruits', 68.00, 2.55, 14.32, 0.95, 5.40, '1 fruit (55g)', 'Indian Nutrient Databank'),

-- Nuts, Seeds & Healthy Fats
('Almonds (Raw)', 'Nuts & Seeds', 579.00, 21.15, 21.55, 49.93, 12.50, '1 oz / 23 kernels (28g)', 'USDA FoodData Central'),
('Walnuts (Raw)', 'Nuts & Seeds', 654.00, 15.23, 13.71, 65.21, 6.70, '1 oz / 14 halves (28g)', 'USDA FoodData Central'),
('Chia Seeds', 'Nuts & Seeds', 486.00, 16.54, 42.12, 30.74, 34.40, '1 tbsp (12g)', 'USDA FoodData Central'),
('Peanut Butter (Natural)', 'Nuts & Seeds', 588.00, 25.09, 20.08, 50.39, 6.00, '2 tbsp (32g)', 'USDA FoodData Central'),
('Olive Oil (Extra Virgin)', 'Oils & Fats', 884.00, 0.00, 0.00, 100.00, 0.00, '1 tbsp (14g)', 'USDA FoodData Central');

-- -----------------------------------------------------------------------------
-- 2. Insert Test User (Password: Password@123)
-- -----------------------------------------------------------------------------
INSERT INTO users (user_id, name, email, password_hash) VALUES
(1, 'Demo User', 'demo@fitmaster.ai', '$2a$10$i7wVX0XBsLztxfc/vFKhrOyZwURu3OKaCoYk.hf6O6jxPoi1Je5sO');

-- -----------------------------------------------------------------------------
-- 3. Insert User Profile (Age 24, Male, 178cm, 75kg, Moderately Active, Lean Muscle Gain)
-- -----------------------------------------------------------------------------
INSERT INTO user_profiles (profile_id, user_id, age, gender, height_cm, weight_kg, activity_level, fitness_goal) VALUES
(1, 1, 24, 'male', 178.00, 75.00, 'moderately_active', 'lean_muscle_gain');

-- -----------------------------------------------------------------------------
-- 4. Insert Calculated Nutrition Goals
-- BMI: 75 / (1.78^2) = 23.67
-- BMR (Mifflin-St Jeor): 10*75 + 6.25*178 - 5*24 + 5 = 750 + 1112.5 - 120 + 5 = 1747.50 kcal
-- TDEE: 1747.50 * 1.55 = 2708.63 kcal
-- Target: 2708.63 + 350 (lean muscle gain surplus) = 3058.63 kcal
-- Protein: 2.2g * 75kg = 165.00g (660 kcal)
-- Fat: 25% of 3058.63 kcal = 764.66 kcal / 9 = 84.96g
-- Carbs: (3058.63 - 660 - 764.66) / 4 = 1633.97 / 4 = 408.49g
-- Water: 35ml * 75kg = 2625 ml
-- -----------------------------------------------------------------------------
INSERT INTO nutrition_goals (goal_id, user_id, daily_calories, protein_g, carbs_g, fat_g, water_ml, bmi, bmr, tdee) VALUES
(1, 1, 3058.63, 165.00, 408.49, 84.96, 2625.00, 23.67, 1747.50, 2708.63);

-- -----------------------------------------------------------------------------
-- 5. Insert Sample Weight History (Past 4 weeks showing steady progress)
-- -----------------------------------------------------------------------------
INSERT INTO weight_history (user_id, recorded_date, weight_kg, notes) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 28 DAY), 73.80, 'Baseline starting weight'),
(1, DATE_SUB(CURDATE(), INTERVAL 21 DAY), 74.20, 'Week 1 check-in'),
(1, DATE_SUB(CURDATE(), INTERVAL 14 DAY), 74.50, 'Consistent surplus maintained'),
(1, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 74.80, 'Strength gains noticeable'),
(1, CURDATE(), 75.00, 'Current weigh-in');

-- -----------------------------------------------------------------------------
-- 6. Insert Sample Water Intake Logs for Today
-- -----------------------------------------------------------------------------
INSERT INTO water_intake (user_id, intake_date, amount_ml) VALUES
(1, CURDATE(), 500),
(1, CURDATE(), 350),
(1, CURDATE(), 500),
(1, CURDATE(), 250);

-- -----------------------------------------------------------------------------
-- 7. Insert Today's Logged Meals (Breakfast & Lunch)
-- -----------------------------------------------------------------------------
-- Breakfast: Rolled Oats 80g + Greek Yogurt 150g + Banana 120g
-- Lunch: Brown Rice 200g + Chicken Breast 180g + Spinach 100g
INSERT INTO meals (meal_id, user_id, meal_date, meal_type, total_calories, total_protein, total_carbs, total_fat, total_fibre) VALUES
(1, 1, CURDATE(), 'breakfast', 498.50, 27.10, 89.20, 6.20, 11.20),
(2, 1, CURDATE(), 'lunch', 566.00, 63.80, 54.80, 8.80, 5.40);

-- Breakfast items:
-- Rolled oats 80g (food_id 3: 379*0.8=303.2 kcal, 13.15*0.8=10.52g P, 67.7*0.8=54.16g C, 6.52*0.8=5.22g F, 8.08g Fibre)
-- Greek yogurt 150g (food_id 15: 59*1.5=88.5 kcal, 10.19*1.5=15.29g P, 3.6*1.5=5.4g C, 0.39*1.5=0.59g F, 0g Fibre)
-- Banana 120g (food_id 27: 89*1.2=106.8 kcal, 1.09*1.2=1.31g P, 22.84*1.2=27.41g C, 0.33*1.2=0.40g F, 3.12g Fibre)
INSERT INTO meal_items (meal_id, food_id, quantity_grams, calories, protein, carbs, fat, fibre) VALUES
(1, 3, 80.00, 303.20, 10.52, 54.16, 5.22, 8.08),
(1, 15, 150.00, 88.50, 15.29, 5.40, 0.59, 0.00),
(1, 27, 120.00, 106.80, 1.31, 27.41, 0.40, 3.12);

-- Lunch items:
-- Brown rice 200g (food_id 1: 123*2=246 kcal, 2.74*2=5.48g P, 25.58*2=51.16g C, 0.97*2=1.94g F, 3.20g Fibre)
-- Chicken breast 180g (food_id 19: 165*1.8=297 kcal, 31.02*1.8=55.84g P, 0g C, 3.57*1.8=6.43g F, 0g Fibre)
-- Spinach 100g (food_id 22: 23*1=23 kcal, 2.86*1=2.86g P, 3.63*1=3.63g C, 0.39*1=0.39g F, 2.20g Fibre)
INSERT INTO meal_items (meal_id, food_id, quantity_grams, calories, protein, carbs, fat, fibre) VALUES
(2, 1, 200.00, 246.00, 5.48, 51.16, 1.94, 3.20),
(2, 19, 180.00, 297.00, 55.84, 0.00, 6.43, 0.00),
(2, 22, 100.00, 23.00, 2.86, 3.63, 0.39, 2.20);
