
import { AuthService } from "../../utils/auth.js";
import { API_BASE } from "../../utils/config.js";
import { createBarChart, createDoughnutChart, createHorizontalBarChart, destroyChart } from './chart.js';

const DUMMY_DATA = false;
const MOCK_STATS = { subjects: 18, materials: 40, questions: 220, quizzes: 16 };
const MOCK_COURSES = [
  { course_id: "math101", course_name: "Matematika Dasar", description: "Belajar konsep dasar" },
  { course_id: "bio101", course_name: "Biologi", description: "Mengenal organisme" },
  { course_id: "chem101", course_name: "Kimia Dasar", description: "Mengenal reaksi dasar" }
];
const MOCK_SCHEDULES = [
  { subject_id: "math101", subject_name: "Matematika Dasar", teacher_name: "Pak Budi", schedule_date: "2025-12-21", schedule_time: "09:00", day: "Sunday" },
  { subject_id: "bio101", subject_name: "Biologi", teacher_name: "Bu Ani", schedule_date: "2025-12-22", schedule_time: "13:00", day: "Monday" },
  { subject_id: "chem101", subject_name: "Kimia Dasar", teacher_name: "Pak Rahman", schedule_date: "2025-12-24", schedule_time: "10:00", day: "Thursday" },
  { subject_id: "eng101", subject_name: "Bahasa Inggris", teacher_name: "Bu Siti", schedule_date: "2025-12-22", schedule_time: "11:30", day: "Tuesday" },
  { subject_id: "phys101", subject_name: "Fisika Dasar", teacher_name: "Pak Andi", schedule_date: "2025-12-26", schedule_time: "08:00", day: "Saturday" }
];
const MOCK_ACTIVITIES = [
  { title: "Menyelesaikan kuis Matematika 1", description: "Anda memperoleh 80%", time: "1 hari yang lalu" },
  { title: "Mengunggah tugas Biologi", description: "Tugas minggu ini", time: "3 hari yang lalu" },
  { title: "Mendapat badge: Matematika", description: "Prestasi terbaru", time: "5 hari yang lalu" }
];

// Mock data for charts (used in DUMMY_DATA mode)
const MOCK_QUIZ_SCORES = [
  { subject: "Matematika Dasar", avg: 78 },
  { subject: "Biologi", avg: 85 },
  { subject: "Kimia Dasar", avg: 72 },
  { subject: "Bahasa Inggris", avg: 88 },
  { subject: "Fisika Dasar", avg: 69 }
];

const MOCK_SUBJECT_PROGRESS = [
  { subject: "Matematika Dasar", progress: 0.6 },
  { subject: "Biologi", progress: 0.45 },
  { subject: "Kimia Dasar", progress: 0.8 },
  { subject: "Bahasa Inggris", progress: 0.9 },
  { subject: "Fisika Dasar", progress: 0.3 }
];

// Load Dashboard page
export async function initDashboard(container) {
  try {
    const response = await fetch(
      new URL("../static/dashboard.html", import.meta.url).href
    );
    container.innerHTML = await response.text();

    await setUserName();

    loadDashboardStats();
    loadMyCourses();
    loadRecentActivity();
    setupAdminVisibility();
    setupViewAllCoursesButton();

    // Charts under stats
    await setupDashboardCharts();
    setupChartControls();

  } catch (err) {
    console.error("[DASHBOARD] Error loading page:", err);
  }
}

async function setUserName() {
  try {
    const el = document.getElementById("user-name");
    if (!el) return;

    const cachedUser = AuthService.getUser();
    if (cachedUser?.name || cachedUser?.full_name) {
      el.textContent = cachedUser.name || cachedUser.full_name;
      return;
    }

    const res = await fetch(`${API_BASE}/auth/me`, { headers: AuthService.getAuthHeaders() });
    if (!res.ok) return;
    const user = await res.json();
    const display = user.full_name || user.name || user.email || "User";
    el.textContent = display;
    AuthService.setAuth(AuthService.getToken(), { ...user, name: display });
  } catch (err) {
    console.warn('[DASHBOARD] setUserName failed', err);
  }
}

function setupAdminVisibility() {
  const role = AuthService.getUser()?.role;
  const adminLink = document.getElementById("admin-link");

  if (!adminLink) return;
  if (role === "admin") adminLink.style.display = "block";
}

