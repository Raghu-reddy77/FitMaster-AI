# FitMaster AI – Nutritional Dataset & ETL Ingestion Pipeline

## 1. Overview
The nutritional engine of **FitMaster AI** is powered by authentic, verified food composition data sourced from the **USDA FoodData Central** and the **Indian Nutrient Databank** (Anuvaad). All food items are strictly standardized to **100 grams** ($100\text{g}$) portions to enable linear, dynamic proportional calculations when users log custom serving weights.

## 2. Directory Layout
```
dataset/
├── raw/
│   └── usda_and_in_nutrition_raw.csv    # Original raw nutrient values from USDA & IN Databank
├── processed/
│   └── cleaned_foods.csv                # Standardized, cleaned, and categorized dataset (per 100g)
├── scripts/
│   ├── preprocess_dataset.py            # Pandas data normalization & deduplication script
│   └── import_to_mysql.js               # Node.js batch ingestion script into MySQL fitmaster_ai.foods
└── README.md
```

## 3. Data Sources & Provenance
1. **Primary**: [Indian Nutrient Databank (Anuvaad)](https://www.anuvaad.org.in/indian-nutrient-databank/)
   - Focus: Regional Indian staples, pulses (Dal), chapati/roti, paneer, and local leafy greens.
2. **Secondary**: [USDA FoodData Central (FDC)](https://fdc.nal.usda.gov/download-datasets/)
   - Focus: Foundation foods, fruits, vegetables, lean poultry, salmon, and whole grains.

## 4. Canonical Food Categories
Every food item is mapped to one of nine standardized categories:
- `Grains & Cereals` (Rice, Oats, Roti, Quinoa, Bread, Millets)
- `Legumes & Pulses` (Dal, Chickpeas/Chole, Rajma, Soybeans, Lobia)
- `Dairy & Alternatives` (Paneer, Greek Yogurt, Skimmed Milk, Tofu)
- `Poultry & Meat` (Chicken Breast, Turkey, Eggs)
- `Fish & Seafood` (Salmon, Tilapia, Tuna, Rohu, Pomfret, Prawns)
- `Vegetables` (Spinach, Broccoli, Peas, Bell Peppers, Bitter Gourd)
- `Fruits` (Apple, Banana, Guava, Papaya, Orange, Blueberries)
- `Nuts & Seeds` (Almonds, Walnuts, Chia Seeds, Flax Seeds, Peanut Butter)
- `Oils & Fats` (Extra Virgin Olive Oil, Mustard Oil, Cow Ghee)

## 5. Schema of Processed Foods Table (`foods`)
| Field | Type | Description |
|---|---|---|
| `food_id` | INT AUTO_INCREMENT | Unique food ID |
| `food_name` | VARCHAR(255) | Clean, readable title name |
| `category` | VARCHAR(100) | Canonical food category |
| `calories_per_100g` | DECIMAL(8,2) | Energy in kilocalories per 100 grams |
| `protein_per_100g` | DECIMAL(8,2) | Protein in grams per 100g |
| `carbs_per_100g` | DECIMAL(8,2) | Total carbohydrates in grams per 100g |
| `fat_per_100g` | DECIMAL(8,2) | Total dietary lipids in grams per 100g |
| `fibre_per_100g` | DECIMAL(8,2) | Dietary fibre in grams per 100g |
| `serving_size` | VARCHAR(100) | Familiar household measure (e.g., "1 cup (195g)") |
| `source` | VARCHAR(150) | Attribution ("USDA FoodData Central" or "Indian Nutrient Databank") |

## 6. How to Run the Dataset Pipeline

### Step 1: Preprocess and Clean Raw Data
```bash
python3 dataset/scripts/preprocess_dataset.py
```
This script reads the raw data, applies Pandas transformations, strips extra characters, standardizes numbers, synchronizes with the AI microservice folder (`ai-service/datasets/processed/cleaned_foods.csv`), and prints statistical summaries.

### Step 2: Ingest into MySQL Database
Ensure MySQL is running, configure credentials in `.env`, and execute:
```bash
node dataset/scripts/import_to_mysql.js
```
*(Alternatively, execute `database/seed.sql` inside MySQL or MySQL Workbench).*
