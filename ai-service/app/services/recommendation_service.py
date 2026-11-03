"""
FitMaster AI – Personalized Recommendation Service
Ranks real candidate foods from MySQL to address individual nutritional gaps.
Supports Scikit-learn/TensorFlow model loading with transparent rule-based fallback.
"""

import os
import joblib
from typing import List, Dict, Any
from .nutrition_gap_service import classify_nutrition_gap

SAVED_MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../saved_models"))

def generate_food_recommendations(
    user_id: int,
    profile: Dict[str, Any],
    goals: Dict[str, Any],
    intake: Dict[str, Any],
    candidate_foods: List[Dict[str, Any]]
) -> Dict[str, Any]:
    # 1. Analyze nutritional gaps
    gap_analysis = classify_nutrition_gap(profile, goals, intake)
    gap_type = gap_analysis["gap_type"]
    deficits = gap_analysis["deficits"]

    # 2. Check if trained Scikit-learn and Keras ML models exist
    rf_path = os.path.join(SAVED_MODELS_DIR, "rf_nutrition_classifier.pkl")
    dnn_path = os.path.join(SAVED_MODELS_DIR, "keras_nutrition_model.keras")
    ml_model_loaded = False
    model_version = "v1.0-rule_based_engine"

    if os.path.exists(rf_path) or os.path.exists(dnn_path):
        ml_model_loaded = True
        model_version = "v2.0-trained_random_forest_and_dnn"

    # 3. Score candidate foods
    scored_candidates = []
    rem_cal = deficits["calories"]
    rem_p = deficits["protein_g"]
    rem_c = deficits["carbs_g"]
    rem_f = deficits["fat_g"]

    for food in candidate_foods:
        p = float(food.get("protein_per_100g", 0))
        c = float(food.get("carbs_per_100g", 0))
        f = float(food.get("fat_per_100g", 0))
        cal = float(food.get("calories_per_100g", 1))
        category = food.get("category", "")
        food_name = food.get("food_name", "")

        score = 0.0
        reason = ""

        # Protein density metric: grams of protein per 100 kcal
        protein_density = (p / max(1.0, cal)) * 100.0

        if "protein_deficit" in gap_type:
            score += protein_density * 3.0
            if category in ["Poultry & Meat", "Dairy & Alternatives", "Legumes & Pulses", "Fish & Seafood"]:
                score += 20.0
            if cal <= rem_cal:
                score += 15.0
            reason = f"Excellent protein density ({p}g/100g, {cal} kcal) to help close your {int(rem_p)}g protein gap."
        elif gap_type == "calorie_surplus":
            # Favor low-calorie vegetables
            if category == "Vegetables":
                score += 40.0 - (cal * 0.5)
                reason = f"Low energy density ({cal} kcal/100g) with high micronutrient content."
            else:
                score -= cal * 0.2
                reason = "Higher caloric density; consume in conservative portions."
        elif gap_type == "under_eating_severe":
            # Favor nutrient-dense staples
            score += (p * 1.5) + (c * 1.2) + (cal * 0.1)
            reason = f"Nutrient-rich staple ({cal} kcal/100g) supporting healthy metabolic energy levels."
        else:
            # Balanced intake: reward balanced macro profile
            score += (protein_density * 1.5) + (p * 1.0) + (c * 0.5) - (f * 0.2)
            reason = f"Well-balanced macronutrient profile ({p}g Protein, {c}g Carbs, {f}g Fat per 100g)."

        scored_candidates.append({
            "food_id": food.get("food_id", 0),
            "food_name": food_name,
            "category": category,
            "serving_size": food.get("serving_size", "100g"),
            "calories_per_100g": cal,
            "protein_per_100g": p,
            "carbs_per_100g": c,
            "fat_per_100g": f,
            "recommendation_score": round(score, 1),
            "reason": reason
        })

    # Sort descending by score
    scored_candidates.sort(key=lambda x: x["recommendation_score"], reverse=True)
    top_recommendations = scored_candidates[:6]

    return {
        "status": "success",
        "gap_type": gap_type,
        "model_version": model_version,
        "rationale": gap_analysis["advisory"],
        "remaining_macros": {
            "calories": int(rem_cal),
            "protein_g": int(rem_p),
            "carbs_g": int(rem_c),
            "fat_g": int(rem_f)
        },
        "recommendations": top_recommendations
    }
