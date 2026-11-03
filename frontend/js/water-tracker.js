/**
 * FitMaster AI – Hydration Tracker Client Script
 * Manages water intake logging, circular fluid gauge visualization, and date-based history.
 */

let waterDate = new Date().toISOString().split('T')[0];

document.addEventListener('DOMContentLoaded', async () => {
  const dateInput = document.getElementById('water-date-picker');
  if (dateInput) {
    dateInput.value = waterDate;
    dateInput.addEventListener('change', (e) => {
      waterDate = e.target.value;
      loadWaterData();
    });
  }

  document.getElementById('water-prev-day-btn')?.addEventListener('click', () => changeWaterDate(-1));
  document.getElementById('water-next-day-btn')?.addEventListener('click', () => changeWaterDate(1));

  // Quick preset buttons (+150ml, +250ml, +500ml, +750ml)
  document.querySelectorAll('.quick-water-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const ml = parseInt(e.currentTarget.dataset.ml, 10);
      await logWaterAmount(ml);
    });
  });

  // Custom water form
  const customForm = document.getElementById('custom-water-form');
  if (customForm) {
    customForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('custom-water-input');
      const ml = parseInt(input.value, 10);
      if (ml > 0) {
        await logWaterAmount(ml);
        input.value = '';
      }
    });
  }

  await loadWaterData();
});

function changeWaterDate(daysOffset) {
  const d = new Date(waterDate);
  d.setDate(d.getDate() + daysOffset);
  waterDate = d.toISOString().split('T')[0];
  document.getElementById('water-date-picker').value = waterDate;
  loadWaterData();
}

/**
 * Load hydration data for selected date
 */
async function loadWaterData() {
  try {
    const res = await api.get(`/water?date=${waterDate}`);
    renderWaterUI(res.data);
  } catch (err) {
    showToast('Failed to load hydration', err.message, 'error');
  }
}

/**
 * Render circular gauge, stats, and ledger
 */
function renderWaterUI(data) {
  const { target_ml, consumed_ml, remaining_ml, percentage, logs, date } = data;

  // Update Badge & Header
  document.getElementById('water-goal-badge').textContent = `Daily Goal: ${Math.round(target_ml)} ml`;
  document.getElementById('ledger-date-text').textContent = `Logged entries for ${date}`;
  document.getElementById('ledger-entry-count').textContent = `${logs.length} ${logs.length === 1 ? 'log' : 'logs'}`;

  // Update Gauge
  const boundedPercent = Math.min(100, percentage);
  const fillLevel = document.getElementById('water-fill-level');
  if (fillLevel) {
    fillLevel.style.height = `${boundedPercent}%`;
  }

  document.getElementById('water-percent-val').textContent = `${percentage}%`;
  document.getElementById('water-consumed-label').textContent = `${consumed_ml} / ${Math.round(target_ml)} ml`;

  // Update Stats Box
  document.getElementById('water-consumed-num').textContent = `${consumed_ml} ml`;
  document.getElementById('water-remaining-num').textContent = `${remaining_ml} ml`;

  // Render History Ledger
  const container = document.getElementById('water-history-container');
  if (logs.length === 0) {
    container.innerHTML = `<div class="empty-meal-placeholder">No water logged for ${date} yet.</div>`;
    return;
  }

  container.innerHTML = '';
  logs.forEach((log) => {
    const timeStr = log.logged_at ? new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Logged';
    const row = document.createElement('div');
    row.className = 'intake-row';
    row.innerHTML = `
      <div class="intake-meta">
        <span class="intake-icon">💧</span>
        <div>
          <div class="intake-amount">+${log.amount_ml} ml</div>
          <div class="intake-time">${timeStr}</div>
        </div>
      </div>
      <button class="delete-item-btn" title="Delete Entry" onclick="deleteWaterEntry(${log.water_id})">&times;</button>
    `;
    container.appendChild(row);
  });
}

/**
 * Log fluid intake
 */
async function logWaterAmount(amountMl) {
  try {
    const res = await api.post('/water', {
      amount_ml: amountMl,
      date: waterDate
    });
    showToast('Hydration Logged', `Added +${amountMl} ml of water.`, 'success');
    renderWaterUI(res.data);
  } catch (err) {
    showToast('Logging Failed', err.message, 'error');
  }
}

/**
 * Delete hydration log
 */
async function deleteWaterEntry(waterId) {
  try {
    await api.delete(`/water/${waterId}`);
    showToast('Entry Removed', 'Hydration record deleted.', 'success');
    await loadWaterData();
  } catch (err) {
    showToast('Delete Failed', err.message, 'error');
  }
}

window.deleteWaterEntry = deleteWaterEntry;
