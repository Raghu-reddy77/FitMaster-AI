# FitMaster AI - Python AI Microservice

## Overview
The **AI Microservice** is built with **FastAPI**, **Scikit-learn**, **TensorFlow/Keras**, **Pandas**, **NumPy**, **OpenCV**, and **Matplotlib**. It provides high-performance asynchronous REST endpoints for:
1. Nutrition gap classification (identifying deficits and excesses in calories, protein, carbs, and fat).
2. Personalized food recommendation ranking based on nutritional deficits, user profile, and MySQL food records.
3. Server-side Matplotlib chart generation for daily, weekly, and monthly nutrition trends, macro distributions, weight tracking, and model convergence metrics.
4. An isolated Academic Computer Vision research module using OpenCV for image preprocessing, edge detection, filtering, and segmentation (strictly separated from nutrition tracking; no food scanners).

## Technology Stack
- **FastAPI & Uvicorn**: High-performance asynchronous Python API framework.
- **Scikit-learn**: Baseline ML classification models, feature scalers, cross-validation, and metrics evaluation.
- **TensorFlow/Keras**: Deep Neural Network for multi-class/multi-label nutritional deficit detection and recommendation ranking.
- **Pandas & NumPy**: Data cleaning, feature engineering, and statistical aggregations.
- **Matplotlib**: Presentation-grade scientific visualizations rendered directly to static PNGs.
- **OpenCV (cv2)**: Computer vision experiments.

## Directory Structure
- `app/`: FastAPI application code (routes, controllers, models, services, analytics).
- `app/analytics/`: Matplotlib generation modules (`nutrition_analysis.py`, `progress_visualization.py`, `model_evaluation.py`, `chart_generator.py`).
- `cv_research/`: Standalone computer vision academic scripts (OpenCV image preprocessing, filters, edge detectors).
- `training/`: Feature engineering and model training scripts (`train_model.py`, `evaluate_model.py`).
- `saved_models/`: Serialized models (`.pkl` scalers/models, `.keras` neural networks).
- `generated_charts/`: Cached PNG charts produced dynamically for user analytics.

## Running the Service
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
