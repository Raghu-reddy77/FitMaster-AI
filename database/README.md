# FitMaster AI - Database Architecture

## Overview
This directory contains the relational database schema, initial seed data, and architectural notes for **FitMaster AI – Intelligent Nutrition Tracker**. The database is designed for **MySQL 8.0+** and is fully compatible with **MySQL Workbench**.

## Database Name
`fitmaster_ai`

## Key Design Principles
1. **Third Normal Form (3NF)**: Structured to eliminate redundant nutritional and user information.
2. **Referential Integrity**: Robust `FOREIGN KEY` constraints with `ON DELETE CASCADE` or `ON DELETE RESTRICT` to prevent orphaned records.
3. **Data Security**: Password hashes (bcrypt, cost factor 10) are stored; no plaintext credentials exist.
4. **Optimized Indexes**: Indexed on foreign keys (`user_id`), fulltext/search queries (`food_name`, `category`), and dates (`meal_date`, `intake_date`, `recorded_date`) for sub-millisecond retrieval.
5. **Strict Data Types**: Fixed-precision `DECIMAL(8,2)` used for macros, calories, and body measurements to eliminate IEEE 754 floating-point inaccuracies.

## Relational Tables Summary
1. `users`: Core authentication table (`user_id`, `name`, `email`, `password_hash`, `created_at`, `updated_at`).
2. `user_profiles`: Physical attributes and fitness goals (`age`, `gender`, `height_cm`, `weight_kg`, `activity_level`, `fitness_goal`).
3. `nutrition_goals`: Personalized daily targets (`daily_calories`, `protein_g`, `carbs_g`, `fat_g`, `water_ml`, `bmi`, `bmr`, `tdee`).
4. `foods`: Comprehensive nutritional reference database normalized strictly to per-100g values.
5. `meals`: Meal logs organized by user, date, and meal type (Breakfast, Lunch, Dinner, Snacks).
6. `meal_items`: Individual food items logged within a meal, tracking exact quantity in grams and dynamically computed nutrition.
7. `meal_plans`: Future/daily planned meal combinations.
8. `meal_plan_items`: Foods allocated to specific meal plan slots.
9. `water_intake`: Timestamped hydration logs per user per day.
10. `weight_history`: Historical weight measurements for tracking fitness progress over time.
11. `ai_recommendations`: Audit log of AI recommendations generated, nutritional gaps detected, and rationales provided.

## Setup Instructions

### Option A: Command-Line (macOS / Linux)
```bash
# 1. Ensure MySQL server is running
# 2. Run the DDL schema to create database and tables
mysql -u root -p < database/schema.sql

# 3. Seed initial real nutritional foods and demo user
mysql -u root -p fitmaster_ai < database/seed.sql
```

### Option B: Windows Command Prompt / PowerShell
```cmd
# Navigate to the project root
mysql -u root -p < database\schema.sql
mysql -u root -p fitmaster_ai < database\seed.sql
```

### Option C: MySQL Workbench (GUI)
1. Open MySQL Workbench and connect to your local MySQL instance.
2. Go to **File -> Open SQL Script...** and select `database/schema.sql`.
3. Click the **Execute (Lightning icon)** button.
4. Open `database/seed.sql` and execute it.
5. Refresh the Schemas panel; verify that `fitmaster_ai` and all 11 tables are populated.

---

## Verifying Connection & Health
Update your credentials in `.env` (or copy from `.env.example`):
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=fitmaster_ai
```

Then run the automated database diagnostic script:
```bash
cd backend
npm run db:test
```
A successful response will output:
```
[Database Connection]: SUCCESS
  MySQL Version  : 8.x.x
  Active Database: fitmaster_ai
  Host / Port    : localhost:3306
  User           : root
```
