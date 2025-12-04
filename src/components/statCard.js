export function StatCard(icon, color, label, value) {
  return `
    <div class="stat-card">
      <div class="stat-iconbox" style="background:${color}">
        ${icon}
      </div>
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
    </div>
  `;
}