async function loadDashboardStats() {
  try {
    let stats = { ...MOCK_STATS };

    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: AuthService.getAuthHeaders(),
      });

      if (res.ok) {
        stats = await res.json();
      }
    } catch (err) {
      console.warn('[DASHBOARD] stats fallback to mock', err);
    }

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
    const container = document.getElementById("my-courses-list");

    let courses = [];
    try {
      const resMine = await fetch(`${API_BASE}/courses/mine`, {
        headers: AuthService.getAuthHeaders(),
      });
      if (resMine.ok) courses = await resMine.json();
    } catch (e) {
      console.warn('[DASHBOARD] /courses/mine unavailable, trying /courses');
    }

    if (!Array.isArray(courses) || courses.length === 0) {
      try {
        const res = await fetch(`${API_BASE}/courses`, { headers: AuthService.getAuthHeaders() });
        if (res.ok) courses = await res.json();
      } catch (e) {
        // ignore
      }
    }

    if ((!courses || courses.length === 0) && DUMMY_DATA) {
      courses = MOCK_COURSES;
    }

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

  } catch (err) {
    console.error('[DASHBOARD] loadMyCourses error', err);
    document.getElementById("my-courses-list").innerHTML =
      `<p class="center text-gray">Gagal memuat kursus.</p>`;
  }
} 

async function loadUpcomingSchedules() {
  try {
    const targetIds = ["upcoming-classes", "dashboard-upcoming-schedules"].filter(Boolean);

    let schedules = [];
    try {
      const res = await fetch(`${API_BASE}/schedules/upcoming`, {
        headers: AuthService.getAuthHeaders(),
      });
      if (res.ok) schedules = await res.json();
    } catch (e) {
      console.warn('[DASHBOARD] schedules endpoint unavailable', e);
    }

    // Defensive: ensure array and remove falsy entries
    schedules = Array.isArray(schedules) ? schedules.filter(Boolean) : [];

    targetIds.forEach(id => {
      const container = document.getElementById(id);
      if (!container) return;

      if (!schedules || schedules.length === 0) {
        container.innerHTML = `<p class="center text-gray">Tidak ada jadwal.</p>`;
        return;
      }

      container.innerHTML = schedules.map(s => {
        const dateText = s?.schedule_date ? new Date(s.schedule_date).toLocaleDateString("id-ID") : "N/A";
        const timeText = s?.schedule_time ? String(s.schedule_time).substring(0, 5) : "N/A";
        const subjectName = s?.subject_name || "Class";
        const teacherName = s?.teacher_name || "Unknown";
        const subjectId = s?.subject_id || "";

        return `
          <div class="schedule-item fade-in-up" onclick="location.hash='#/course/${subjectId}'" style="cursor:pointer;">
            <div class="schedule-info">
              <h4>${subjectName}</h4>
              <p>Pengajar: ${teacherName}</p>
            </div>
            <div class="schedule-time">
              📅 ${dateText} <br>
              ⏰ ${timeText}
            </div>
          </div>
        `;
      }).join("");
    });

  } catch (err) {
    console.error('[DASHBOARD] loadUpcomingSchedules error', err);
    const el = document.getElementById("dashboard-upcoming-schedules") || document.getElementById("upcoming-classes");
    if (el) el.innerHTML = `<p class="center text-gray">Gagal memuat jadwal.</p>`;
  }
} 

async function loadRecentActivity() {
  try {
    const container = document.getElementById("recent-activity");

    let activities = [];
    try {
      const res = await fetch(`${API_BASE}/activity/recent`, {
        headers: AuthService.getAuthHeaders(),
      });
      if (res.ok) activities = await res.json();
    } catch (e) {
      console.warn('[DASHBOARD] activity endpoint unavailable', e);
    }

    if ((!activities || activities.length === 0) && DUMMY_DATA) {
      activities = MOCK_ACTIVITIES;
    }

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

  } catch (err) {
    console.error('[DASHBOARD] loadRecentActivity error', err);
    document.getElementById("recent-activity").innerHTML =
      `<p class="center text-gray">Gagal memuat aktivitas.</p>`;
  }
}




function setupViewAllCoursesButton() {
  const btn = document.getElementById('view-all-courses');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '#/courses';
  });
}

