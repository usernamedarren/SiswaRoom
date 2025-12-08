import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

// Load schedules page static HTML
export async function initSchedules(container) {
  const html = await fetch("./src/pages/static/schedules.html").then(r => r.text());
  container.innerHTML = html;
  
  // Initialize logic
  loadSchedules();
}

async function loadSchedules() {
  try {
    const res = await fetch(`${API_BASE}/schedules`, {
      headers: AuthService.getAuthHeaders()
    });
    const result = await res.json();
    const schedules = result.data || result;
    const container = document.getElementById('schedules-container');
    const noSchedules = document.getElementById('no-schedules');

    if (!schedules || schedules.length === 0) {
      container.innerHTML = '';
      noSchedules.style.display = 'block';
      return;
    }

    noSchedules.style.display = 'none';
    container.innerHTML = schedules.map(schedule => {
      const dateVal = schedule.schedule_date || schedule.class_date;
      const timeVal = schedule.schedule_time || schedule.start_time;
      return `
        <div style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 600; margin: 0 0 0.5rem 0;">
                ${schedule.subject_name || 'Class'}
              </h3>
              <p style="color: #64748b; font-size: 0.95rem; margin: 0;">
                Pengajar: ${schedule.teacher_name || 'Unknown'}
              </p>
            </div>
            <span style="background: #ddd6fe; color: #7c3aed; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; text-align: center;">
              📅 ${dateVal ? new Date(dateVal).toLocaleDateString('id-ID') : 'N/A'}
              <br>
              ⏰ ${timeVal ? String(timeVal).substring(0, 5) : 'N/A'}
            </span>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading schedules:', err);
  }
}
