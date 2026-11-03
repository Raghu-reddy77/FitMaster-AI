# FitMaster AI – Intelligent Nutrition Tracker
## Project Overview & Academic Specification

### 1. Introduction
**FitMaster AI – Intelligent Nutrition Tracker** is an academic B.Tech CSE capstone full-stack application designed to empower individuals with scientific, personalized, and data-driven dietary management. By fusing relational database modeling, a high-throughput Node.js/Express API gateway, modern vanilla frontend aesthetics, and a Python AI/ML microservice, FitMaster AI calculates metabolic requirements, monitors calorie/macro intake, highlights dietary deficits, and ranks real food suggestions.

### 2. Problem Statement
Contemporary fitness enthusiasts and patients struggle to balance macronutrients (Protein, Carbohydrates, Fats) and hydration due to:
- Ambiguous portion sizing without standardized metric conversion.
- Fragmented mobile apps bloated with inaccurate crowdsourced data or brittle image-scanning gimmicks.
- Lack of transparent, mathematically grounded metabolic equations (e.g., Mifflin-St Jeor) combined with machine learning recommendations.
- Absence of verifiable server-side data analytics and scientific visualizations.

### 3. Key Objectives
- **Standardized Food Database**: Integrate verified nutritional datasets (USDA FoodData Central / Indian Nutrient Databank) normalized strictly to per-100g values.
- **Accurate Metric Calculations**: Implement clinically accepted formulas for BMI, BMR (Mifflin-St Jeor), TDEE, and goal-specific macronutrient partitioning.
- **Intelligent Nutrition Gap Detection**: Formulate rule-based and trained Machine Learning models (Scikit-Learn Random Forest / MLP & TensorFlow/Keras) that evaluate user intake against personal targets to identify deficits or excesses.
- **Authentic Visualizations**: Generate high-fidelity Matplotlib PNG charts from real database records (no generic client-side charting libraries).
- **Academic Research Separation**: Provide a dedicated OpenCV Computer Vision research module illustrating digital image processing without conflating it with inaccurate food camera scanning.
- **Enterprise-Grade Security**: Enforce JWT authentication, bcrypt salted hashing, parameter-bound SQL queries, and strict input validation.

### 4. Technical Scope
- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript (ES6+), Fetch API.
- **Backend API**: Node.js v20+, Express.js, JWT, bcryptjs, mysql2/promise, dotenv.
- **Database**: MySQL 8.0+, 3NF normalized schema, foreign key constraints, indexes.
- **AI Microservice**: Python 3.10+, FastAPI, Pandas, NumPy, Scikit-learn, TensorFlow/Keras, OpenCV, Matplotlib.
