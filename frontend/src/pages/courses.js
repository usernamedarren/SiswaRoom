import { API_BASE } from "../config/api.js";
import { AuthService } from "../utils/auth.js";

// Main Courses Page with tabs
export function CoursesPage() {
  const currentTab = window.coursesTab || "enrolled";
  setTimeout(() => loadCourses(currentTab), 100);

  return `
    <div style="max-width: 1400px; margin: 0 auto; padding: 2rem;">
      <!-- Page Header -->
      <div style="margin-bottom: 3rem;">
        <h1 style="color: #7c3aed; font-size: 2.5rem; font-weight: 700; margin: 0; margin-bottom: 0.5rem;">
          📚 Kursus Saya
        </h1>
        <p style="color: #64748b; font-size: 1.1rem; margin: 0;">
          Kelola dan temukan kursus baru
        </p>
      </div>

      <!-- Tab Navigation -->
      <div style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0;">
        <button onclick="switchCoursesTab('enrolled')" style="padding: 1rem 1.5rem; background: none; border: none; border-bottom: 3px solid ${currentTab === 'enrolled' ? '#7c3aed' : 'transparent'}; color: ${currentTab === 'enrolled' ? '#7c3aed' : '#64748b'}; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;">
          ✅ Kursus Terdaftar
        </button>
        <button onclick="switchCoursesTab('available')" style="padding: 1rem 1.5rem; background: none; border: none; border-bottom: 3px solid ${currentTab === 'available' ? '#7c3aed' : 'transparent'}; color: ${currentTab === 'available' ? '#7c3aed' : '#64748b'}; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;">
          🆕 Kursus Tersedia
        </button>
      </div>

      <!-- Search and Filter -->
      <div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
        <input type="text" id="search-courses" placeholder="Cari kursus..." style="flex: 1; min-width: 250px; padding: 0.875rem 1rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; outline: none;" onkeyup="filterCourses()" />
        <select id="category-filter-courses" style="padding: 0.875rem 1rem; border: 2px solid #e2e8f0; border-radius: 10px; background: white; font-size: 1rem; cursor: pointer;" onchange="filterCourses()">
          <option value="">Semua Kategori</option>
          <option value="Matematika">Matematika</option>
          <option value="Sains">Sains</option>
          <option value="Bahasa">Bahasa</option>
          <option value="Teknologi">Teknologi</option>
          <option value="Sejarah">Sejarah</option>
          <option value="Seni">Seni</option>
        </select>
      </div>

      <!-- Courses Grid -->
      <div id="courses-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
        <div style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
          <p style="color: #64748b;">Memuat kursus...</p>
        </div>
      </div>

      <!-- No Results -->
      <div id="no-courses" style="display: none; text-align: center; padding: 3rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
        <p style="color: #64748b; font-size: 1.1rem;">
          Tidak ada kursus untuk ditampilkan
        </p>
      </div>
    </div>
  `;
}

