import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

export async function initCourses(container) {
  try {
    const response = await fetch(new URL('../static/courses.html', import.meta.url).href);
    if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
    const html = await response.text();
    container.innerHTML = html;
    
    loadCourses();
  } catch (err) {
    console.error('[COURSES] Failed to load HTML:', err);
    container.innerHTML = '<p>Error loading courses page. Please refresh.</p>';
  }
}

async function loadCourses() {
  try {
    const res = await fetch(`${API_BASE}/courses`, {
      headers: AuthService.getAuthHeaders()
    });
    const courses = res.ok ? await res.json() : [];
    
    const container = document.getElementById('courses-container');
    const noCourses = document.getElementById('no-courses');

    if (!courses || courses.length === 0) {
      if (container) container.innerHTML = '';
      if (noCourses) noCourses.style.display = 'block';
      return;
    }

    if (noCourses) noCourses.style.display = 'none';

    if (container) {
      container.innerHTML = courses.map(course => `
        <div class="course-card-item" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 1.5rem; color: white; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: transform 0.3s, box-shadow 0.3s; cursor: pointer;">
          <h3 style="margin: 0 0 0.5rem 0; font-size: 1.2rem; font-weight: 700;">
            ${course.course_name || course.title || 'Course'}
          </h3>
          
          <p style="margin: 0 0 1rem 0; opacity: 0.9; font-size: 0.95rem;">
            ${course.description || 'Deskripsi tidak tersedia'}
          </p>

          <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <p style="margin: 0; font-size: 0.85rem; opacity: 0.8;">Instruktur</p>
              <p style="margin: 0; font-weight: 600;">${course.instructor || '-'}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 0.85rem; opacity: 0.8;">Durasi</p>
              <p style="margin: 0; font-weight: 600;">${course.duration || '-'} jam</p>
            </div>
          </div>

          <button data-course-id="${course.course_id}" class="view-course-btn" style="width: 100%; background: white; color: #667eea; border: none; padding: 0.75rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
            Lihat Detail
          </button>
        </div>
      `).join('');

      // Add hover effects
      container.querySelectorAll('.course-card-item').forEach(card => {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-5px)';
          card.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.6)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
        });
      });

      // Add click event listeners
      container.querySelectorAll('.view-course-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const courseId = btn.dataset.courseId;
          window.location.hash = `#/course/${courseId}`;
        });
      });
    }
  } catch (err) {
    console.error('Error loading courses:', err);
  }
}
