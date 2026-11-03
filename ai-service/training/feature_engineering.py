"""
FitMaster AI – Feature Engineering & Labeled Dataset Pipeline
Constructs realistic, grounded biometric and nutritional intake training samples
for supervising the Nutrition Gap Classifier and Category Recommender.
"""

import os
import numpy as np
import pandas as pd

OUTPUT_CSV = os.path.abspath(os.path.join(os.path.dirname(__file__), "../datasets/processed/ml_training_data.csv"))
os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)

def generate_labeled_nutrition_dataset(num_samples: int = 3000, random_state: int = 42) -> pd.DataFrame:
    """
    Generate synthetic yet clinically calibrated user intake states paired with
    rigorous ground-truth gap classifications and optimal category recommendations.
    """
    np.random.seed(random_state)

    # 1. Biometrics
    ages = np.random.randint(18, 65, size=num_samples)
    genders = np.random.choice(['male', 'female'], size=num_samples, p=[0.52, 0.48])
    heights_cm = np.where(genders == 'male', np.random.normal(176, 7, num_samples), np.random.normal(163, 6, num_samples))
    heights_cm = np.clip(heights_cm, 145, 205)

    weights_kg = np.where(genders == 'male', np.random.normal(78, 12, num_samples), np.random.normal(64, 10, num_samples))
    weights_kg = np.clip(weights_kg, 42, 130)

    bmis = weights_kg / ((heights_cm / 100.0) ** 2)

    activity_levels = np.random.choice(
        ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
        size=num_samples,
        p=[0.25, 0.30, 0.25, 0.15, 0.05]
    )
    activity_factors = np.array([{
        'sedentary': 1.2,
        'lightly_active': 1.375,
        'moderately_active': 1.55,
        'very_active': 1.725,
        'extra_active': 1.9
    }[a] for a in activity_levels])

    goals = np.random.choice(['weight_loss', 'weight_maintenance', 'lean_muscle_gain'], size=num_samples, p=[0.40, 0.30, 0.30])
    goal_offsets = np.array([{
        'weight_loss': -500.0,
        'weight_maintenance': 0.0,
        'lean_muscle_gain': 350.0
    }[g] for g in goals])

    # Mifflin-St Jeor BMR
    base_bmr = 10 * weights_kg + 6.25 * heights_cm - 5 * ages
    bmrs = np.where(genders == 'male', base_bmr + 5, base_bmr - 161)
    tdees = bmrs * activity_factors
    target_calories = np.maximum(1200.0, tdees + goal_offsets)

    # Protein factors
    protein_factors = np.array([{
        'weight_loss': 2.0,
        'weight_maintenance': 1.6,
        'lean_muscle_gain': 2.2
    }[g] for g in goals])
    target_proteins = protein_factors * weights_kg
    target_fats = (target_calories * 0.25) / 9.0
    target_carbs = np.maximum(50.0, (target_calories - (target_proteins * 4) - (target_fats * 9)) / 4.0)

    # 2. Simulated Current Intake Ratios (Morning, Mid-Day, Evening states)
    # Range from under-eating to severe over-eating
    intake_patterns = np.random.choice([
        'early_day_low_protein',     # Cal 30-50%, P 15-35%
        'high_calorie_low_protein',   # Cal 85-110%, P 40-60%
        'excess_surplus',             # Cal 115-140%, P 90-120%
        'balanced_track',             # Cal 85-105%, P 85-105%
        'severe_undereating'          # Cal 15-35%, P 15-30%
    ], size=num_samples, p=[0.30, 0.25, 0.15, 0.20, 0.10])

    cal_ratios = []
    p_ratios = []
    c_ratios = []
    f_ratios = []
    gap_labels = []
    target_categories = []

    for pattern in intake_patterns:
        if pattern == 'early_day_low_protein':
            c_r = np.random.uniform(0.30, 0.65)
            p_r = np.random.uniform(0.20, 0.55)
            gap_labels.append('protein_deficit_and_calories_available')
            target_categories.append('Poultry & Meat')
        elif pattern == 'high_calorie_low_protein':
            c_r = np.random.uniform(0.85, 1.05)
            p_r = np.random.uniform(0.40, 0.70)
            gap_labels.append('protein_deficit_low_calories')
            target_categories.append('Dairy & Alternatives')
        elif pattern == 'excess_surplus':
            c_r = np.random.uniform(1.15, 1.45)
            p_r = np.random.uniform(0.90, 1.25)
            gap_labels.append('calorie_surplus')
            target_categories.append('Vegetables')
        elif pattern == 'severe_undereating':
            c_r = np.random.uniform(0.15, 0.40)
            p_r = np.random.uniform(0.15, 0.35)
            gap_labels.append('under_eating_severe')
            target_categories.append('Grains & Cereals')
        else:
            # balanced_track
            c_r = np.random.uniform(0.85, 1.05)
            p_r = np.random.uniform(0.85, 1.10)
            gap_labels.append('balanced_intake')
            target_categories.append('Legumes & Pulses')

        cal_ratios.append(c_r)
        p_ratios.append(p_r)
        c_ratios.append(np.clip(c_r + np.random.normal(0, 0.08), 0.1, 1.5))
        f_ratios.append(np.clip(c_r + np.random.normal(0, 0.08), 0.1, 1.5))

    cal_ratios = np.array(cal_ratios)
    p_ratios = np.array(p_ratios)
    c_ratios = np.array(c_ratios)
    f_ratios = np.array(f_ratios)

    consumed_cals = target_calories * cal_ratios
    consumed_proteins = target_proteins * p_ratios
    consumed_carbs = target_carbs * c_ratios
    consumed_fats = target_fats * f_ratios

    rem_calories = np.maximum(0.0, target_calories - consumed_cals)
    rem_proteins = np.maximum(0.0, target_proteins - consumed_proteins)

    # Encode gender
    gender_encoded = np.where(genders == 'male', 1.0, 0.0)

    df = pd.DataFrame({
        'age': ages,
        'gender_encoded': gender_encoded,
        'height_cm': heights_cm.round(1),
        'weight_kg': weights_kg.round(1),
        'bmi': bmis.round(2),
        'activity_factor': activity_factors.round(3),
        'goal_offset': goal_offsets,
        'target_calories': target_calories.round(1),
        'consumed_cal_ratio': cal_ratios.round(3),
        'consumed_protein_ratio': p_ratios.round(3),
        'consumed_carbs_ratio': c_ratios.round(3),
        'consumed_fat_ratio': f_ratios.round(3),
        'remaining_calories': rem_calories.round(1),
        'remaining_protein': rem_proteins.round(1),
        'gap_label': gap_labels,
        'recommended_category': target_categories
    })

    df.to_csv(OUTPUT_CSV, index=False)
    print(f"[Feature Engineering]: Generated {len(df)} samples saved to {OUTPUT_CSV}")
    return df

if __name__ == "__main__":
    generate_labeled_nutrition_dataset()