async function loadCourses(tab) {
  try {
    const endpoint = tab === 'enrolled' ? '/courses' : '/courses/available/list';
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: AuthService.getAuthHeaders()
    });
    const courses = await res.json();

    const container = document.getElementById("courses-container");
    if (!container) return;

    if (!courses || courses.length === 0) {
      container.innerHTML = '';
      document.getElementById("no-courses").style.display = 'block';
      return;
    }

    container.innerHTML = courses.map((course, idx) => `
      <div style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s; display: flex; flex-direction: column;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 16px rgba(0,0,0,0.12)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'">
        <!-- Header -->
        <div style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
            <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 600; margin: 0; flex: 1;">
              ${course.name}
            </h3>
            <span style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">
              ${course.level || 'beginner'}
            </span>
          </div>
          <p style="color: #64748b; font-size: 0.9rem; margin: 0;">
            👨‍🏫 ${course.teacher_name || 'N/A'}
          </p>
        </div>

        <!-- Description -->
        <p style="color: #64748b; font-size: 0.95rem; margin: 0 0 1rem 0; flex: 1;">
          ${course.description?.substring(0, 100) || 'Kursus berkualitas'}...
        </p>

        <!-- Stats -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; padding: 1rem; background: #f8fafc; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem;">
          <div>
            <p style="color: #64748b; margin: 0 0 0.25rem 0;">📖 Materi</p>
            <p style="color: #1e293b; font-weight: 600; margin: 0;">${course.total_materials || 0}</p>
          </div>
          <div>
            <p style="color: #64748b; margin: 0 0 0.25rem 0;">🎯 Quiz</p>
            <p style="color: #1e293b; font-weight: 600; margin: 0;">${course.total_quizzes || 0}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: grid; gap: 0.75rem;">
          ${tab === 'enrolled' ? `
            <button onclick="viewCourse('${course.subject_id}')" style="width: 100%; background: #7c3aed; color: white; border: none; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
              Lihat Kursus
            </button>
            <button onclick="unenrollCourse('${course.subject_id}')" style="width: 100%; background: #fee2e2; color: #dc2626; border: none; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
              Batalkan
            </button>
          ` : `
            <button onclick="enrollCourse('${course.subject_id}')" style="width: 100%; background: #10b981; color: white; border: none; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
              Daftar Sekarang
            </button>
          `}
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading courses:', err);
    document.getElementById("courses-container").innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #ef4444; grid-column: 1 / -1;">
        <p>⚠️ Gagal memuat kursus</p>
      </div>
    `;
  }
}

function generateSkeletonCards() {
  return Array(6).fill(0).map(() => `
    <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); animation: pulse 2s infinite;">
      <div style="height: 180px; background: #e2e8f0;"></div>
      <div style="padding: 1.5rem;">
        <div style="height: 20px; background: #e2e8f0; border-radius: 4px; margin-bottom: 1rem;"></div>
        <div style="height: 16px; background: #e2e8f0; border-radius: 4px; margin-bottom: 0.5rem;"></div>
        <div style="height: 40px; background: #e2e8f0; border-radius: 4px;"></div>
      </div>
    </div>
  `).join('');
}

window.switchCoursesTab = function(tab) {
  window.coursesTab = tab;
  if (typeof loadCourses === 'function') {
    loadCourses(tab);
  }
};

