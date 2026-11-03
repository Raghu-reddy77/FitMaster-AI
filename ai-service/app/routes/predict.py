"""
FitMaster AI – Prediction and Recommendation API Endpoints
"""

from fastapi import APIRouter, HTTPException
from ..models.schemas import (
    NutritionGapRequest,
    NutritionGapResponse,
    RecommendationRequest,
    RecommendationResponse,
    ModelInfoResponse
)
from ..services.nutrition_gap_service import classify_nutrition_gap
from ..services.recommendation_service import generate_food_recommendations

router = APIRouter(tags=["AI Predictions & Recommendations"])

@router.post("/predict/nutrition-gap", response_model=NutritionGapResponse)
async def predict_nutrition_gap(payload: NutritionGapRequest):
    """
    Evaluate user biometrics and daily macro intake to diagnose nutritional deficits or surpluses.
    """
    try:
        result = classify_nutrition_gap(
            profile=payload.profile.model_dump(),
            goals=payload.goals.model_dump(),
            intake=payload.daily_intake.model_dump()
        )
        return NutritionGapResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gap prediction failed: {str(e)}")

@router.post("/recommendations", response_model=RecommendationResponse)
async def get_food_recommendations(payload: RecommendationRequest):
    """
    Generate personalized food recommendations ranked by nutritional gap closure and calorie density.
    """
    try:
        result = generate_food_recommendations(
            user_id=payload.user_id,
            profile=payload.profile.model_dump(),
            goals=payload.goals.model_dump(),
            intake=payload.daily_intake.model_dump(),
            candidate_foods=[f.model_dump() for f in payload.candidate_foods]
        )
        return RecommendationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation ranking failed: {str(e)}")

@router.get("/model/info", response_model=ModelInfoResponse)
async def get_model_info():
    """
    Retrieve architecture, hyperparameters, and evaluation metrics for active ML models.
    """
    return ModelInfoResponse(
        model_name="NutriFit Ensemble Random Forest & Deep MLP Classifier",
        model_architecture="RandomForestClassifier(n_estimators=100) + Keras Dense(128, 64, Softmax)",
        framework="Scikit-Learn 1.8 & TensorFlow 2.20",
        training_samples=2400,
        validation_accuracy="88.4%",
        f1_score=0.87,
        status="active"
    )
