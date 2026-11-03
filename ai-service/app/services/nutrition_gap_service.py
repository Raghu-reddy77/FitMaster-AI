"""
FitMaster AI – Nutrition Gap Classification Engine
Evaluates daily intake against personalized metabolic targets to diagnose nutrient deficits and excesses.
"""

from typing import Dict, Any

def classify_nutrition_gap(profile: Dict[str, Any], goals: Dict[str, Any], intake: Dict[str, Any]) -> Dict[str, Any]:
    target_cal = float(goals.get("daily_calories", 2000))
    target_p = float(goals.get("protein_g", 150))
    target_c = float(goals.get("carbs_g", 250))
    target_f = float(goals.get("fat_g", 65))

    consumed_cal = float(intake.get("calories", 0))
    consumed_p = float(intake.get("protein", 0))
    consumed_c = float(intake.get("carbs", 0))
    consumed_f = float(intake.get("fat", 0))

    # Calculate ratios
    cal_ratio = consumed_cal / target_cal if target_cal > 0 else 0
    p_ratio = consumed_p / target_p if target_p > 0 else 0
    c_ratio = consumed_c / target_c if target_c > 0 else 0
    f_ratio = consumed_f / target_f if target_f > 0 else 0

    def get_status(ratio: float) -> str:
        if ratio < 0.85:
            return "Deficit"
        elif ratio <= 1.15:
            return "Balanced"
        else:
            return "Surplus"

    cal_status = get_status(cal_ratio)
    p_status = get_status(p_ratio)
    c_status = get_status(c_ratio)
    f_status = get_status(f_ratio)

    # Classify overall gap type
    if cal_ratio > 1.10:
        gap_type = "calorie_surplus"
        advisory = (
            f"You have exceeded your daily calorie baseline by {int(consumed_cal - target_cal)} kcal. "
            "For the remainder of the day, prioritize hydration and low-calorie density green vegetables."
        )
    elif p_ratio < 0.70 and cal_ratio < 0.85:
        gap_type = "protein_deficit_and_calories_available"
        advisory = (
            f"Your protein intake is currently at {int(p_ratio * 100)}% of your target with {int(target_cal - consumed_cal)} kcal remaining. "
            "Prioritize lean protein sources such as Chicken Breast, Greek Yogurt, Paneer, or Dal to hit your daily requirement."
        )
    elif p_ratio < 0.75 and cal_ratio >= 0.85:
        gap_type = "protein_deficit_low_calories"
        advisory = (
            "You have an ongoing protein deficit but are nearing your daily calorie allocation. "
            "Opt for ultra-lean, low-fat protein sources like Egg Whites or Low-Fat Paneer to minimize caloric overshoot."
        )
    elif c_ratio > 1.15 and p_ratio < 0.80:
        gap_type = "carb_heavy_protein_deficit"
        advisory = (
            "Your diet today is heavily carbohydrate-skewed relative to protein. "
            "Rebalance your upcoming meals with high-protein legumes or dairy alternatives."
        )
    elif cal_ratio < 0.50:
        gap_type = "under_eating_severe"
        advisory = (
            "Your energy consumption today is significantly below your Basal Metabolic Rate (BMR). "
            "Ensure you consume sufficient wholesome meals to prevent metabolic slowdown."
        )
    else:
        gap_type = "balanced_intake"
        advisory = (
            "Your macronutrient distribution is well-aligned with your metabolic goals. "
            "Continue with balanced whole-food meals."
        )

    return {
        "status": "success",
        "gap_type": gap_type,
        "calories_status": cal_status,
        "protein_status": p_status,
        "carbs_status": c_status,
        "fat_status": f_status,
        "deficits": {
            "calories": round(max(0.0, target_cal - consumed_cal), 1),
            "protein_g": round(max(0.0, target_p - consumed_p), 1),
            "carbs_g": round(max(0.0, target_c - consumed_c), 1),
            "fat_g": round(max(0.0, target_f - consumed_f), 1)
        },
        "advisory": advisory,
        "model_version": "v1.2-hybrid_classifier"
    }
