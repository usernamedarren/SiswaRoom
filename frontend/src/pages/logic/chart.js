const Chart = (typeof window !== "undefined" && window.Chart) ? window.Chart : null;

function ensureChart() {
  if (!Chart) {
    throw new Error("Chart.js not loaded. Ensure CDN script is included in index.html.");
  }
  return Chart;
}

// Simple, reusable wrapper helpers around Chart.js for the dashboard
// Exported helpers: createBarChart, createDoughnutChart, destroyChart

/**
 * Create a bar chart with value labels above bars.
 * @param {CanvasRenderingContext2D|HTMLCanvasElement} ctxOrCanvas
 * @param {string[]} labels
 * @param {number[]} values
 * @param {object} opts
 * @returns {Chart}
 */
export function createBarChart(ctxOrCanvas, labels = [], values = [], opts = {}) {
  const ChartLib = ensureChart();
  const canvas = (ctxOrCanvas && ctxOrCanvas.tagName) ? ctxOrCanvas : (ctxOrCanvas && ctxOrCanvas.canvas) ? ctxOrCanvas.canvas : null;
  const ctx = canvas ? canvas.getContext('2d') : ctxOrCanvas;

  // Theme-aware colors
  const cs = getComputedStyle(document.documentElement);
  const textColor = cs.getPropertyValue('--text-primary').trim() || '#f9fafb';
  const muted = cs.getPropertyValue('--text-secondary').trim() || '#9ca3af';
  const borderSoft = cs.getPropertyValue('--border-soft').trim() || 'rgba(255,255,255,0.06)';
  const accent = cs.getPropertyValue('--accent-primary').trim() || '#7b5cff';
  const accent2 = cs.getPropertyValue('--accent-secondary').trim() || '#4aa8ff';

  // Helper to make rgba from hex-ish string
  const toRgba = (hex, alpha = 1) => {
    try {
      const h = hex.trim();
      if (h.startsWith('rgba') || h.startsWith('rgb')) return h;
      if (h.startsWith('#')) {
        const v = h.substring(1);
        const bigint = parseInt(v.length === 3 ? v.split('').map(c=>c+c).join('') : v, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    } catch (e) { /* ignore */ }
    return hex;
  };

  const barValuePlugin = {
    id: 'barValuePlugin',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((bar, index) => {
          const val = dataset.data[index];
          const x = bar.x;
          const y = bar.y - 8;
          ctx.save();
          ctx.fillStyle = textColor || '#fff';
          ctx.font = '12px "Inter", system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(String(val), x, y);
          ctx.restore();
        });
      });
    }
  };

  const bgColor = opts.backgroundColor || toRgba(accent, 0.9);
  const hoverBg = toRgba(accent2, 0.95);

  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: opts.label || '',
        data: values,
        backgroundColor: Array.isArray(bgColor) ? bgColor : bgColor,
        hoverBackgroundColor: hoverBg,
        borderRadius: 6,
        maxBarThickness: 48
      }]
    },
    options: Object.assign({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: cs.getPropertyValue('--bg-surface').trim() || '#171a2e',
          titleColor: textColor,
          bodyColor: muted
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: muted } },
        y: { beginAtZero: true, max: 100, grid: { color: borderSoft }, ticks: { color: muted } }
      }
    }, opts.options || {}),
    plugins: [barValuePlugin, ...(opts.plugins || [])]
  };

  return new ChartLib(ctx, config);
}

/**
 * Create a doughnut chart with percentage labels inside slices.
 * @param {CanvasRenderingContext2D|HTMLCanvasElement} ctxOrCanvas
 * @param {string[]} labels
 * @param {number[]} values
 * @param {object} opts
 * @returns {Chart}
 */