/* ===== Dashboard Charts ===== */
async function setupDashboardCharts() {
  try {
    const statusEl = document.getElementById('chart-status');
    function setStatus(msg, isError = false) {
      if (statusEl) {
        statusEl.textContent = msg;
        statusEl.style.color = isError ? 'var(--danger, #d9534f)' : 'var(--text-muted, #6b7280)';
      }
      console.log('[charts] ' + msg);
    }

    setStatus('Menyiapkan grafik dashboard...');

    // quiz scores (bar chart)
    const quizCanvas = document.getElementById('chart-quiz-scores');
    const progressCanvas = document.getElementById('chart-subject-progress');


    const useDummy = window.__useDummyCharts ?? false;

    let quizData, progressData;

    if (!useDummy) {
      // Attempt to fetch from backend (fallback to mocks on any failure)
      try {
        const base = (typeof API_BASE !== 'undefined') ? API_BASE : '';
        const res = await fetch(`${base}/dashboard/charts`, {
          headers: (AuthService.getAuthHeaders && AuthService.getAuthHeaders()) || {}
        });
        if (res.ok) {
          const json = await res.json();
          quizData = json.quizScores || MOCK_QUIZ_SCORES;
          progressData = json.subjectProgress || MOCK_SUBJECT_PROGRESS;
        } else {
          quizData = MOCK_QUIZ_SCORES;
          progressData = MOCK_SUBJECT_PROGRESS;
        }
      } catch (err) {
        quizData = MOCK_QUIZ_SCORES;
        progressData = MOCK_SUBJECT_PROGRESS;
      }
    } else {
      quizData = MOCK_QUIZ_SCORES;
      progressData = MOCK_SUBJECT_PROGRESS;
    }

    // remember current data for raw view
    window.__dashboardCharts = window.__dashboardCharts || {};
    window.__dashboardCharts.lastQuizData = quizData;
    window.__dashboardCharts.lastProgressData = progressData;

    if (quizCanvas) renderQuizScoresChart(quizCanvas, quizData);
    if (progressCanvas) renderSubjectProgressChart(progressCanvas, progressData);

    updateRawData();

    // clear fallback view if present
    const fb = document.getElementById('chart-fallback');
    if (fb) fb.innerHTML = '';

    if (typeof setStatus === 'function') setStatus('Grafik berhasil dirender ✅');

  } catch (err) {
    console.error('[DASHBOARD] setupDashboardCharts error', err);
    const statusEl = document.getElementById('chart-status');
    if (statusEl) {
      statusEl.textContent = 'Error saat menyiapkan grafik: ' + (err && err.message ? err.message : String(err));
      statusEl.style.color = 'var(--danger, #d9534f)';
    }
    // show readable fallback
    renderChartFallback(MOCK_QUIZ_SCORES, MOCK_SUBJECT_PROGRESS);
    updateRawData();
  }
}

function renderQuizScoresChart(canvasEl, data) {
  if (!canvasEl) return;
  const labels = data.map(d => d.subject);
  const values = data.map(d => d.avg);

  // destroy previous instance if any
  if (canvasEl.__chartInstance) destroyChart(canvasEl.__chartInstance);

  const chart = createBarChart(canvasEl, labels, values, {
    label: 'Rata‑rata nilai (%)',
    backgroundColor: 'rgba(54, 162, 235, 0.8)'
  });

  canvasEl.__chartInstance = chart;
  window.__dashboardCharts.quiz = chart;
}

