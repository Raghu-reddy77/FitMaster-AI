"""
FitMaster AI – Pydantic Data Schemas for AI Microservice
Enforces strict type validation and documentation across all FastAPI endpoints.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class UserProfileInput(BaseModel):
    age: int = Field(..., ge=12, le=120, description="Age in years")
    gender: str = Field(..., description="Gender: male, female, or other")
    height_cm: float = Field(..., ge=50, le=280, description="Height in centimeters")
    weight_kg: float = Field(..., ge=25, le=350, description="Body weight in kilograms")
    activity_level: str = Field(..., description="Physical activity category")
    fitness_goal: str = Field(..., description="Primary fitness objective")

class DailyIntakeInput(BaseModel):
    calories: float = Field(0.0, ge=0.0, description="Calories consumed so far")
    protein: float = Field(0.0, ge=0.0, description="Protein consumed in grams")
    carbs: float = Field(0.0, ge=0.0, description="Carbohydrates consumed in grams")
    fat: float = Field(0.0, ge=0.0, description="Fat consumed in grams")

class NutritionGoalsInput(BaseModel):
    daily_calories: float = Field(..., description="Daily calorie target")
    protein_g: float = Field(..., description="Daily target protein in grams")
    carbs_g: float = Field(..., description="Daily target carbohydrates in grams")
    fat_g: float = Field(..., description="Daily target fats in grams")
    water_ml: Optional[float] = Field(2500.0, description="Daily hydration target")

class CandidateFoodItem(BaseModel):
    food_id: int
    food_name: str
    category: str
    calories_per_100g: float
    protein_per_100g: float
    carbs_per_100g: float
    fat_per_100g: float
    fibre_per_100g: Optional[float] = 0.0
    serving_size: Optional[str] = "100g"

class NutritionGapRequest(BaseModel):
    profile: UserProfileInput
    goals: NutritionGoalsInput
    daily_intake: DailyIntakeInput

class NutritionGapResponse(BaseModel):
    status: str
    gap_type: str
    calories_status: str
    protein_status: str
    carbs_status: str
    fat_status: str
    deficits: Dict[str, float]
    advisory: str
    model_version: str

class RecommendationRequest(BaseModel):
    user_id: int
    profile: UserProfileInput
    goals: NutritionGoalsInput
    daily_intake: DailyIntakeInput
    candidate_foods: List[CandidateFoodItem]

class RecommendedFoodItem(BaseModel):
    food_id: int
    food_name: str
    category: str
    serving_size: str
    calories_per_100g: float
    protein_per_100g: float
    carbs_per_100g: float
    fat_per_100g: float
    recommendation_score: float
    reason: str

class RecommendationResponse(BaseModel):
    status: str
    gap_type: str
    model_version: str
    rationale: str
    remaining_macros: Dict[str, int]
    recommendations: List[RecommendedFoodItem]

class AnalyticsGenerateRequest(BaseModel):
    chart_type: str = Field(..., description="Type of chart: daily_calories, weekly_trends, monthly_trends, weight_history")
    user_id: int
    data: Any

class ModelInfoResponse(BaseModel):
    model_name: str
    model_architecture: str
    framework: str
    training_samples: int
    validation_accuracy: str
    f1_score: float
    status: str
