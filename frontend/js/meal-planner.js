/**
 * FitMaster AI – Meal Planner Client Logic
 * Coordinates meal plan creation, food search, macro calculations, and goal-matching suggestions.
 */

let plannerDate = new Date().toISOString().split('T')[0];
let plannedItems = [];
let planTargets = { calories: 2000, protein: 150, carbs: 250, fat: 65 };
let activePlanSlot = 'breakfast';
let selectedPlanFood = null;
let plannerSearchDebounce = null;

document.addEventListener('DOMContentLoaded', async () => {
  const dateInput = document.getElementById('planner-date-picker');
  if (dateInput) {
    dateInput.value = plannerDate;
    dateInput.addEventListener('change', (e) => {
      plannerDate = e.target.value;
      loadMealPlan();
    });
  }

  document.getElementById('save-plan-btn')?.addEventListener('click', saveCurrentPlan);
  document.getElementById('clear-plan-btn')?.addEventListener('click', clearCurrentPlan);
  document.getElementById('refresh-suggestions-btn')?.addEventListener('click', loadPlanSuggestions);

  setupPlannerModalListeners();
  await loadMealPlan();
});

/**
 * Load meal plan from backend
 */
async function loadMealPlan() {
  try {
    const res = await api.get(`/meal-plans?date=${plannerDate}`);
    const data = res.data;

    planTargets = data.targets || planTargets;
    plannedItems = (data.items || []).map((itm) => ({
      food_id: itm.food_id,
      food_name: itm.food_name,
      meal_type: itm.meal_type,
      quantity_grams: parseFloat(itm.quantity_grams),
      calories: parseFloat(itm.calculated_calories),
      protein: parseFloat(itm.calculated_protein),
      carbs: parseFloat(itm.calculated_carbs),
      fat: parseFloat(itm.calculated_fat)
    }));

    renderPlannedItems();
    await loadPlanSuggestions();
  } catch (err) {
    showToast('Failed to load meal plan', err.message, 'error');
  }
}

/**
 * Render items in their respective slot cards and update target totals
 */
function renderPlannedItems() {
  const slots = ['breakfast', 'lunch', 'dinner', 'snacks'];
  let totCal = 0, totP = 0, totC = 0, totF = 0;

  slots.forEach((slot) => {
    const container = document.getElementById(`plan-${slot}-items`);
    const slotItems = plannedItems.filter((i) => i.meal_type === slot);

    if (slotItems.length === 0) {
      container.innerHTML = `<div class="empty-meal-placeholder">No ${slot} items planned.</div>`;
      return;
    }

    container.innerHTML = '';
    slotItems.forEach((itm, idx) => {
      totCal += itm.calories;
      totP += itm.protein;
      totC += itm.carbs;
      totF += itm.fat;

      const row = document.createElement('div');
      row.className = 'planner-item-row';
      row.innerHTML = `
        <div>
          <strong style="color: #ffffff; font-size: 13px;">${itm.food_name}</strong>
          <div style="font-size: 11px; color: var(--text-dim);">
            ${itm.quantity_grams}g • ${itm.calories} kcal • ${itm.protein}g P • ${itm.carbs}g C • ${itm.fat}g F
          </div>
        </div>
        <button class="delete-item-btn" title="Remove Item" onclick="removePlannedItem('${slot}', ${idx})">&times;</button>
      `;
      container.appendChild(row);
    });
  });

  // Update comparison header
  document.getElementById('plan-calories-val').textContent = `${Math.round(totCal)} / ${Math.round(planTargets.calories)} kcal`;
  document.getElementById('plan-protein-val').textContent = `${Math.round(totP)}g / ${Math.round(planTargets.protein)}g`;
  document.getElementById('plan-carbs-val').textContent = `${Math.round(totC)}g / ${Math.round(planTargets.carbs)}g`;
  document.getElementById('plan-fat-val').textContent = `${Math.round(totF)}g / ${Math.round(planTargets.fat)}g`;
}

/**
 * Remove an item from the in-memory plan
 */
function removePlannedItem(slot, idx) {
  const filteredIndices = [];
  plannedItems.forEach((item, originalIndex) => {
    if (item.meal_type === slot) filteredIndices.push(originalIndex);
  });
  const originalIdx = filteredIndices[idx];
  if (originalIdx !== undefined) {
    plannedItems.splice(originalIdx, 1);
    renderPlannedItems();
  }
}

/**
 * Save current plan to database
 */