function renderSubjectProgressChart(canvasEl, data) {
  if (!canvasEl) return;

  try {
    const labels = (data || []).map(d => d.subject || 'N/A');
    const values = (data || []).map(d => Math.round((d.progress ?? d.value ?? 0) * 100));

    console.log('[charts] renderSubjectProgressChart labels=', labels, 'values=', values);

    // remove fixed width/height attributes to let CSS/JS control sizing
    try { canvasEl.removeAttribute && canvasEl.removeAttribute('width'); canvasEl.removeAttribute && canvasEl.removeAttribute('height'); } catch(e) {}

    // ensure canvas has enough height to show all bars clearly (use important to override global !important)
    const desiredHeight = Math.max(220, labels.length * 48 + 40);
    canvasEl.style.setProperty('height', desiredHeight + 'px', 'important');

    // log actual size for debugging
    console.log('[charts] canvas size', canvasEl.clientWidth, canvasEl.clientHeight);

    // destroy previous instance if any
    if (canvasEl.__chartInstance) destroyChart(canvasEl.__chartInstance);

    // Use horizontal progress chart with clear bar thickness
    const chart = createHorizontalBarChart(canvasEl, labels, values, {
      label: 'Progress',
      backgroundColor: labels.map((_, i) => `hsl(${(i * 60) % 360} 70% 50%)`),
      barThickness: 20,
      maxBarThickness: 40
    });

    // ensure chart draws
    if (chart && typeof chart.update === 'function') chart.update();

    canvasEl.__chartInstance = chart;
    window.__dashboardCharts.progress = chart;

    // update fallback view too (replace or add)
    const fb = document.getElementById('chart-fallback');
    if (fb) {
      // build progress HTML
      const progressRows = (data || []).map(p => `<li>${p.subject}: <strong>${Math.round((p.progress ?? (p.value||0)) * 100)}%</strong></li>`).join('');
      const progressHtml = `\n<div class="card" style="margin-top:.6rem;"><h4>Progress (dummy)</h4><ul style="margin:.5rem 0 0 1rem">${progressRows}</ul></div>`;
      // if already contains a progress section, replace it; otherwise append
      if (fb.querySelector('.card h4') && fb.innerHTML.includes('Progress (dummy)')) {
        fb.innerHTML = fb.innerHTML.replace(/<div class="card" style="margin-top:.6rem;">[\s\S]*?Progress \(dummy\)[\s\S]*?<\/div>/, progressHtml);
      } else {
        fb.innerHTML = fb.innerHTML + progressHtml;
      }
    }

    const statusEl = document.getElementById('chart-status');
    if (statusEl) { statusEl.textContent = 'Grafik progress dirender ✅'; statusEl.style.color = 'var(--text-muted, #6b7280)'; }

  } catch (err) {
    console.error('[DASHBOARD] renderSubjectProgressChart error', err);
    const statusEl = document.getElementById('chart-status');
    if (statusEl) {
      statusEl.textContent = 'Gagal merender grafik progress: ' + (err && err.message ? err.message : String(err));
      statusEl.style.color = 'var(--danger, #d9534f)';
    }

    // fallback: render data as list
    renderChartFallback(MOCK_QUIZ_SCORES, data);
    updateRawData();
  }
}



function updateRawData() {
  const el = document.getElementById('chart-data-raw');
  if (!el) return;
  const quiz = window.__dashboardCharts?.lastQuizData || MOCK_QUIZ_SCORES;
  const progress = window.__dashboardCharts?.lastProgressData || MOCK_SUBJECT_PROGRESS;
  el.textContent = JSON.stringify({ quizData: quiz, progressData: progress }, null, 2);
}

function renderChartFallback(quizData = [], progressData = []) {
  const el = document.getElementById('chart-fallback');
  if (!el) return;
  const quizRows = (quizData || []).map(q => `<tr><td style="padding:.4rem 0">${q.subject}</td><td style="padding:.4rem 0;text-align:right">${q.avg}</td></tr>`).join('');
  const progressRows = (progressData || []).map(p => `<li>${p.subject}: <strong>${Math.round((p.progress ?? (p.value||0)) * 100)}%</strong></li>`).join('');

  el.innerHTML = `
    <div class="card">
      <h4>Dummy Data — Rata‑rata Nilai Kuis</h4>
      <div style="overflow:auto">
        <table style="width:100%;border-collapse:collapse">
          <thead><tr><th style="text-align:left">Mata Pelajaran</th><th style="text-align:right">Rata‑rata (%)</th></tr></thead>
          <tbody>${quizRows}</tbody>
        </table>
      </div>
    </div>
    <div class="card" style="margin-top:.6rem;">
      <h4>Dummy Data — Progress Membaca</h4>
      <ul style="margin:.5rem 0 0 1rem">${progressRows}</ul>
    </div>
  `;
}

function setupChartControls() {
  try {
    const chk = document.getElementById('use-dummy-charts');
    const refreshBtn = document.getElementById('refresh-charts');
    const toggleDataBtn = document.getElementById('toggle-chart-data');
    const rawEl = document.getElementById('chart-data-raw');

    window.__useDummyCharts = chk ? chk.checked : false;

    if (chk) {
      chk.addEventListener('change', async () => {
        window.__useDummyCharts = chk.checked;
        await setupDashboardCharts();
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        await setupDashboardCharts();
      });
    }

    if (toggleDataBtn) {
      toggleDataBtn.addEventListener('click', () => {
        if (!rawEl) return;
        rawEl.style.display = rawEl.style.display === 'none' ? 'block' : 'none';
        if (rawEl.style.display === 'block') updateRawData();
      });
    }
  } catch (err) {
    console.error('[DASHBOARD] setupChartControls error', err);
  }
}
