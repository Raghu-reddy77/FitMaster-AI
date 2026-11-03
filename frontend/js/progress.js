/**
 * FitMaster AI – Progress Analytics Controller
 * Manages Matplotlib chart rendering, tabs switching, and weight tracking.
 */

let currentTab = 'daily';

document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('weight-date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  const sidebar = document.getElementById('app-sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  loadActiveChart();
  loadWeightHistory();
});

function switchChartTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.analytics-tab').forEach((b) => {
    b.classList.toggle('active', b.dataset.chart === tab);
  });
  loadActiveChart();
}

async function loadActiveChart() {
  const imgEl = document.getElementById('main-analytics-chart');
  const multiContainer = document.getElementById('model-multi-chart-container');
  const loader = document.getElementById('chart-loader');
  const user = getCurrentUser();
  const userId = user ? user.userId : 1;

  if (currentTab === 'model') {
    imgEl.style.display = 'none';
    multiContainer.style.display = 'block';
    return;
  }

  multiContainer.style.display = 'none';
  loader.style.display = 'block';
  imgEl.style.display = 'none';

  try {
    let endpoint = `/analytics/${currentTab}`;
    const res = await api.get(endpoint).catch(() => null);

    const chartUrl = res?.data?.chart_url || `/api/analytics/static/${getFallbackFilename(currentTab, userId)}`;
    imgEl.src = `${chartUrl}?t=${Date.now()}`;

    imgEl.onload = () => {
      loader.style.display = 'none';
      imgEl.style.display = 'block';
    };
    imgEl.onerror = () => {
      loader.innerHTML = `
        <div style="color: var(--text-dim); padding: 30px;">
          Chart has not yet been generated for today.<br>
          Log your meals in the <a href="food-tracker.html" style="color: var(--primary);">Food Tracker</a> to activate visualizations!
        </div>
      `;
    };
  } catch (err) {
    loader.innerHTML = `<div style="color: var(--danger);">Failed to load chart: ${err.message}</div>`;
  }
}

function getFallbackFilename(tab, userId) {
  switch (tab) {
    case 'daily': return `daily_calories_${userId}.png`;
    case 'weekly': return `weekly_trends_${userId}.png`;
    case 'weight': return `weight_history_${userId}.png`;
    default: return `daily_calories_${userId}.png`;
  }
}

async function regenerateActiveChart() {
  showToast('Refreshing Visualization', 'Triggering Matplotlib rendering engine...');
  loadActiveChart();
}

async function loadWeightHistory() {
  const tbody = document.getElementById('weight-history-tbody');
  const countLabel = document.getElementById('weight-count-label');
  if (!tbody) return;

  try {
    const res = await api.get('/progress/weekly').catch(() => null);
    // Also fetch direct weight history
    const user = getCurrentUser();
    const userId = user ? user.userId : 1;
    
    // Direct SQL query via backend
    const chartRes = await api.get('/analytics/weight').catch(() => null);
    const weightData = chartRes?.data?.weightData || [];

    if (countLabel) countLabel.textContent = `${weightData.length} records`;

    if (weightData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px;">
            No weight entries logged yet.
          </td>
        </tr>
      `;
      return;
    }

    // Sort descending by date
    weightData.sort((a, b) => new Date(b.recorded_date) - new Date(a.recorded_date));

    tbody.innerHTML = weightData.map((row, idx) => {
      const prev = weightData[idx + 1];
      let deltaText = '--';
      let deltaColor = 'var(--text-dim)';

      if (prev) {
        const diff = row.weight_kg - prev.weight_kg;
        if (diff > 0) {
          deltaText = `+${diff.toFixed(1)} kg`;
          deltaColor = 'var(--primary-light)';
        } else if (diff < 0) {
          deltaText = `${diff.toFixed(1)} kg`;
          deltaColor = '#60a5fa';
        } else {
          deltaText = '0.0 kg';
        }
      }

      return `
        <tr>
          <td style="font-weight: 600;">${row.recorded_date}</td>
          <td style="font-family: var(--font-heading); font-weight: 700; color: var(--text-main);">${Number(row.weight_kg).toFixed(1)} kg</td>
          <td style="font-weight: 600; color: ${deltaColor};">${deltaText}</td>
          <td style="color: var(--text-muted); font-size: 13px;">${row.notes || '—'}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="color: var(--danger); text-align: center;">Error loading history: ${err.message}</td></tr>`;
  }
}

async function handleWeightSubmit(e) {
  e.preventDefault();
  const date = document.getElementById('weight-date').value;
  const weight = parseFloat(document.getElementById('weight-kg').value);
  const notes = document.getElementById('weight-notes').value;

  try {
    await api.post('/progress/weight', {
      weight_kg: weight,
      recorded_date: date,
      notes: notes || 'Manual weigh-in log'
    });

    showToast('Weigh-In Saved', `${weight} kg recorded for ${date}!`);
    document.getElementById('weight-kg').value = '';
    document.getElementById('weight-notes').value = '';

    loadWeightHistory();
    if (currentTab === 'weight') {
      loadActiveChart();
    }
  } catch (err) {
    showToast('Failed to save weigh-in', err.message, 'error');
  }
}

window.switchChartTab = switchChartTab;
window.regenerateActiveChart = regenerateActiveChart;
window.handleWeightSubmit = handleWeightSubmit;
