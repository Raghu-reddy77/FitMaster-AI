# AI / ML Model Architecture & Methodology

## 1. Mathematical Grounding & Metabolic Formulations

### Body Mass Index (BMI)
$$\text{BMI} = \frac{\text{weight (kg)}}{(\text{height (m)})^2}$$

### Basal Metabolic Rate (BMR) - Mifflin-St Jeor Equation
- **For Men**:
  $$\text{BMR} = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age (years)} + 5$$
- **For Women**:
  $$\text{BMR} = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age (years)} - 161$$

### Total Daily Energy Expenditure (TDEE)
$$\text{TDEE} = \text{BMR} \times \text{Physical Activity Factor}$$
- Sedentary (little to no exercise): $1.2$
- Lightly Active (light exercise 1-3 days/week): $1.375$
- Moderately Active (moderate exercise 3-5 days/week): $1.55$
- Very Active (hard exercise 6-7 days/week): $1.725$
- Extra Active (very hard exercise / physical job): $1.9$

### Target Calorie Adjustment by Fitness Goal
- **Weight Loss**: $\text{Target Calories} = \text{TDEE} - 500\text{ kcal}$ (healthy deficit)
- **Weight Maintenance**: $\text{Target Calories} = \text{TDEE}$
- **Lean Muscle Gain**: $\text{Target Calories} = \text{TDEE} + 350\text{ kcal}$ (controlled surplus)

### Macronutrient Partitioning
- **Protein**:
  - Weight Loss: $2.0\text{ g/kg bodyweight}$ (preserves lean mass during deficit)
  - Weight Maintenance: $1.6\text{ g/kg bodyweight}$
  - Muscle Gain: $2.2\text{ g/kg bodyweight}$
  - Each gram of protein yields $4\text{ kcal}$.
- **Fat**:
  - $25\%$ of total daily calories allocated to healthy fats ($9\text{ kcal/g}$).
- **Carbohydrates**:
  - Remaining calories allocated to carbohydrates ($4\text{ kcal/g}$).

---

## 2. Multi-Stage AI Recommendation Pipeline

### Stage 1: Rule-Based Fallback Engine
When model weights are initializing or data is scarce:
- Computes percentage fulfillment:
  $$P_k = \frac{\text{Intake}_k}{\text{Target}_k} \times 100\% \quad (k \in \{\text{Calories, Protein, Carbs, Fat}\})$$
- Classifies nutritional gaps:
  - Deficit if $P_k < 85\%$
  - Balanced if $85\% \le P_k \le 115\%$
  - Excess if $P_k > 115\%$
- Filters candidate foods from MySQL having highest density of deficient macronutrient per 100g, while remaining within remaining calorie allowance.

### Stage 2: Scikit-Learn Supervised Baseline
- **Input Features**: Age, Gender (one-hot), Height, Weight, BMI, Activity Level, Fitness Goal, Remaining Calories, Remaining Protein, Remaining Carbs, Remaining Fat, Time of Day (Meal Slot).
- **Target Label**: Optimal Food Category Recommendation / Nutritional Gap State.
- **Model**: `RandomForestClassifier` with 5-fold cross-validation.
- **Evaluation**: Precision, Recall, F1-Score, Confusion Matrix.

### Stage 3: Deep Learning Multi-Output Neural Network (TensorFlow/Keras)
- **Architecture**:
  - Input Layer (12 normalized numerical/encoded features)
  - Dense(128, activation='relu') + BatchNormalization() + Dropout(0.3)
  - Dense(64, activation='relu') + Dropout(0.2)
  - Output Layer: Softmax probability distribution over food categories and macro deficit classes.
- **Loss Function**: `categorical_crossentropy`
- **Optimizer**: Adam ($\text{learning\_rate}=0.001$)
- **Evaluation**: Loss curves, accuracy curves, and validation performance saved as Matplotlib plots.

---

## 3. Computer Vision Academic Research Module (OpenCV)
- **Scope & Academic Purpose**: Demonstration of classical digital image processing algorithms (rescaling, Gaussian blurring, Otsu thresholding, Canny edge detection, watershed segmentation).
- **Strict Boundary**: This module is completely separate from the nutrition tracker. **No food scanner or camera-based calorie detection exists in the application.**
