export function StatCard(icon, color, label, value) {
  return `
    <div class="stat-card" style="animation: fadeInUp 0.6s ease;">
      <div class="stat-iconbox" style="background: ${color};">
        <span style="font-size: 2rem;">${icon}</span>
      </div>
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
    </div>
  `;
}
