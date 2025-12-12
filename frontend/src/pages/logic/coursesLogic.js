import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

export async function initCourses(container) {
  try {
    const response = await fetch(
      new URL("../static/courses.html", import.meta.url).href
    );
    if (!response.ok) throw new Error(`Failed to load: ${response.status}`);

    const html = await response.text();
    container.innerHTML = html;

    loadCourses();
  } catch (err) {
    console.error("[COURSES] Failed to load HTML:", err);
    container.innerHTML =
      "<p class='center text-gray'>Error loading courses page. Silakan refresh.</p>";
  }
}

async function loadCourses() {
  try {
    const res = await fetch(`${API_BASE}/courses`, {
      headers: AuthService.getAuthHeaders(),
    });

    const courses = res.ok ? await res.json() : [];
    const container = document.getElementById("courses-container");
    const noCourses = document.getElementById("no-courses");

    if (!courses || courses.length === 0) {
      if (container) container.innerHTML = "";
      if (noCourses) noCourses.style.display = "block";
      return;
    }

    if (noCourses) noCourses.style.display = "none";

    if (container) {
      container.innerHTML = courses.map(renderCourseCard).join("");

      container.querySelectorAll(".view-course-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const courseId = btn.dataset.courseId;
          if (courseId) {
            window.location.hash = `#/course/${courseId}`;
          }
        });
      });

      container.querySelectorAll(".course-card").forEach((card) => {
        card.addEventListener("click", () => {
          const courseId = card.dataset.courseId;
          if (courseId) {
            window.location.hash = `#/course/${courseId}`;
          }
        });
      });
    }
  } catch (err) {
    console.error("[COURSES] Error loading courses:", err);
  }
}

function renderCourseCard(course) {
  const title = course.course_name || course.title || "Course";
  const desc = course.description || "Deskripsi tidak tersedia";
  const instructor = course.instructor || "-";
  const duration = course.duration || "-";

  return `
    <div class="subject-card course-card fade-in-up" data-course-id="${course.course_id}">
      <h3>${title}</h3>
      <p>${desc}</p>

      <div class="subject-progress">
        <div class="subject-row">
          <div class="subject-label">
            <span>Instruktur</span>
            <span>${instructor}</span>
          </div>
        </div>
        <div class="subject-row">
          <div class="subject-label">
            <span>Durasi</span>
            <span>${duration} jam</span>
          </div>
        </div>
      </div>

      <button 
        class="btn btn-primary full view-course-btn"
        data-course-id="${course.course_id}">
        Lihat Detail
      </button>
    </div>
  `;
}
