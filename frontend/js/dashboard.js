/**
 * FitMaster AI – Dashboard Controller
 * Synchronizes metrics, today's meals, hydration, and AI recommendations.
 */

let selectedDate = new Date().toISOString().split('T')[0];

document.addEventListener('DOMContentLoaded', () => {
  const datePicker = document.getElementById('dash-date-picker');
  if (datePicker) {
    datePicker.value = selectedDate;
    datePicker.addEventListener('change', (e) => {
      selectedDate = e.target.value;
      loadDashboardData();
    });
  }

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  const sidebar = document.getElementById('app-sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  loadDashboardData();
});

async function loadDashboardData() {
  try {
    const user = getCurrentUser();
    if (user && document.getElementById('dash-user-name')) {
      document.getElementById('dash-user-name').textContent = user.name;
    }

    // Load profile & metabolic targets
    const profileRes = await api.get('/users/profile').catch(() => null);
    if (profileRes && profileRes.data) {
      populateBiometricsAndGoals(profileRes.data);
    }

    // Load daily nutrition progress
    const progressRes = await api.get(`/progress/daily?date=${selectedDate}`).catch(() => null);
    if (progressRes && progressRes.data) {
      populateDailyMetrics(progressRes.data);
    }

    // Load today's meals
    loadMealsForDate(selectedDate);

    // Load AI recommendation preview
    loadAIRecommendationPreview();

    // Update daily chart preview src
    const chartImg = document.getElementById('dashboard-daily-chart');
    if (chartImg && user) {
      chartImg.src = `/api/analytics/static/daily_calories_${user.userId}.png?t=${Date.now()}`;
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  }
}

function populateBiometricsAndGoals(data) {
  const profile = data.profile || {};
  const goal = data.goal || {};

  const weightEl = document.getElementById('card-weight');
  const heightEl = document.getElementById('card-height');
  const bmiBadge = document.getElementById('card-bmi-badge');
  const bmrEl = document.getElementById('card-bmr');
  const tdeeEl = document.getElementById('card-tdee');
  const goalNameEl = document.getElementById('card-goal-name');
  const goalDeltaEl = document.getElementById('card-goal-delta');

  if (weightEl) weightEl.textContent = profile.weight_kg ? Number(profile.weight_kg).toFixed(1) : '--';
  if (heightEl) heightEl.textContent = profile.height_cm ? `${profile.height_cm} cm` : '-- cm';

  if (goal.bmi && bmiBadge) {
    bmiBadge.textContent = `${Number(goal.bmi).toFixed(1)} BMI`;
    const bmiVal = Number(goal.bmi);
    if (bmiVal < 18.5) {
      bmiBadge.className = 'ai-badge badge-deficit';
    } else if (bmiVal <= 24.9) {
      bmiBadge.className = 'ai-badge badge-balanced';
    } else {
      bmiBadge.className = 'ai-badge badge-surplus';
    }
  }

  if (bmrEl) bmrEl.textContent = goal.bmr ? `${Math.round(goal.bmr)} kcal` : '-- kcal';
  if (tdeeEl) tdeeEl.textContent = goal.tdee ? `${Math.round(goal.tdee)} kcal` : '-- kcal';

  if (goalNameEl && profile.fitness_goal) {
    goalNameEl.textContent = profile.fitness_goal.replace(/_/g, ' ');
  }

  if (goalDeltaEl && profile.fitness_goal) {
    if (profile.fitness_goal === 'weight_loss') {
      goalDeltaEl.innerHTML = 'Calorie Deficit: <span style="color: #f87171; font-weight:600;">-500 kcal/day</span>';
    } else if (profile.fitness_goal === 'lean_muscle_gain') {
      goalDeltaEl.innerHTML = 'Controlled Surplus: <span style="color: var(--primary-light); font-weight:600;">+350 kcal/day</span>';
    } else {
      goalDeltaEl.innerHTML = 'Target Balance: <span style="color: #60a5fa; font-weight:600;">Maintenance Equilibrium</span>';
    }
  }
}

function populateDailyMetrics(progress) {
  const cals = progress.calories || { consumed: 0, target: 2000, remaining: 2000, percentage: 0 };
  const water = progress.water || { consumed: 0, target: 2500, remaining: 2500, percentage: 0 };
  const macros = progress.macros || {};

  // Calorie card
  const cCon = document.getElementById('card-cal-consumed');
  const cTar = document.getElementById('card-cal-target');
  const cRem = document.getElementById('card-cal-remaining');
  const cBar = document.getElementById('card-cal-bar');

  if (cCon) cCon.textContent = Math.round(cals.consumed);
  if (cTar) cTar.textContent = Math.round(cals.target);
  if (cRem) cRem.textContent = `${Math.round(cals.remaining)} kcal`;
  if (cBar) cBar.style.width = `${Math.min(100, Math.round(cals.percentage))}%`;

  // Water card
  const wCon = document.getElementById('card-water-consumed');
  const wTar = document.getElementById('card-water-target');
  const wPct = document.getElementById('card-water-pct');
  const wBar = document.getElementById('card-water-bar');

  if (wCon) wCon.textContent = Math.round(water.consumed);
  if (wTar) wTar.textContent = Math.round(water.target);
  if (wPct) wPct.textContent = `${Math.round(water.percentage)}%`;
  if (wBar) wBar.style.width = `${Math.min(100, Math.round(water.percentage))}%`;

  // Macros
  const p = macros.protein || { consumed: 0, target: 150, percentage: 0 };
  const c = macros.carbs || { consumed: 0, target: 250, percentage: 0 };
  const f = macros.fat || { consumed: 0, target: 70, percentage: 0 };

  const pCon = document.getElementById('p-con');
  const pTar = document.getElementById('p-tar');
  const pBar = document.getElementById('p-bar');
  const pPct = document.getElementById('p-pct');

  if (pCon) pCon.textContent = Math.round(p.consumed);
  if (pTar) pTar.textContent = Math.round(p.target);
  if (pBar) pBar.style.width = `${Math.min(100, Math.round(p.percentage))}%`;
  if (pPct) pPct.textContent = `${Math.round(p.percentage)}% fulfilled (${Math.max(0, Math.round(p.target - p.consumed))}g remaining)`;

  const cConEl = document.getElementById('c-con');
  const cTarEl = document.getElementById('c-tar');
  const cBar = document.getElementById('c-bar');
  const cPct = document.getElementById('c-pct');

  if (cConEl) cConEl.textContent = Math.round(c.consumed);
  if (cTarEl) cTarEl.textContent = Math.round(c.target);
  if (cBar) cBar.style.width = `${Math.min(100, Math.round(c.percentage))}%`;
  if (cPct) cPct.textContent = `${Math.round(c.percentage)}% fulfilled (${Math.max(0, Math.round(c.target - c.consumed))}g remaining)`;

  const fConEl = document.getElementById('f-con');
  const fTarEl = document.getElementById('f-tar');
  const fBar = document.getElementById('f-bar');
  const fPct = document.getElementById('f-pct');

  if (fConEl) fConEl.textContent = Math.round(f.consumed);
  if (fTarEl) fTarEl.textContent = Math.round(f.target);
  if (fBar) fBar.style.width = `${Math.min(100, Math.round(f.percentage))}%`;
  if (fPct) fPct.textContent = `${Math.round(f.percentage)}% fulfilled (${Math.max(0, Math.round(f.target - f.consumed))}g remaining)`;
}

async function loadMealsForDate(date) {
  const container = document.getElementById('meals-list-container');
  if (!container) return;

  try {
    const res = await api.get(`/meals?date=${date}`);
    const meals = res.data?.meals || [];

    if (meals.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted);">
          <div style="font-size: 28px; margin-bottom: 8px;">🍽️</div>
          <div>No meals logged for this date yet.</div>
          <a href="food-tracker.html" class="btn btn-secondary btn-sm" style="margin-top: 12px; display: inline-block;">
            Log First Meal
          </a>
        </div>
      `;
      return;
    }

    const mealTypeIcons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snacks: '🍎'
    };

    container.innerHTML = meals.map((m) => `
      <div class="meal-slot-snippet">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 22px;">${mealTypeIcons[m.meal_type] || '🍲'}</div>
          <div>
            <div style="font-weight: 700; text-transform: capitalize; color: var(--text-main);">
              ${m.meal_type}
            </div>
            <div style="font-size: 12px; color: var(--text-muted);">
              ${m.items?.length || 0} items logged
            </div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-family: var(--font-heading); font-weight: 800; font-size: 16px; color: var(--primary);">
            ${Math.round(m.total_calories)} kcal
          </div>
          <div style="font-size: 11px; color: var(--text-dim);">
            ${Math.round(m.total_protein)}g P • ${Math.round(m.total_carbs)}g C • ${Math.round(m.total_fat)}g F
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div style="color: var(--danger); font-size: 13px;">Failed to load meals: ${err.message}</div>`;
  }
}

async function loadAIRecommendationPreview() {
  const titleEl = document.getElementById('ai-gap-title');
  const descEl = document.getElementById('ai-gap-desc');
  const badgeEl = document.getElementById('ai-gap-badge');

  try {
    const res = await api.get('/ai/recommendations/history').catch(() => null);
    const history = res?.data || [];

    if (history.length > 0) {
      const latest = history[0];
      const gapReadable = latest.gap_type.replace(/_/g, ' ');

      if (titleEl) titleEl.textContent = gapReadable.toUpperCase();
      if (descEl) descEl.textContent = latest.rationale;
      if (badgeEl) {
        badgeEl.textContent = latest.gap_type.includes('deficit') ? 'Deficit Detected' : (latest.gap_type.includes('surplus') ? 'Surplus Warning' : 'Optimal Balance');
        badgeEl.className = latest.gap_type.includes('deficit') ? 'ai-badge badge-deficit' : (latest.gap_type.includes('surplus') ? 'ai-badge badge-surplus' : 'ai-badge badge-balanced');
      }
    } else {
      if (titleEl) titleEl.textContent = 'AI Model Ready';
      if (descEl) descEl.textContent = 'Click "View AI Suggestions" to run machine learning gap analysis and candidate food scoring.';
    }
  } catch {
    // Keep placeholder
  }
}

async function quickLogWater(amountMl) {
  try {
    await api.post('/water', {
      amount_ml: amountMl,
      date: selectedDate
    });
    showToast('Hydration Logged', `+${amountMl} ml water recorded!`);
    loadDashboardData();
  } catch (err) {
    showToast('Water Log Failed', err.message, 'error');
  }
}

window.quickLogWater = quickLogWater;
