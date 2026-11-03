/**
 * FitMaster AI – User Profile Management Script
 * Handles profile data fetching, form population, submission, and dynamic goal rendering.
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadUserProfile();

  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveUserProfile();
    });
  }
});

/**
 * Load profile and goals from backend
 */
async function loadUserProfile() {
  try {
    const response = await api.get('/users/profile');
    const { user, profile, goal } = response.data;

    // Populate header identity
    if (user) {
      document.getElementById('profile-display-name').textContent = user.name;
      document.getElementById('profile-display-email').textContent = user.email;

      const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      document.getElementById('profile-avatar-initials').textContent = initials || 'FM';
    }

    // Populate form fields if profile exists
    if (profile) {
      document.getElementById('profile-age').value = profile.age || '';
      document.getElementById('profile-gender').value = profile.gender || '';
      document.getElementById('profile-height').value = profile.height_cm || '';
      document.getElementById('profile-weight').value = profile.weight_kg || '';
      if (profile.activity_level) document.getElementById('profile-activity').value = profile.activity_level;
      if (profile.fitness_goal) document.getElementById('profile-goal').value = profile.fitness_goal;
    }

    // Populate metabolic targets preview
    if (goal) {
      renderGoalTargets(goal);
    }
  } catch (err) {
    showToast('Failed to load profile', err.message, 'error');
  }
}

/**
 * Save updated profile and receive recalculated goals
 */
async function saveUserProfile() {
  const saveBtn = document.getElementById('save-profile-btn');

  const age = parseInt(document.getElementById('profile-age').value, 10);
  const gender = document.getElementById('profile-gender').value;
  const height_cm = parseFloat(document.getElementById('profile-height').value);
  const weight_kg = parseFloat(document.getElementById('profile-weight').value);
  const activity_level = document.getElementById('profile-activity').value;
  const fitness_goal = document.getElementById('profile-goal').value;

  if (!age || !gender || !height_cm || !weight_kg || !activity_level || !fitness_goal) {
    showToast('Incomplete Data', 'Please fill in all physical attribute fields.', 'warning');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spinner"></span> Computing Targets...';

  try {
    const response = await api.put('/users/profile', {
      age,
      gender,
      height_cm,
      weight_kg,
      activity_level,
      fitness_goal
    });

    showToast('Profile Updated', 'Metabolic targets and daily goals successfully recalculated!', 'success');

    if (response.data && response.data.goals) {
      renderGoalTargets(response.data.goals);
    }
  } catch (err) {
    showToast('Update Failed', err.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = 'Save Profile & Recalculate Goals';
  }
}

/**
 * Update UI with metabolic target metrics
 */
function renderGoalTargets(goals) {
  document.getElementById('target-calories-val').textContent = Math.round(goals.daily_calories || 0);
  document.getElementById('target-protein-val').textContent = `${Math.round(goals.protein_g || 0)} g`;
  document.getElementById('target-carbs-val').textContent = `${Math.round(goals.carbs_g || 0)} g`;
  document.getElementById('target-fat-val').textContent = `${Math.round(goals.fat_g || 0)} g`;

  document.getElementById('chip-bmi').textContent = goals.bmi || '--';
  document.getElementById('chip-bmi-category').textContent = goals.bmiCategory || getBMICategoryClient(goals.bmi);
  document.getElementById('chip-bmr').textContent = Math.round(goals.bmr || 0);
  document.getElementById('chip-tdee').textContent = Math.round(goals.tdee || 0);
  document.getElementById('chip-water').textContent = Math.round(goals.water_ml || 2500);

  const goalBadge = document.getElementById('goal-badge');
  if (goalBadge) {
    goalBadge.textContent = 'Active Target';
    goalBadge.className = 'badge badge-success';
  }
}

function getBMICategoryClient(bmi) {
  if (!bmi) return 'Normal';
  const val = parseFloat(bmi);
  if (val < 18.5) return 'Underweight';
  if (val < 25) return 'Normal';
  if (val < 30) return 'Overweight';
  return 'Obese';
}