async function saveCurrentPlan() {
  const saveBtn = document.getElementById('save-plan-btn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spinner"></span> Saving...';

  try {
    await api.post('/meal-plans', {
      plan_date: plannerDate,
      plan_name: `Planned Menu for ${plannerDate}`,
      items: plannedItems
    });

    showToast('Plan Saved', `Meal plan for ${plannerDate} saved to database!`, 'success');
  } catch (err) {
    showToast('Save Failed', err.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '💾 Save Meal Plan';
  }
}

/**
 * Clear in-memory plan
 */
function clearCurrentPlan() {
  if (!confirm('Clear all planned meals for this date?')) return;
  plannedItems = [];
  renderPlannedItems();
  showToast('Plan Cleared', 'Click "Save Meal Plan" if you wish to persist the cleared state.', 'info');
}

/**
 * Fetch and render smart goal-matching suggestions
 */
async function loadPlanSuggestions() {
  const container = document.getElementById('suggestions-list-container');
  container.innerHTML = '<div style="text-align: center; padding: 20px;"><span class="spinner"></span> Matching macros...</div>';

  try {
    const res = await api.get(`/meal-plans/suggestions?date=${plannerDate}`);
    const { suggestions, remaining_calories, remaining_protein } = res.data;

    if (!suggestions || suggestions.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-dim);">Your target macros are already fulfilled!</div>';
      return;
    }

    container.innerHTML = `
      <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
        Remaining: <strong style="color: var(--primary-light);">${remaining_calories} kcal</strong>, 
        <strong style="color: #60a5fa;">${remaining_protein}g protein</strong>
      </div>
    `;

    suggestions.forEach((food) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'suggestion-item';
      itemEl.innerHTML = `
        <div class="suggestion-header">
          <span class="suggestion-name">${food.food_name}</span>
          <span class="suggestion-macro-pill">${food.protein_per_100g}g P / 100g</span>
        </div>
        <p class="suggestion-rationale">${food.rationale}</p>
        <button class="btn btn-secondary btn-sm" style="font-size: 11px; width: 100%;" onclick="quickAddSuggestion(${food.food_id}, '${food.food_name.replace(/'/g, "\\'")}', ${food.calories_per_100g}, ${food.protein_per_100g}, ${food.carbs_per_100g}, ${food.fat_per_100g})">
          + Quick Add (100g to Lunch)
        </button>
      `;
      container.appendChild(itemEl);
    });
  } catch (err) {
    container.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--danger);">${err.message}</div>`;
  }
}

/**
 * Quick add suggestion
 */
function quickAddSuggestion(foodId, foodName, cal, p, c, f) {
  plannedItems.push({
    food_id: foodId,
    food_name: foodName,
    meal_type: 'lunch',
    quantity_grams: 100,
    calories: cal,
    protein: p,
    carbs: c,
    fat: f
  });
  renderPlannedItems();
  showToast('Suggestion Added', `Added 100g ${foodName} to Planned Lunch.`, 'success');
}

/**
 * Modal listeners for Planner
 */
function setupPlannerModalListeners() {
  const modal = document.getElementById('planner-food-modal');
  const closeBtn = document.getElementById('modal-planner-close');
  const cancelBtn = document.getElementById('modal-planner-cancel');
  const searchInput = document.getElementById('planner-search-input');
  const gramsInput = document.getElementById('plan-grams-input');
  const confirmBtn = document.getElementById('confirm-plan-add-btn');

  document.querySelectorAll('.plan-add-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      activePlanSlot = e.currentTarget.dataset.meal;
      document.getElementById('modal-plan-slot').textContent = activePlanSlot.charAt(0).toUpperCase() + activePlanSlot.slice(1);
      selectedPlanFood = null;
      document.getElementById('planner-calculator-box').style.display = 'none';
      confirmBtn.disabled = true;
      modal.classList.add('active');
      searchInput.value = '';
      executePlannerSearch('');
    });
  });

  const closeModal = () => modal.classList.remove('active');
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  searchInput?.addEventListener('input', (e) => {
    clearTimeout(plannerSearchDebounce);
    plannerSearchDebounce = setTimeout(() => {
      executePlannerSearch(e.target.value.trim());
    }, 250);
  });

  confirmBtn?.addEventListener('click', () => {
    if (!selectedPlanFood) return;
    const grams = parseFloat(gramsInput.value) || 100;
    const mult = grams / 100;

    plannedItems.push({
      food_id: selectedPlanFood.food_id,
      food_name: selectedPlanFood.food_name,
      meal_type: activePlanSlot,
      quantity_grams: grams,
      calories: Number((selectedPlanFood.calories_per_100g * mult).toFixed(1)),
      protein: Number((selectedPlanFood.protein_per_100g * mult).toFixed(1)),
      carbs: Number((selectedPlanFood.carbs_per_100g * mult).toFixed(1)),
      fat: Number((selectedPlanFood.fat_per_100g * mult).toFixed(1))
    });

    renderPlannedItems();
    closeModal();
    showToast('Item Added', `Added ${grams}g ${selectedPlanFood.food_name} to planned ${activePlanSlot}.`, 'success');
  });
}

async function executePlannerSearch(q) {
  const container = document.getElementById('planner-search-results');
  container.innerHTML = '<div style="text-align: center; padding: 20px;"><span class="spinner"></span> Searching...</div>';

  try {
    const res = await api.get(`/foods/search?q=${encodeURIComponent(q)}`);
    const foods = res.data.foods || [];

    if (foods.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-dim);">No matching foods found.</div>';
      return;
    }

    container.innerHTML = '';
    foods.forEach((food) => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `
        <div>
          <div style="font-weight: 600; font-size: 14px; color: #ffffff;">${food.food_name}</div>
          <div style="font-size: 11px; color: var(--text-dim);">${food.category}</div>
        </div>
        <div style="text-align: right;">
          <div style="color: var(--primary-light); font-weight: 700; font-size: 13px;">${food.calories_per_100g} kcal</div>
          <div style="font-size: 11px; color: var(--text-muted);">${food.protein_per_100g}g protein / 100g</div>
        </div>
      `;

      item.addEventListener('click', () => {
        document.querySelectorAll('#planner-search-results .search-result-item').forEach((el) => el.classList.remove('selected'));
        item.classList.add('selected');
        selectedPlanFood = food;

        document.getElementById('planner-calculator-box').style.display = 'block';
        document.getElementById('plan-food-name').textContent = food.food_name;
        document.getElementById('confirm-plan-add-btn').disabled = false;
      });

      container.appendChild(item);
    });
  } catch (err) {
    container.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--danger);">${err.message}</div>`;
  }
}

window.removePlannedItem = removePlannedItem;
window.quickAddSuggestion = quickAddSuggestion;
