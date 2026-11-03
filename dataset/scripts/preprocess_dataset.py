#!/usr/bin/env python3
"""
FitMaster AI – Dataset Preprocessing & Standardization Pipeline
Uses Pandas to clean, normalize, categorize, and standardize nutritional datasets
from USDA FoodData Central and Indian Nutrient Databank (Anuvaad) into per-100g metrics.
"""

import os
import sys
import shutil
import pandas as pd
import numpy as np

# Canonical food categories
CATEGORY_MAP = {
    'Cereal Grains and Pasta': 'Grains & Cereals',
    'Grains and Millets': 'Grains & Cereals',
    'Breakfast Cereals': 'Grains & Cereals',
    'Baked Products': 'Grains & Cereals',
    'Grain Legumes': 'Legumes & Pulses',
    'Legumes and Legume Products': 'Legumes & Pulses',
    'Milk and Milk Products': 'Dairy & Alternatives',
    'Dairy and Egg Products': 'Dairy & Alternatives',
    'Dairy Alternatives': 'Dairy & Alternatives',
    'Poultry Products': 'Poultry & Meat',
    'Meat and Poultry': 'Poultry & Meat',
    'Beef Products': 'Poultry & Meat',
    'Finfish and Shellfish Products': 'Fish & Seafood',
    'Fish and Seafood': 'Fish & Seafood',
    'Vegetables and Vegetable Products': 'Vegetables',
    'Green Leafy Vegetables': 'Vegetables',
    'Fruits and Fruit Juices': 'Fruits',
    'Nut and Seed Products': 'Nuts & Seeds',
    'Fats and Oils': 'Oils & Fats'
}

