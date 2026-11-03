/**
 * FitMaster AI – Food & Nutrition Tracker Client Logic
 * Handles manual food search, dynamic portion scaling, meal logging, and daily totals.
 */

let currentDate = new Date().toISOString().split('T')[0];
let activeMealType = 'breakfast';
let selectedFood = null;
let userGoals = null;
let searchDebounceTimeout = null;
let activeCategory = '';

document.addEventListener('DOMContentLoaded', async () => {
  // Set date picker value
  const datePicker = document.getElementById('tracker-date-picker');
  if (datePicker) {
    datePicker.value = currentDate;
    datePicker.addEventListener('change', (e) => {
      currentDate = e.target.value;
      loadDailyTrackerData();
    });
  }

  // Prev / Next day buttons
  document.getElementById('prev-day-btn')?.addEventListener('click', () => changeDate(-1));
  document.getElementById('next-day-btn')?.addEventListener('click', () => changeDate(1));

  // Modal event listeners
  setupModalListeners();

  // Load initial goals and daily meals
  await loadUserGoals();
  await loadDailyTrackerData();

  // Check for quick-add food pre-selection from AI Assistant
  checkQuickAddFood();
});

/**
 * Handle quick-add food redirected from AI Assistant
 */
function checkQuickAddFood() {
  const quickRaw = localStorage.getItem('fitmaster_quick_add');
  if (!quickRaw) return;
  try {
    const food = JSON.parse(quickRaw);
    localStorage.removeItem('fitmaster_quick_add');

    const modal = document.getElementById('food-search-modal');
    if (!modal) return;

    activeMealType = 'snack';
    const mealNameEl = document.getElementById('modal-meal-name');
    if (mealNameEl) mealNameEl.textContent = 'Snack';

    selectedFood = food;
    document.getElementById('serving-calculator').style.display = 'block';
    document.getElementById('selected-food-title').textContent = food.food_name;
    document.getElementById('selected-food-source').textContent = 'AI Recommendation';
    document.getElementById('confirm-add-food-btn').disabled = false;
    document.getElementById('serving-grams-input').value = 100;

    modal.classList.add('active');
    updateDynamicServingCalculation();
    showToast('AI Food Pre-selected', `Adjust portion grams for ${food.food_name} and click Add to Meal.`, 'info');
  } catch (e) {
    console.warn('Error handling quick add food:', e);
  }
}

function changeDate(daysOffset) {
  const d = new Date(currentDate);
  d.setDate(d.getDate() + daysOffset);
  currentDate = d.toISOString().split('T')[0];
  document.getElementById('tracker-date-picker').value = currentDate;
  loadDailyTrackerData();
}

/**
 * Fetch user nutrition goals
 */
async function loadUserGoals() {
  try {
    const res = await api.get('/nutrition/goals');
    if (res.data) {
      userGoals = res.data;
      document.getElementById('target-calories-num').textContent = Math.round(userGoals.daily_calories);
    }
  } catch (err) {
    console.warn('Could not load user goals:', err.message);
  }
}

/**
 * Load meals logged for currentDate
 */
async function loadDailyTrackerData() {
  try {
    const res = await api.get(`/meals?date=${currentDate}`);
    const data = res.data;
    renderDailyMeals(data);
  } catch (err) {
    showToast('Failed to load meals', err.message, 'error');
  }
}

/**
 * Render meal slots and daily budget bar
 */
