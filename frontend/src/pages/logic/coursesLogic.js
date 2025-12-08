import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

export async function initCourses(container) {
  const html = await fetch("./src/pages/static/courses.html").then(r => r.text());
  container.innerHTML = html;
  
  loadCourses();
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
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 1.5rem; color: white; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: transform 0.3s, box-shadow 0.3s; cursor: pointer;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 20px rgba(102, 126, 234, 0.6)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'">
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

          <button onclick="viewCourse('${course.course_id}')" style="width: 100%; background: white; color: #667eea; border: none; padding: 0.75rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
            Lihat Detail
          </button>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading courses:', err);
  }
}

window.viewCourse = function(courseId) {
  window.location.hash = `#/course/${courseId}`;
};