def clean_food_name(name: str) -> str:
    """Normalize raw food names into readable, clean title strings."""
    if not isinstance(name, str):
        return "Unknown Food"

    cleaned = name.strip()
    
    # Specific common replacements for cleaner display
    replacements = [
        ("Rice, white, long-grain, parboiled, enriched, dry cooked", "White Rice (Parboiled, Cooked)"),
        ("Brown rice, medium-grain, cooked", "Brown Rice (Cooked)"),
        ("Oats, rolled, raw", "Rolled Oats (Raw)"),
        ("Wheat flour, whole-grain, chapati/roti", "Whole Wheat Roti / Chapati"),
        ("Quinoa, cooked", "Quinoa (Cooked)"),
        ("Bread, whole-wheat, commercially prepared", "Whole Wheat Bread"),
        ("Bread, white, commercially prepared", "White Bread"),
        ("Pasta, whole-wheat, cooked", "Whole Wheat Pasta (Cooked)"),
        ("Chickpeas (Chole/Garbanzo), mature seeds, cooked", "Chickpeas / Chana (Cooked)"),
        ("Kidney beans (Rajma), all types, mature seeds, cooked", "Kidney Beans / Rajma (Cooked)"),
        ("Black beans, mature seeds, cooked", "Black Beans (Cooked)"),
        ("Soybeans, mature seeds, cooked, boiled", "Soybeans (Boiled)"),
        ("Black-eyed peas (Cowpeas/Lobia), cooked", "Black-Eyed Peas / Lobia (Cooked)"),
        ("Greek Yogurt, plain, nonfat", "Greek Yogurt (Nonfat, Plain)"),
        ("Milk, whole, 3.25% milkfat", "Whole Milk (Cow)"),
        ("Milk, nonfat, skim", "Skimmed Milk"),
        ("Cheese, cheddar", "Cheddar Cheese"),
        ("Cheese, mozzarella, whole milk", "Mozzarella Cheese"),
        ("Tofu, firm, prepared with calcium sulfate", "Firm Tofu"),
        ("Chicken, breast, meat only, cooked, grilled", "Chicken Breast (Skinless, Grilled)"),
        ("Chicken, thigh, meat only, cooked, roasted", "Chicken Thigh (Skinless, Roasted)"),
        ("Chicken, drumstick, meat only, cooked, roasted", "Chicken Drumstick (Cooked)"),
        ("Turkey, breast, meat only, cooked, roasted", "Turkey Breast (Roasted)"),
        ("Egg, whole, cooked, hard-boiled", "Whole Egg (Hard-Boiled)"),
        ("Egg, white, cooked, boiled", "Egg White (Boiled)"),
        ("Fish, salmon, Atlantic, wild, cooked", "Atlantic Salmon (Baked)"),
        ("Fish, tilapia, cooked, dry heat", "Tilapia Fillet (Cooked)"),
        ("Fish, tuna, light, canned in water, drained", "Canned Tuna (in Water)"),
        ("Crustaceans, shrimp, mixed species, cooked, moist heat", "Shrimp / Prawns (Steamed)"),
        ("Beef, ground, 90% lean meat / 10% fat, cooked", "Lean Ground Beef (90/10 Cooked)"),
        ("Spinach, raw (Palak)", "Spinach / Palak (Raw)"),
        ("Fenugreek leaves (Methi), raw", "Fenugreek Leaves / Methi (Raw)"),
        ("Mustard greens (Sarson), raw", "Mustard Greens / Sarson (Raw)"),
        ("Broccoli, steamed", "Broccoli (Steamed)"),
        ("Cauliflower, cooked (Gobi)", "Cauliflower / Gobi (Cooked)"),
        ("Peas, green, cooked, boiled", "Green Peas (Boiled)"),
        ("Carrots, mature, raw", "Carrots (Raw)"),
        ("Beets, raw (Chukandar)", "Beetroot (Raw)"),
        ("Tomatoes, red, ripe, raw", "Tomatoes (Ripe, Raw)"),
        ("Cucumber, with peel, raw", "Cucumber (Raw)"),
        ("Peppers, sweet, green, raw (Capsicum)", "Green Bell Pepper / Capsicum (Raw)"),
        ("Peppers, sweet, red, raw", "Red Bell Pepper (Raw)"),
        ("Mushrooms, white, raw", "Button Mushrooms (Raw)"),
        ("Bitter gourd (Karela), raw", "Bitter Gourd / Karela (Raw)"),
        ("Bottle gourd (Lauki), raw", "Bottle Gourd / Lauki (Raw)"),
        ("Okra (Bhindi), raw", "Okra / Bhindi (Raw)"),
        ("Apple, raw, with skin", "Apple (with skin, Raw)"),
        ("Bananas, raw", "Banana (Raw)"),
        ("Oranges, raw, navels", "Orange (Navel, Raw)"),
        ("Mangos, raw", "Mango (Ripe, Raw)"),
        ("Guavas, common, raw (Amrood)", "Guava / Amrood (Raw)"),
        ("Papayas, raw", "Papaya (Raw)"),
        ("Watermelon, raw", "Watermelon (Raw)"),
        ("Pomegranates, raw (Anar)", "Pomegranate / Anar (Raw)"),
        ("Strawberries, raw", "Strawberries (Raw)"),
        ("Blueberries, raw", "Blueberries (Raw)"),
        ("Grapes, red or green, raw", "Grapes (Raw)"),
        ("Nuts, almonds, raw", "Almonds (Raw)"),
        ("Nuts, walnuts, English", "Walnuts (Raw)"),
        ("Nuts, cashew nuts, raw", "Cashew Nuts (Raw)"),
        ("Nuts, pistachio nuts, raw", "Pistachio Nuts (Raw)"),
        ("Peanuts, all types, dry-roasted, without salt", "Peanuts (Roasted, Unsalted)"),
        ("Seeds, chia seeds, dried", "Chia Seeds (Dried)"),
        ("Seeds, flaxseed", "Flax Seeds"),
        ("Seeds, pumpkin and squash seed kernels, roasted, without salt", "Pumpkin Seeds (Roasted)"),
        ("Peanut butter, smooth style, without salt", "Natural Peanut Butter"),
        ("Oil, olive, extra virgin", "Extra Virgin Olive Oil"),
        ("Mustard oil, pure", "Mustard Oil (Pure)"),
        ("Ghee (Clarified Butter), cow milk", "Cow Ghee (Clarified Butter)"),
        ("Oil, coconut", "Coconut Oil")
    ]

    for raw, replacement in replacements:
        if raw.lower() in cleaned.lower():
            return replacement

    # Handle egg whites/dairy categories that might be mapped to Poultry Products vs Dairy
    return cleaned.title()