function renderDailyMeals(data) {
  const { meals, daily_totals } = data;

  // 1. Update Daily Calorie Fulfillment Bar
  const targetCal = userGoals ? parseFloat(userGoals.daily_calories) : 2000;
  const consumedCal = daily_totals.calories || 0;
  const remainingCal = Math.max(0, targetCal - consumedCal);
  const percentage = Math.min(100, Math.round((consumedCal / targetCal) * 100));

  document.getElementById('consumed-calories-num').textContent = Math.round(consumedCal);
  document.getElementById('target-calories-num').textContent = Math.round(targetCal);
  document.getElementById('remaining-calories-num').textContent = `${Math.round(remainingCal)} kcal remaining`;

  const bar = document.getElementById('calories-progress-bar');
  if (bar) {
    bar.style.width = `${percentage}%`;
    bar.className = 'progress-bar-fill';
    if (percentage > 105) bar.classList.add('danger');
    else if (percentage >= 90) bar.classList.add('warning');
  }

  // 2. Update Macro Stats
  const targetP = userGoals ? Math.round(userGoals.protein_g) : 150;
  const targetC = userGoals ? Math.round(userGoals.carbs_g) : 250;
  const targetF = userGoals ? Math.round(userGoals.fat_g) : 65;

  document.getElementById('consumed-protein-stat').textContent = `${Math.round(daily_totals.protein || 0)}g / ${targetP}g`;
  document.getElementById('consumed-carbs-stat').textContent = `${Math.round(daily_totals.carbs || 0)}g / ${targetC}g`;
  document.getElementById('consumed-fat-stat').textContent = `${Math.round(daily_totals.fat || 0)}g / ${targetF}g`;
  document.getElementById('consumed-fibre-stat').textContent = `${Math.round(daily_totals.fibre || 0)}g`;

  // 3. Render Each Meal Slot
  const slotTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
  slotTypes.forEach((type) => {
    const container = document.getElementById(`${type}-items-container`);
    const totalsText = document.getElementById(`${type}-totals-text`);
    const mealLogs = meals.filter((m) => m.meal_type === type);

    if (mealLogs.length === 0) {
      container.innerHTML = `<div class="empty-meal-placeholder">No ${type} foods logged yet.</div>`;
      totalsText.textContent = '0 kcal • 0g P • 0g C • 0g F';
      return;
    }

    let slotCal = 0, slotP = 0, slotC = 0, slotF = 0;
    container.innerHTML = '';

    mealLogs.forEach((meal) => {
      slotCal += parseFloat(meal.total_calories || 0);
      slotP += parseFloat(meal.total_protein || 0);
      slotC += parseFloat(meal.total_carbs || 0);
      slotF += parseFloat(meal.total_fat || 0);

      meal.items.forEach((item) => {
        const itemRow = document.createElement('div');
        itemRow.className = 'meal-item-row';
        itemRow.innerHTML = `
          <div class="meal-item-info">
            <span class="meal-item-name">${item.food_name} (${item.quantity_grams}g)</span>
            <span class="meal-item-macros">
              <strong>${item.protein}g</strong> Protein • 
              <strong>${item.carbs}g</strong> Carbs • 
              <strong>${item.fat}g</strong> Fat • 
              <strong>${item.fibre || 0}g</strong> Fibre
            </span>
          </div>
          <div class="meal-item-actions">
            <span class="meal-item-calories">${item.calories} kcal</span>
            <button class="delete-item-btn" title="Delete Meal" onclick="deleteMealEntry(${meal.meal_id})">
              &times;
            </button>
          </div>
        `;
        container.appendChild(itemRow);
      });
    });

    totalsText.textContent = `${Math.round(slotCal)} kcal • ${Math.round(slotP)}g P • ${Math.round(slotC)}g C • ${Math.round(slotF)}g F`;
  });
}

/**
 * Delete meal entry
 */
async function deleteMealEntry(mealId) {
  if (!confirm('Are you sure you want to remove this meal entry?')) return;
  try {
    await api.delete(`/meals/${mealId}`);
    showToast('Meal Removed', 'Entry successfully deleted.', 'success');
    await loadDailyTrackerData();
  } catch (err) {
    showToast('Delete Failed', err.message, 'error');
  }
}

/**
 * Modal & Search Handlers
 */
