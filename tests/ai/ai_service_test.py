"""
FitMaster AI – Python AI Microservice Integration & Unit Tests
Tests gap classification, food scoring, Matplotlib visualization rendering, and OpenCV experiments.
"""

import sys
import os
import unittest

# Add ai-service to Python sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../ai-service")))

from app.services.nutrition_gap_service import classify_nutrition_gap
from app.services.recommendation_service import generate_food_recommendations
from app.analytics.chart_generator import generate_daily_chart, generate_weekly_chart
from cv_research.cv_module import AcademicComputerVisionExperiments

class TestFitMasterAIService(unittest.TestCase):

    def setUp(self):
        self.profile = {
            "age": 24,
            "gender": "male",
            "height_cm": 178.0,
            "weight_kg": 75.0,
            "activity_level": "moderately_active",
            "fitness_goal": "lean_muscle_gain"
        }
        self.goals = {
            "daily_calories": 3000.0,
            "protein_g": 165.0,
            "carbs_g": 400.0,
            "fat_g": 85.0
        }

    def test_nutrition_gap_classification(self):
        # Case 1: Protein deficit with calories remaining
        intake_deficit = {"calories": 1500.0, "protein": 40.0, "carbs": 220.0, "fat": 40.0}
        res1 = classify_nutrition_gap(self.profile, self.goals, intake_deficit)
        self.assertEqual(res1["status"], "success")
        self.assertIn("protein_deficit", res1["gap_type"])
        self.assertGreater(res1["deficits"]["protein_g"], 100)

        # Case 2: Calorie surplus
        intake_surplus = {"calories": 3500.0, "protein": 170.0, "carbs": 450.0, "fat": 95.0}
        res2 = classify_nutrition_gap(self.profile, self.goals, intake_surplus)
        self.assertEqual(res2["gap_type"], "calorie_surplus")

    def test_food_recommendations_ranking(self):
        intake = {"calories": 1200.0, "protein": 30.0, "carbs": 180.0, "fat": 35.0}
        candidate_foods = [
            {
                "food_id": 1,
                "food_name": "Chicken Breast",
                "category": "Poultry & Meat",
                "calories_per_100g": 165.0,
                "protein_per_100g": 31.0,
                "carbs_per_100g": 0.0,
                "fat_per_100g": 3.6,
                "serving_size": "100g"
            },
            {
                "food_id": 2,
                "food_name": "Apple",
                "category": "Fruits",
                "calories_per_100g": 52.0,
                "protein_per_100g": 0.3,
                "carbs_per_100g": 13.8,
                "fat_per_100g": 0.2,
                "serving_size": "100g"
            }
        ]

        res = generate_food_recommendations(1, self.profile, self.goals, intake, candidate_foods)
        self.assertEqual(res["status"], "success")
        self.assertTrue(len(res["recommendations"]) > 0)
        # Chicken Breast must rank higher than Apple when in severe protein deficit
        top_food = res["recommendations"][0]
        self.assertEqual(top_food["food_name"], "Chicken Breast")

    def test_matplotlib_chart_generation(self):
        progress_data = {
            "calories": {"consumed": 1850, "target": 2500},
            "macros": {
                "protein": {"consumed": 120, "target": 160},
                "carbs": {"consumed": 210, "target": 260},
                "fat": {"consumed": 55, "target": 70}
            }
        }
        filename = generate_daily_chart(user_id=999, progress=progress_data)
        self.assertTrue(filename.endswith(".png"))
        chart_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../ai-service/generated_charts", filename))
        self.assertTrue(os.path.exists(chart_path))
        self.assertGreater(os.path.getsize(chart_path), 5000)

    def test_cv_research_module_execution(self):
        cv_results = AcademicComputerVisionExperiments.run_all_cv_benchmarks()
        self.assertEqual(cv_results["status"], "success")
        self.assertEqual(len(cv_results["experiments_conducted"]), 4)
        benchmark_img_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../ai-service/generated_charts/cv_research_benchmark.png"))
        self.assertTrue(os.path.exists(benchmark_img_path))
        self.assertGreater(os.path.getsize(benchmark_img_path), 10000)

if __name__ == "__main__":
    unittest.main()