def preprocess_datasets():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "../.."))
    raw_path = os.path.join(project_root, "dataset/raw/usda_and_in_nutrition_raw.csv")
    processed_dir = os.path.join(project_root, "dataset/processed")
    processed_path = os.path.join(processed_dir, "cleaned_foods.csv")
    ai_processed_dir = os.path.join(project_root, "ai-service/datasets/processed")
    ai_processed_path = os.path.join(ai_processed_dir, "cleaned_foods.csv")

    print("==========================================================")
    print("   FitMaster AI – Dataset Preprocessing & Ingestion Pipeline")
    print("==========================================================")
    print(f"[Input] Raw Dataset Path: {raw_path}")

    if not os.path.exists(raw_path):
        print(f"[Error] Raw dataset file not found at: {raw_path}")
        sys.exit(1)

    # 1. Load Raw CSV into Pandas DataFrame
    df = pd.read_csv(raw_path)
    initial_rows = len(df)
    print(f"[Pipeline]: Loaded {initial_rows} raw records from USDA & Indian Nutrient Databank.")

    # 2. Check for missing values and fill non-critical metrics with 0.0
    df['energy_kcal'] = pd.to_numeric(df['energy_kcal'], errors='coerce').fillna(0.0)
    df['protein_g'] = pd.to_numeric(df['protein_g'], errors='coerce').fillna(0.0)
    df['carbohydrates_g'] = pd.to_numeric(df['carbohydrates_g'], errors='coerce').fillna(0.0)
    df['fat_g'] = pd.to_numeric(df['fat_g'], errors='coerce').fillna(0.0)
    df['fibre_g'] = pd.to_numeric(df['fibre_g'], errors='coerce').fillna(0.0)

    # 3. Standardize Food Names
    df['food_name'] = df['food_name_raw'].apply(clean_food_name)

    # 4. Standardize Food Categories
    df['category'] = df['food_group_raw'].map(CATEGORY_MAP)
    # Special overrides for eggs
    df.loc[df['food_name'].str.contains('Egg', case=False, na=False), 'category'] = 'Poultry & Meat'
    # Fallback any unmapped categories
    df['category'] = df['category'].fillna('Snacks & Other')

    # 5. Format Column Names matching MySQL schema
    df_clean = pd.DataFrame({
        'food_name': df['food_name'],
        'category': df['category'],
        'calories_per_100g': df['energy_kcal'].round(2),
        'protein_per_100g': df['protein_g'].round(2),
        'carbs_per_100g': df['carbohydrates_g'].round(2),
        'fat_per_100g': df['fat_g'].round(2),
        'fibre_per_100g': df['fibre_g'].round(2),
        'serving_size': df['portion_description'].fillna('100g'),
        'source': df['data_source'].fillna('USDA FoodData Central')
    })

    # 6. Remove Duplicates
    df_clean = df_clean.drop_duplicates(subset=['food_name'], keep='first')
    final_rows = len(df_clean)
    print(f"[Pipeline]: Deduped to {final_rows} standardized food items.")

    # 7. Sort by Category and Food Name
    df_clean = df_clean.sort_values(by=['category', 'food_name']).reset_index(drop=True)

    # 8. Export to Processed CSV
    os.makedirs(processed_dir, exist_ok=True)
    df_clean.to_csv(processed_path, index=False)
    print(f"[Pipeline]: Exported cleaned dataset to {processed_path}")

    # Also synchronize to ai-service/datasets/processed/ for ML training
    os.makedirs(ai_processed_dir, exist_ok=True)
    shutil.copyfile(processed_path, ai_processed_path)
    print(f"[Pipeline]: Synchronized dataset to AI microservice at {ai_processed_path}")

    # 9. Statistical Verification Summary
    print("\n[Dataset Breakdown by Category]:")
    category_counts = df_clean['category'].value_counts()
    for cat, count in category_counts.items():
        print(f"  • {cat:<24}: {count:>2} records")

    print("\n[Macro Summary (Mean per 100g)]:")
    print(f"  • Calories: {df_clean['calories_per_100g'].mean():.1f} kcal")
    print(f"  • Protein : {df_clean['protein_per_100g'].mean():.1f} g")
    print(f"  • Carbs   : {df_clean['carbs_per_100g'].mean():.1f} g")
    print(f"  • Fat     : {df_clean['fat_per_100g'].mean():.1f} g")
    print(f"  • Fibre   : {df_clean['fibre_per_100g'].mean():.1f} g")
    print("==========================================================")
    print("✓ Preprocessing Complete: Ready for MySQL batch import.")
    print("==========================================================")

if __name__ == "__main__":
    preprocess_datasets()
