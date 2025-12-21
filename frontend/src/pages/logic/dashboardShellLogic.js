// src/pages/logic/dashboardShellLogic.js
import { initDashboard } from "./dashboardLogic.js";

export async function initDashboardShell(app) {
  app.innerHTML = `
    <div class="vertical-scroll" id="vertical-scroll">
      <section class="page-section" id="dashboard-section"></section>
    </div>
  `;

  const dashboardHost = app.querySelector("#dashboard-section");

  // Render dashboard
  await initDashboard(dashboardHost);

  // expose helper
  window.__goToDashboard = () => {
    dashboardHost.scrollIntoView({ behavior: "smooth", block: "start" });
  };
} 