export function createDoughnutChart(ctxOrCanvas, labels = [], values = [], opts = {}) {
  const ChartLib = ensureChart();
  const canvas = (ctxOrCanvas && ctxOrCanvas.tagName) ? ctxOrCanvas : (ctxOrCanvas && ctxOrCanvas.canvas) ? ctxOrCanvas.canvas : null;
  const ctx = canvas ? canvas.getContext('2d') : ctxOrCanvas;

  const cs = getComputedStyle(document.documentElement);
  const textColor = cs.getPropertyValue('--text-primary').trim() || '#f9fafb';
  const muted = cs.getPropertyValue('--text-secondary').trim() || '#9ca3af';

  const doughnutValuePlugin = {
    id: 'doughnutValuePlugin',
    afterDatasetDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      const total = (chart.data.datasets[0].data || []).reduce((a, b) => a + b, 0) || 1;

      meta.data.forEach((arc, index) => {
        const val = chart.data.datasets[0].data[index];
        const percent = Math.round((val / total) * 100);
        const pos = arc.tooltipPosition();
        ctx.save();
        ctx.fillStyle = textColor || '#fff';
        ctx.font = '11px "Inter", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(percent + '%', pos.x, pos.y);
        ctx.restore();
      });
    }
  };

  const colors = labels.map((_, i) => `hsl(${(i * 60) % 360} 70% 50%)`);

  const config = {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: opts.backgroundColor || colors }]
    },
    options: Object.assign({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: opts.legendPosition || 'bottom', labels: { color: muted } },
        tooltip: { backgroundColor: cs.getPropertyValue('--bg-surface').trim() || '#171a2e', titleColor: textColor, bodyColor: muted }
      },
      cutout: opts.cutout || '60%'
    }, opts.options || {}),
    plugins: [doughnutValuePlugin, ...(opts.plugins || [])]
  };

  // optional center text
  if (opts.centerText) {
    const centerPlugin = {
      id: 'centerText',
      afterDraw(chart) {
        const { ctx } = chart;
        const { width, height } = chart;
        ctx.save();
        ctx.fillStyle = textColor;
        ctx.font = '600 16px "Inter", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(opts.centerText, width / 2, height / 2);
        ctx.restore();
      }
    };
    config.plugins.unshift(centerPlugin);
  }

  return new ChartLib(ctx, config);
}

/**
 * Safely destroy a Chart instance
 * @param {Chart} chart
 */
export function destroyChart(chart) {
  try {
    if (!chart) return;
    if (typeof chart.destroy === 'function') chart.destroy();
  } catch (err) {
    console.warn('Error destroying chart', err);
  }
}

/**
 * Create a horizontal progress bar chart (indexAxis: 'y') with value labels at the end
 * @param {CanvasRenderingContext2D|HTMLCanvasElement} ctxOrCanvas
 * @param {string[]} labels
 * @param {number[]} values (0-100)
 * @param {object} opts
 * @returns {Chart}
 */
export function createHorizontalBarChart(ctxOrCanvas, labels = [], values = [], opts = {}) {
  const canvas = (ctxOrCanvas && ctxOrCanvas.tagName) ? ctxOrCanvas : (ctxOrCanvas && ctxOrCanvas.canvas) ? ctxOrCanvas.canvas : null;
  const ctx = canvas ? canvas.getContext('2d') : ctxOrCanvas;

  const cs = getComputedStyle(document.documentElement);
  const textColor = cs.getPropertyValue('--text-primary').trim() || '#f9fafb';
  const muted = cs.getPropertyValue('--text-secondary').trim() || '#9ca3af';
  const borderSoft = cs.getPropertyValue('--border-soft').trim() || 'rgba(255,255,255,0.06)';
  const accent = cs.getPropertyValue('--accent-primary').trim() || '#7b5cff';

  const endLabelPlugin = {
    id: 'endLabelPlugin',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      chart.getDatasetMeta(0).data.forEach((bar, index) => {
        const val = chart.data.datasets[0].data[index];
        const pos = { x: bar.x + 6, y: bar.y };
        ctx.save();
        ctx.fillStyle = textColor;
        ctx.font = '12px "Inter", system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(val) + '%', pos.x, pos.y);
        ctx.restore();
      });
    }
  };

  const bg = opts.backgroundColor || accent;

  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: opts.label || '',
        data: values,
        backgroundColor: Array.isArray(bg) ? bg : bg,
        borderRadius: 8,
        barThickness: opts.barThickness || 22,
        maxBarThickness: opts.maxBarThickness || 32
      }]
    },
    options: Object.assign({
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      elements: { bar: { borderRadius: 8 } },
      scales: {
        x: { beginAtZero: true, max: 100, grid: { color: borderSoft }, ticks: { color: muted } },
        y: { grid: { display: false }, ticks: { color: muted } }
      },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: cs.getPropertyValue('--bg-surface').trim() || '#171a2e', titleColor: textColor, bodyColor: muted }
      }
    }, opts.options || {}),
    plugins: [endLabelPlugin, ...(opts.plugins || [])]
  };

  return new Chart(ctx, config);
}
