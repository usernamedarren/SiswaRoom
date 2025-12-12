import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

// Load Dashboard page
export async function initDashboard(container) {
  try {
    const response = await fetch(
      new URL("../static/dashboard.html", import.meta.url).href
    );
    container.innerHTML = await response.text();

    loadDashboardStats();
    loadMyCourses();
    loadUpcomingSchedules();
    loadRecentActivity();
    setupAdminVisibility();

  } catch (err) {
    console.error("[DASHBOARD] Error loading page:", err);
  }
}

function setupAdminVisibility() {
  const role = AuthService.getUserRole();
  const adminLink = document.getElementById("admin-link");

  if (role === "admin") adminLink.style.display = "block";
}

async function loadDashboardStats() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: AuthService.getAuthHeaders(),
    });

    const stats = await res.json();

    document.getElementById("stat-subjects").textContent = stats.subjects ?? "-";
    document.getElementById("stat-materials").textContent = stats.materials ?? "-";
    document.getElementById("stat-questions").textContent = stats.questions ?? "-";
    document.getElementById("stat-quizzes").textContent = stats.quizzes ?? "-";

  } catch (err) {
    console.error("[DASHBOARD] Failed to load stats:", err);
  }
}

async function loadMyCourses() {
  try {
    const res = await fetch(`${API_BASE}/courses/mine`, {
      headers: AuthService.getAuthHeaders(),
    });

    const courses = await res.json();
    const container = document.getElementById("my-courses-list");

    if (!courses || courses.length === 0) {
      container.innerHTML = `<p class="center text-gray">Tidak ada kursus.</p>`;
      return;
    }

    container.innerHTML = courses.map(course => `
      <div class="material-card fade-in-up">
        <div class="material-info">
          <h3>📘 ${course.course_name}</h3>
          <p>${course.description || "Tidak ada deskripsi"}</p>
          <button class="btn btn-primary full" onclick="location.href='#/course/${course.course_id}'">
            Lanjutkan
          </button>
        </div>
      </div>
    `).join("");

  } catch {
    document.getElementById("my-courses-list").innerHTML =
      `<p class="center text-gray">Gagal memuat kursus.</p>`;
  }
}

async function loadUpcomingSchedules() {
  try {
    const res = await fetch(`${API_BASE}/schedules/upcoming`, {
      headers: AuthService.getAuthHeaders(),
    });

    const schedules = await res.json();
    const container = document.getElementById("upcoming-classes");

    if (!schedules || schedules.length === 0) {
      container.innerHTML = `<p class="center text-gray">Tidak ada jadwal.</p>`;
      return;
    }

    container.innerHTML = schedules.map(s => `
      <div class="schedule-item fade-in-up">
        <div class="schedule-info">
          <h4>${s.subject_name}</h4>
          <p>Pengajar: ${s.teacher_name}</p>
        </div>
        <div class="schedule-time">
          📅 ${new Date(s.schedule_date).toLocaleDateString("id-ID")} <br>
          ⏰ ${String(s.schedule_time).substring(0, 5)}
        </div>
      </div>
    `).join("");

  } catch {
    document.getElementById("upcoming-classes").innerHTML =
      `<p class="center text-gray">Gagal memuat jadwal.</p>`;
  }
}

async function loadRecentActivity() {
  try {
    const res = await fetch(`${API_BASE}/activity/recent`, {
      headers: AuthService.getAuthHeaders(),
    });

    const activities = await res.json();
    const container = document.getElementById("recent-activity");

    if (!activities || activities.length === 0) {
      container.innerHTML = `<p class="center text-gray">Belum ada aktivitas.</p>`;
      return;
    }

    container.innerHTML = activities.map(a => `
      <div class="material-card fade-in-up">
        <div class="material-info">
          <h3>${a.title}</h3>
          <p>${a.description}</p>
          <span class="text-gray">${a.time}</span>
        </div>
      </div>
    `).join("");

  } catch {
    document.getElementById("recent-activity").innerHTML =
      `<p class="center text-gray">Gagal memuat aktivitas.</p>`;
  }
}
