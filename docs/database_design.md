# Database Design & Entity Relationship Specifications

## 1. Database Specifications
- **Database Engine**: MySQL 8.0+
- **Collation**: `utf8mb4_unicode_ci`
- **Database Name**: `fitmaster_ai`

## 2. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    users ||--o| user_profiles : "has profile"
    users ||--o| nutrition_goals : "has goals"
    users ||--o{ meals : "logs"
    users ||--o{ water_intake : "records"
    users ||--o{ weight_history : "tracks"
    users ||--o{ meal_plans : "schedules"
    users ||--o{ ai_recommendations : "receives"
    
    meals ||--o{ meal_items : "contains"
    foods ||--o{ meal_items : "referenced in"
    
    meal_plans ||--o{ meal_plan_items : "contains"
    foods ||--o{ meal_plan_items : "referenced in"

    users {
        int user_id PK
        varchar name
        varchar email UK
        varchar password_hash
        datetime created_at
        datetime updated_at
    }

    user_profiles {
        int profile_id PK
        int user_id FK,UK
        int age
        enum gender
        decimal height_cm
        decimal weight_kg
        enum activity_level
        enum fitness_goal
        datetime updated_at
    }

    nutrition_goals {
        int goal_id PK
        int user_id FK,UK
        decimal daily_calories
        decimal protein_g
        decimal carbs_g
        decimal fat_g
        decimal water_ml
        decimal bmi
        decimal bmr
        decimal tdee
        datetime calculated_at
    }

    foods {
        int food_id PK
        varchar food_name
        varchar category
        decimal calories_per_100g
        decimal protein_per_100g
        decimal carbs_per_100g
        decimal fat_per_100g
        decimal fibre_per_100g
        varchar serving_size
        varchar source
    }

    meals {
        int meal_id PK
        int user_id FK
        date meal_date
        enum meal_type
        decimal total_calories
        decimal total_protein
        decimal total_carbs
        decimal total_fat
        datetime created_at
    }

    meal_items {
        int item_id PK
        int meal_id FK
        int food_id FK
        decimal quantity_grams
        decimal calories
        decimal protein
        decimal carbs
        decimal fat
    }

    water_intake {
        int intake_id PK
        int user_id FK
        date intake_date
        int amount_ml
        datetime logged_at
    }

    weight_history {
        int weight_id PK
        int user_id FK
        date recorded_date
        decimal weight_kg
        datetime created_at
    }

    meal_plans {
        int plan_id PK
        int user_id FK
        date plan_date
        varchar plan_name
        decimal target_calories
        datetime created_at
    }

    meal_plan_items {
        int plan_item_id PK
        int plan_id FK
        int food_id FK
        enum meal_type
        decimal quantity_grams
    }

    ai_recommendations {
        int recommendation_id PK
        int user_id FK
        date recommendation_date
        varchar gap_type
        text food_suggestions_json
        text rationale
        varchar model_version
        datetime created_at
    }
```

## 3. Relational Normalization & Constraints
- **Primary Keys**: Every table uses an auto-increment integer or composite key.
- **Unique Constraints**: `users(email)`, `user_profiles(user_id)`, `nutrition_goals(user_id)`.
- **Foreign Keys**: Enforce referential integrity with cascading updates and deletes where appropriate (`ON DELETE CASCADE`).
- **Indexes**:
  - `idx_foods_search`: Index on `foods(food_name, category)`.
  - `idx_meals_user_date`: Composite index on `meals(user_id, meal_date)`.
  - `idx_water_user_date`: Composite index on `water_intake(user_id, intake_date)`.
  - `idx_weight_user_date`: Composite index on `weight_history(user_id, recorded_date)`.
