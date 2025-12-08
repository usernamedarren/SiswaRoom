import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

// Load dashboard static HTML
export async function initDashboard(container) {
  try {
    const response = await fetch(new URL('../static/dashboard.html', import.meta.url).href);
    if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
    const html = await response.text();
    container.innerHTML = html;
    
    // Initialize logic
    loadDashboardStats();
    loadMyCourses();
    loadUpcomingClasses();
    loadRecentActivity();
    setupAdminLink();
  } catch (err) {
    console.error('[DASHBOARD] Failed to load HTML:', err);
    container.innerHTML = '<p>Error loading dashboard. Please refresh.</p>';
  }
}

async function loadDashboardStats() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    const stats = await res.json();

    document.getElementById('stat-subjects').textContent = stats.subjects || 0;
    document.getElementById('stat-materials').textContent = stats.materials || 0;
    document.getElementById('stat-questions').textContent = stats.questions || 0;
    document.getElementById('stat-quizzes').textContent = stats.quizzes || 0;
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

async function loadMyCourses() {
  try {
    const res = await fetch(`${API_BASE}/subjects`, {
      headers: AuthService.getAuthHeaders()
    });
    const courses = await res.json();
    const container = document.getElementById('my-courses-list');

    if (!courses || courses.length === 0) {
      container.innerHTML = '<p style="color: #94a3b8; text-align: center;">Tidak ada kursus</p>';
      return;
    }

    container.innerHTML = courses.slice(0, 5).map(course => `
      <div data-course-id="${course.subject_id}" class="course-card" style="padding: 1rem; background: #f8fafc; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-left: 4px solid #7c3aed;">
        <div>
          <div style="font-weight: 600; color: #1e293b; margin-bottom: 0.25rem;">${course.name}</div>
          <div style="font-size: 0.85rem; color: #64748b;">${course.teacher_name || 'Unknown'}</div>
        </div>
        <div style="font-size: 1.2rem;">→</div>
      </div>
    `).join('');

    // Add click event listeners
    container.querySelectorAll('.course-card').forEach(card => {
      card.addEventListener('click', () => {
        const courseId = card.dataset.courseId;
        window.location.hash = `#/subjects/${courseId}`;
      });
    });
  } catch (err) {
    console.error('Error loading courses:', err);
  }
}

async function loadUpcomingClasses() {
  try {
    const res = await fetch(`${API_BASE}/schedules`, {
      headers: AuthService.getAuthHeaders()
    });
    const result = await res.json();
    const schedules = result.data || result;
    const container = document.getElementById('upcoming-classes');

    if (!schedules || schedules.length === 0) {
      container.innerHTML = '<p style="color: #94a3b8; text-align: center;">Tidak ada jadwal</p>';
      return;
    }

    container.innerHTML = schedules.slice(0, 5).map(schedule => {
      const dateVal = schedule.schedule_date || schedule.class_date;
      const timeVal = schedule.schedule_time || schedule.start_time;
      return `
        <div style="padding: 1rem; background: #f8fafc; border-radius: 8px; border-left: 4px solid #4facfe;">
          <div style="font-weight: 600; color: #1e293b; margin-bottom: 0.5rem;">${schedule.subject_name || 'Class'}</div>
          <div style="font-size: 0.85rem; color: #64748b;">
            📅 ${dateVal ? new Date(dateVal).toLocaleDateString('id-ID') : 'N/A'}
            <br>
            ⏰ ${timeVal ? String(timeVal).substring(0, 5) : 'N/A'}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading schedules:', err);
  }
}

function loadRecentActivity() {
  const activities = [
    { icon: '✅', text: 'Menyelesaikan Quiz Matematika', time: '2 jam lalu' },
    { icon: '📚', text: 'Membuka materi Fisika Klasik', time: '1 hari lalu' },
    { icon: '🎯', text: 'Nilai Quiz: 85/100', time: '3 hari lalu' },
    { icon: '🎓', text: 'Mendaftar kursus Bahasa Inggris', time: '1 minggu lalu' }
  ];
  
  const container = document.getElementById('recent-activity');
  container.innerHTML = activities.map(activity => `
    <div style="padding: 0.875rem; background: #f8fafc; border-radius: 8px; border-left: 4px solid #7c3aed;">
      <div style="font-weight: 500; color: #1e293b; margin-bottom: 0.25rem;">${activity.icon} ${activity.text}</div>
      <div style="font-size: 0.8rem; color: #94a3b8;">${activity.time}</div>
    </div>
  `).join('');
}

function setupAdminLink() {
  const user = AuthService.getUser();
  const userName = AuthService.getUserName();
  document.getElementById('user-name').textContent = userName || 'User';
  
  const adminLink = document.getElementById('admin-link');
  if (user && user.role === 'admin') {
    adminLink.style.display = 'block';
  }
}