function setupModalListeners() {
  const modal = document.getElementById('food-search-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const searchInput = document.getElementById('food-search-input');
  const gramsInput = document.getElementById('serving-grams-input');
  const confirmBtn = document.getElementById('confirm-add-food-btn');

  // Open modal on "+ Add Food" buttons
  document.querySelectorAll('.add-food-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      activeMealType = e.currentTarget.dataset.meal;
      document.getElementById('modal-meal-name').textContent = activeMealType.charAt(0).toUpperCase() + activeMealType.slice(1);
      selectedFood = null;
      document.getElementById('serving-calculator').style.display = 'none';
      confirmBtn.disabled = true;
      modal.classList.add('active');
      searchInput.value = '';
      executeFoodSearch('');
    });
  });

  const closeModal = () => modal.classList.remove('active');
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  // Search input typing debounce
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(() => {
      executeFoodSearch(e.target.value.trim());
    }, 250);
  });

  // Category filter chips
  document.querySelectorAll('#category-chips-bar .category-chip').forEach((chip) => {
    chip.addEventListener('click', (e) => {
      document.querySelectorAll('#category-chips-bar .category-chip').forEach((c) => c.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.dataset.cat || '';
      executeFoodSearch(searchInput.value.trim());
    });
  });

  // Gram input dynamic calculation
  gramsInput?.addEventListener('input', updateDynamicServingCalculation);

  // Preset buttons (50g, 100g, 150g, 200g)
  document.querySelectorAll('.preset-chip').forEach((chip) => {
    chip.addEventListener('click', (e) => {
      gramsInput.value = e.target.dataset.grams;
      updateDynamicServingCalculation();
    });
  });

  // Confirm Add Food
  confirmBtn?.addEventListener('click', async () => {
    if (!selectedFood) return;
    const grams = parseFloat(gramsInput.value) || 100;

    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="spinner"></span> Adding...';

    try {
      await api.post('/meals', {
        meal_date: currentDate,
        meal_type: activeMealType,
        items: [
          {
            food_id: selectedFood.food_id,
            quantity_grams: grams
          }
        ]
      });

      showToast('Food Added', `Added ${grams}g ${selectedFood.food_name} to ${activeMealType}!`, 'success');
      closeModal();
      await loadDailyTrackerData();
    } catch (err) {
      showToast('Logging Failed', err.message, 'error');
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = 'Add to Meal';
    }
  });
}

/**
 * Execute food search API call
 */
async function executeFoodSearch(q) {
  const container = document.getElementById('search-results-list');
  container.innerHTML = '<div style="text-align: center; padding: 20px;"><span class="spinner"></span> Searching...</div>';

  try {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (activeCategory) params.append('category', activeCategory);

    const res = await api.get(`/foods/search?${params.toString()}`);
    const foods = res.data.foods || [];

    if (foods.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 24px; color: var(--text-dim);">No matching foods found in database.</div>';
      return;
    }

    container.innerHTML = '';
    foods.forEach((food) => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      if (selectedFood && selectedFood.food_id === food.food_id) {
        item.classList.add('selected');
      }

      item.innerHTML = `
        <div>
          <div style="font-weight: 600; font-size: 14px; color: #ffffff;">${food.food_name}</div>
          <div style="font-size: 12px; color: var(--text-dim);">
            ${food.category} • Standard: ${food.serving_size}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-family: var(--font-heading); font-weight: 700; color: var(--primary-light); font-size: 14px;">
            ${food.calories_per_100g} kcal
          </div>
          <div style="font-size: 11px; color: var(--text-muted);">per 100g</div>
        </div>
      `;

      item.addEventListener('click', () => {
        document.querySelectorAll('.search-result-item').forEach((el) => el.classList.remove('selected'));
        item.classList.add('selected');
        selectedFood = food;

        // Show calculator
        document.getElementById('serving-calculator').style.display = 'block';
        document.getElementById('selected-food-title').textContent = food.food_name;
        document.getElementById('selected-food-source').textContent = food.source;
        document.getElementById('confirm-add-food-btn').disabled = false;

        updateDynamicServingCalculation();
      });

      container.appendChild(item);
    });
  } catch (err) {
    container.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--danger);">${err.message}</div>`;
  }
}

/**
 * Dynamic Proportional Gram Calculator
 * Math: (per100g * grams) / 100
 */
function updateDynamicServingCalculation() {
  if (!selectedFood) return;

  const grams = parseFloat(document.getElementById('serving-grams-input').value) || 0;
  const mult = grams / 100;

  const calcCal = (selectedFood.calories_per_100g * mult).toFixed(1);
  const calcP = (selectedFood.protein_per_100g * mult).toFixed(1);
  const calcC = (selectedFood.carbs_per_100g * mult).toFixed(1);
  const calcF = (selectedFood.fat_per_100g * mult).toFixed(1);
  const calcFib = ((selectedFood.fibre_per_100g || 0) * mult).toFixed(1);

  document.getElementById('calc-calories').textContent = calcCal;
  document.getElementById('calc-protein').textContent = calcP;
  document.getElementById('calc-carbs').textContent = calcC;
  document.getElementById('calc-fat').textContent = calcF;
  document.getElementById('calc-fibre').textContent = calcFib;
}

window.deleteMealEntry = deleteMealEntry;