window.enrollCourse = async function(courseId) {
  try {
    const res = await fetch(`${API_BASE}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders()
    });
    const data = await res.json();

    if (res.ok) {
      alert('✅ ' + (data.message || 'Berhasil mendaftar kursus'));
      window.coursesTab = 'enrolled';
      loadCourses('enrolled');
    } else {
      alert('❌ ' + (data.message || 'Gagal mendaftar kursus'));
    }
  } catch (err) {
    console.error('Error enrolling:', err);
    alert('❌ Gagal mendaftar kursus');
  }
};

window.unenrollCourse = async function(courseId) {
  if (!confirm('Apakah Anda yakin ingin membatalkan pendaftaran?')) return;

  try {
    const res = await fetch(`${API_BASE}/courses/${courseId}/unenroll`, {
      method: 'DELETE',
      headers: AuthService.getAuthHeaders()
    });
    const data = await res.json();

    if (res.ok) {
      alert('✅ ' + (data.message || 'Berhasil membatalkan pendaftaran'));
      loadCourses(window.coursesTab || 'enrolled');
    } else {
      alert('❌ ' + (data.message || 'Gagal membatalkan pendaftaran'));
    }
  } catch (err) {
    console.error('Error unenrolling:', err);
    alert('❌ Gagal membatalkan pendaftaran');
  }
};

window.viewCourse = function(courseId) {
  window.location.hash = `#/courses/${courseId}`;
};

function filterCourses() {
  loadCourses(window.coursesTab || 'enrolled');
}

// Course Detail Page
export function CourseDetailPage(courseId) {
  setTimeout(() => loadCourseDetail(courseId), 100);
  return `
    <div style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
      <button onclick="window.history.back()" style="background: none; border: none; color: #7c3aed; font-size: 1rem; cursor: pointer; margin-bottom: 1rem; font-weight: 600;">
        ← Kembali
      </button>

      <div id="course-detail-container">
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
          <p style="color: #64748b;">Memuat detail kursus...</p>
        </div>
      </div>
    </div>
  `;
}

async function loadCourseDetail(courseId) {
  try {
    const res = await fetch(`${API_BASE}/courses/${courseId}`, {
      headers: AuthService.getAuthHeaders()
    });
    const course = await res.json();

    const container = document.getElementById("course-detail-container");
    if (!container) return;

    container.innerHTML = `
      <div style="background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h1 style="color: #1e293b; font-size: 2rem; font-weight: 700; margin: 0 0 1rem 0;">
          ${course.name}
        </h1>

        <div style="display: grid; grid-template-columns: auto 1fr; gap: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 8px; margin-bottom: 2rem;">
          <div>
            <p style="color: #64748b; font-size: 0.85rem; margin: 0;">👨‍🏫 Pengajar</p>
            <p style="color: #1e293b; font-weight: 600; margin: 0.25rem 0 0 0;">${course.teacher_name}</p>
          </div>
          <div>
            <p style="color: #64748b; font-size: 0.85rem; margin: 0;">📚 Kategori</p>
            <p style="color: #1e293b; font-weight: 600; margin: 0.25rem 0 0 0;">${course.category}</p>
          </div>
          <div>
            <p style="color: #64748b; font-size: 0.85rem; margin: 0;">📖 Tingkat</p>
            <p style="color: #1e293b; font-weight: 600; margin: 0.25rem 0 0 0;">${course.level}</p>
          </div>
        </div>

        <div style="margin-bottom: 2rem;">
          <h3 style="color: #1e293b; font-weight: 600; margin: 0 0 0.5rem 0;">📝 Deskripsi</h3>
          <p style="color: #64748b; line-height: 1.8; margin: 0;">
            ${course.description}
          </p>
        </div>

        ${course.materials && course.materials.length > 0 ? `
          <div style="margin-bottom: 2rem;">
            <h3 style="color: #1e293b; font-weight: 600; margin: 0 0 1rem 0;">📚 Materi Pembelajaran</h3>
            <div style="display: grid; gap: 0.75rem;">
              ${course.materials.map(m => `
                <a href="#/materi/${courseId}/${m.material_id}" style="padding: 1rem; background: #f8fafc; border-radius: 8px; text-decoration: none; color: inherit; transition: all 0.3s; border-left: 3px solid #7c3aed;">
                  <p style="color: #1e293b; font-weight: 600; margin: 0 0 0.25rem 0;">
                    ${m.order}. ${m.title}
                  </p>
                  <p style="color: #64748b; font-size: 0.9rem; margin: 0;">
                    ${m.description}
                  </p>
                </a>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${course.quizzes && course.quizzes.length > 0 ? `
          <div>
            <h3 style="color: #1e293b; font-weight: 600; margin: 0 0 1rem 0;">🎯 Quiz Tersedia</h3>
            <div style="display: grid; gap: 0.75rem;">
              ${course.quizzes.map(q => `
                <div style="padding: 1rem; background: #f8fafc; border-radius: 8px; border-left: 3px solid #10b981; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <p style="color: #1e293b; font-weight: 600; margin: 0 0 0.25rem 0;">${q.title}</p>
                    <p style="color: #64748b; font-size: 0.9rem; margin: 0;">${q.question_count} soal • Waktu: ${q.time_limit} menit</p>
                  </div>
                  <button onclick="startQuiz('${q.quiz_id}')" style="background: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600;">Mulai</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  } catch (err) {
    console.error('Error:', err);
    document.getElementById("course-detail-container").innerHTML = `<p style="color: #ef4444;">⚠️ Gagal memuat detail</p>`;
  }
}

window.startQuiz = function(quizId) {
  window.location.hash = `#/quiz/${quizId}`;
};
