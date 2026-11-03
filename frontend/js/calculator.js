/**
 * FitMaster AI – Nutrition Calculator Client Logic
 * Implements client-side metabolic equations (Mifflin-St Jeor, TDEE, macro split)
 * and syncs with backend /api/nutrition/calculate.
 */

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9
};

document.addEventListener('DOMContentLoaded', async () => {
  // Pre-fill with user's existing profile if available
  await prefillUserProfile();

  // Attach live input listeners to trigger instant recomputation
  ['calc-age', 'calc-gender', 'calc-height', 'calc-weight', 'calc-activity', 'calc-goal'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', runCalculations);
    document.getElementById(id)?.addEventListener('change', runCalculations);
  });

  document.getElementById('calc-recompute-btn')?.addEventListener('click', runCalculations);

  // Form submission: save to database
  const form = document.getElementById('calculator-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveTargetsToProfile();
    });
  }

  // Initial calculation
  runCalculations();
});

async function prefillUserProfile() {
  try {
    const res = await api.get('/users/profile');
    const profile = res.data?.profile;
    if (profile) {
      if (profile.age) document.getElementById('calc-age').value = profile.age;
      if (profile.gender) document.getElementById('calc-gender').value = profile.gender;
      if (profile.height_cm) document.getElementById('calc-height').value = profile.height_cm;
      if (profile.weight_kg) document.getElementById('calc-weight').value = profile.weight_kg;
      if (profile.activity_level) document.getElementById('calc-activity').value = profile.activity_level;
      if (profile.fitness_goal) document.getElementById('calc-goal').value = profile.fitness_goal;
    }
  } catch (err) {
    // If guest or error, defaults are already pre-filled
  }
}

function runCalculations() {
  const age = parseInt(document.getElementById('calc-age').value, 10) || 25;
  const gender = document.getElementById('calc-gender').value;
  const heightCm = parseFloat(document.getElementById('calc-height').value) || 170;
  const weightKg = parseFloat(document.getElementById('calc-weight').value) || 70;
  const activityLevel = document.getElementById('calc-activity').value;
  const fitnessGoal = document.getElementById('calc-goal').value;

  // 1. BMI Calculation
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let bmiCategory = 'Normal weight';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi < 25) bmiCategory = 'Normal weight';
  else if (bmi < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';

  // 2. BMR (Mifflin-St Jeor)
  const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age;
  let bmr = baseBMR;
  if (gender === 'male') bmr += 5;
  else if (gender === 'female') bmr -= 161;
  else bmr -= 78;

  // 3. TDEE
  const factor = ACTIVITY_FACTORS[activityLevel] || 1.55;
  const tdee = bmr * factor;

  // 4. Target Calories & Protein
  let targetCalories = tdee;
  let proteinFactor = 1.6;
  let goalLabel = 'Weight Maintenance';

  if (fitnessGoal === 'weight_loss') {
    targetCalories = Math.max(1200, tdee - 500);
    proteinFactor = 2.0;
    goalLabel = 'Weight Loss (-500 kcal deficit)';
  } else if (fitnessGoal === 'lean_muscle_gain') {
    targetCalories = tdee + 350;
    proteinFactor = 2.2;
    goalLabel = 'Lean Muscle Gain (+350 kcal surplus)';
  }

  // Macros
  const proteinG = proteinFactor * weightKg;
  const proteinKcal = proteinG * 4;

  const fatKcal = targetCalories * 0.25;
  const fatG = fatKcal / 9;

  const carbsKcal = Math.max(200, targetCalories - proteinKcal - fatKcal);
  const carbsG = carbsKcal / 4;

  const waterMl = Math.max(2000, Math.round(weightKg * 35));

  // Render to UI
  document.getElementById('calc-out-calories').textContent = Math.round(targetCalories);
  document.getElementById('calc-goal-badge').textContent = goalLabel;

  document.getElementById('calc-out-protein').textContent = `${Math.round(proteinG)} g`;
  document.getElementById('calc-out-protein-cal').textContent = `${Math.round(proteinKcal)} kcal`;

  document.getElementById('calc-out-carbs').textContent = `${Math.round(carbsG)} g`;
  document.getElementById('calc-out-carbs-cal').textContent = `${Math.round(carbsKcal)} kcal`;

  document.getElementById('calc-out-fat').textContent = `${Math.round(fatG)} g`;
  document.getElementById('calc-out-fat-cal').textContent = `${Math.round(fatKcal)} kcal`;

  document.getElementById('calc-out-bmi').textContent = `${bmi.toFixed(2)} (${bmiCategory})`;
  document.getElementById('calc-out-bmr').textContent = `${Math.round(bmr)} kcal / day`;
  document.getElementById('calc-out-tdee').textContent = `${Math.round(tdee)} kcal / day`;
  document.getElementById('calc-out-water').textContent = `${waterMl} ml`;

  // Macro Ratio Bar
  const totKcal = proteinKcal + carbsKcal + fatKcal;
  const pPct = Math.round((proteinKcal / totKcal) * 100);
  const cPct = Math.round((carbsKcal / totKcal) * 100);
  const fPct = 100 - pPct - cPct;

  document.getElementById('macro-bar-protein').style.width = `${pPct}%`;
  document.getElementById('macro-bar-carbs').style.width = `${cPct}%`;
  document.getElementById('macro-bar-fat').style.width = `${fPct}%`;

  document.getElementById('calc-p-pct').textContent = `${pPct}%`;
  document.getElementById('calc-c-pct').textContent = `${cPct}%`;
  document.getElementById('calc-f-pct').textContent = `${fPct}%`;
}

async function saveTargetsToProfile() {
  const saveBtn = document.getElementById('calc-save-btn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spinner"></span> Saving Goals...';

  try {
    const age = parseInt(document.getElementById('calc-age').value, 10);
    const gender = document.getElementById('calc-gender').value;
    const height_cm = parseFloat(document.getElementById('calc-height').value);
    const weight_kg = parseFloat(document.getElementById('calc-weight').value);
    const activity_level = document.getElementById('calc-activity').value;
    const fitness_goal = document.getElementById('calc-goal').value;

    await api.post('/nutrition/calculate', {
      age,
      gender,
      height_cm,
      weight_kg,
      activity_level,
      fitness_goal
    });

    showToast('Goals Saved', 'Your calculated metabolic goals have been saved to your profile!', 'success');
  } catch (err) {
    showToast('Save Failed', err.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = 'Save as My Active Goals';
  }
}
