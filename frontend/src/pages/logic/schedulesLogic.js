import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

// Load schedules page static HTML
export async function initSchedules(container) {
  try {
    const response = await fetch(
      new URL("../static/schedules.html", import.meta.url).href
    );
    if (!response.ok) throw new Error(`Failed to load: ${response.status}`);

    const html = await response.text();
    container.innerHTML = html;

    loadSchedules();
  } catch (err) {
    console.error("[SCHEDULES] Failed to load HTML:", err);
    container.innerHTML =
      "<p class='center text-gray'>Error loading schedules page. Silakan refresh.</p>";
  }
}

async function loadSchedules() {
  try {
    const res = await fetch(`${API_BASE}/schedules`, {
      headers: AuthService.getAuthHeaders(),
    });

    const result = await res.json();
    const schedules = result.data || result;

    const listContainer = document.getElementById("schedules-container");
    const noSchedules = document.getElementById("no-schedules");
    const calendarView = document.getElementById("calendar-view");

    if (!schedules || schedules.length === 0) {
      if (listContainer) listContainer.innerHTML = "";
      if (calendarView)
        calendarView.innerHTML =
          "<p class='center text-gray' style='grid-column:1/-1;'>Tidak ada jadwal</p>";
      if (noSchedules) noSchedules.style.display = "block";
      return;
    }

    if (noSchedules) noSchedules.style.display = "none";

    if (listContainer) {
      listContainer.innerHTML = schedules.map(renderScheduleItem).join("");
    }

    if (calendarView) {
      calendarView.innerHTML = schedules.map(renderCalendarCell).join("");
    }
  } catch (err) {
    console.error("[SCHEDULES] Error loading schedules:", err);
  }
}

function renderScheduleItem(schedule) {
  const dateVal = schedule.schedule_date || schedule.class_date;
  const timeVal = schedule.schedule_time || schedule.start_time;

  const dateText = dateVal
    ? new Date(dateVal).toLocaleDateString("id-ID")
    : "N/A";
  const timeText = timeVal ? String(timeVal).substring(0, 5) : "N/A";

  const subject = schedule.subject_name || "Class";
  const teacher = schedule.teacher_name || "Unknown";

  return `
    <div class="schedule-item fade-in-up">
      <div class="schedule-info">
        <h4>${subject}</h4>
        <p>Pengajar: ${teacher}</p>
      </div>
      <div class="schedule-time">
        📅 ${dateText}<br/>
        ⏰ ${timeText}
      </div>
    </div>
  `;
}

function renderCalendarCell(schedule) {
  const dateVal = schedule.schedule_date || schedule.class_date;
  const timeVal = schedule.schedule_time || schedule.start_time;

  if (!dateVal) {
    return `
      <div class="calendar-cell">
        <div class="calendar-date">Tanggal tidak diketahui</div>
      </div>
    `;
  }

  const d = new Date(dateVal);
  const dateText = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });

  const timeText = timeVal ? String(timeVal).substring(0, 5) : "N/A";
  const subject = schedule.subject_name || "Class";
  const teacher = schedule.teacher_name || "Unknown";

  return `
    <div class="calendar-cell fade-in-up">
      <div class="calendar-date">${dateText} • ${timeText}</div>
      <div class="calendar-lesson">
        ${subject}
        <span>Pengajar: ${teacher}</span>
      </div>
    </div>
  `;
}
