import { API_BASE } from "../config/api.js";
import { AuthService } from "../utils/auth.js";

export function DashboardPage() {
  setTimeout(() => loadDashboardData(), 100);
  
  const userRole = AuthService.getUser()?.role;
  const userName = AuthService.getUserName();
  
  return `
    <div class="container" style="max-width: 1400px; padding: 2rem;">
      <div style="margin-bottom: 2.5rem;">
        <h1 style="color: #7c3aed; font-size: 2.5rem; font-weight: 700; margin: 0; margin-bottom: 0.5rem;">
          Dashboard
        </h1>
        <p style="color: #64748b; font-size: 1.1rem; margin: 0;">
          Selamat datang, <strong>${userName}!</strong> 👋
        </p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <div>
              <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; opacity: 0.9;">Mata Pelajaran</p>
              <div style="font-size: 2.5rem; font-weight: 700;" id="stat-subjects">-</div>
            </div>
            <div style="font-size: 2.5rem; opacity: 0.3;">📖</div>
          </div>
          <p style="margin: 0; font-size: 0.85rem; opacity: 0.9;">Total kursus tersedia</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 1.5rem; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <div>
              <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; opacity: 0.9;">Materi</p>
              <div style="font-size: 2.5rem; font-weight: 700;" id="stat-materials">-</div>
            </div>
            <div style="font-size: 2.5rem; opacity: 0.3;">📝</div>
          </div>
          <p style="margin: 0; font-size: 0.85rem; opacity: 0.9;">Total materi pembelajaran</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 1.5rem; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <div>
              <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; opacity: 0.9;">Bank Soal</p>
              <div style="font-size: 2.5rem; font-weight: 700;" id="stat-questions">-</div>
            </div>
            <div style="font-size: 2.5rem; opacity: 0.3;">❓</div>
          </div>
          <p style="margin: 0; font-size: 0.85rem; opacity: 0.9;">Total pertanyaan</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 1.5rem; border-radius: 12px; color: #333; box-shadow: 0 4px 12px rgba(250, 112, 154, 0.3);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <div>
              <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; opacity: 0.9;">Quiz</p>
              <div style="font-size: 2.5rem; font-weight: 700;" id="stat-quizzes">-</div>
            </div>
            <div style="font-size: 2.5rem; opacity: 0.3;">🎯</div>
          </div>
          <p style="margin: 0; font-size: 0.85rem; opacity: 0.9;">Total quiz/kuis</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-bottom: 2.5rem;">
        
        <div>
          <div style="background: white; padding: 1.75rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 2px solid #e2e8f0;">
              <h3 style="margin: 0; font-size: 1.2rem; font-weight: 700; color: #1e293b;">
                ${userRole === 'teacher' ? '👨‍🏫 Kursus Saya Ajar' : '📚 Kursus Saya'}
              </h3>
              <a href="${userRole === 'teacher' ? '#/teacher/courses' : '#/subjects'}" style="color: #7c3aed; text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: all 0.3s;" onmouseover="this.style.color = '#3b82f6'" onmouseout="this.style.color = '#7c3aed'">
                Lihat Semua →
              </a>
            </div>
            <div id="my-courses-list" style="display: flex; flex-direction: column; gap: 0.75rem;">
              <p style="color: #94a3b8; text-align: center; padding: 1rem;">Memuat kursus...</p>
            </div>
          </div>

          <div style="background: white; padding: 1.75rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 2px solid #e2e8f0;">
              <h3 style="margin: 0; font-size: 1.2rem; font-weight: 700; color: #1e293b;">
                🗓️ Jadwal Mendatang
              </h3>
              <a href="#/schedules" style="color: #7c3aed; text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: all 0.3s;" onmouseover="this.style.color = '#3b82f6'" onmouseout="this.style.color = '#7c3aed'">
                Lihat Semua →
              </a>
            </div>
            <div id="upcoming-classes" style="display: flex; flex-direction: column; gap: 0.75rem;">
              <p style="color: #94a3b8; text-align: center; padding: 1rem;">Memuat jadwal...</p>
            </div>
          </div>
        </div>

        <div>
          <div style="background: white; padding: 1.75rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 2rem;">
            <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; font-weight: 700; color: #1e293b;">⚡ Akses Cepat</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <a href="#/subjects" style="padding: 0.875rem 1rem; background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); color: white; text-decoration: none; border-radius: 8px; text-align: center; font-weight: 600; font-size: 0.95rem; transition: all 0.3s; box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);" onmouseover="this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';" onmouseout="this.style.transform = 'translateY(0)'; this.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.2)';">
                🎓 Lihat Semua Kursus
              </a>
              ${userRole === 'teacher' 
                ? `<a href="#/teacher/dashboard" style="padding: 0.875rem 1rem; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-decoration: none; border-radius: 8px; text-align: center; font-weight: 600; font-size: 0.95rem; transition: all 0.3s; box-shadow: 0 2px 8px rgba(245, 87, 108, 0.2);" onmouseover="this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 4px 12px rgba(245, 87, 108, 0.3)';" onmouseout="this.style.transform = 'translateY(0)'; this.style.boxShadow = '0 2px 8px rgba(245, 87, 108, 0.2)';">
                    📊 Dashboard Pengajar
                  </a>`
                : `<a href="#/subjects" style="padding: 0.875rem 1rem; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; text-decoration: none; border-radius: 8px; text-align: center; font-weight: 600; font-size: 0.95rem; transition: all 0.3s; box-shadow: 0 2px 8px rgba(79, 172, 254, 0.2);" onmouseover="this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 4px 12px rgba(79, 172, 254, 0.3)';" onmouseout="this.style.transform = 'translateY(0)'; this.style.boxShadow = '0 2px 8px rgba(79, 172, 254, 0.2)';">
                    📚 Kursus Saya
                  </a>`
              }
              ${userRole === 'admin'
                ? `<a href="#/admin/dashboard" style="padding: 0.875rem 1rem; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: #333; text-decoration: none; border-radius: 8px; text-align: center; font-weight: 600; font-size: 0.95rem; transition: all 0.3s; box-shadow: 0 2px 8px rgba(250, 112, 154, 0.2);" onmouseover="this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 4px 12px rgba(250, 112, 154, 0.3)';" onmouseout="this.style.transform = 'translateY(0)'; this.style.boxShadow = '0 2px 8px rgba(250, 112, 154, 0.2)';">
                    ⚙️ Admin Panel
                  </a>`
                : ''
              }
            </div>
          </div>

          <div style="background: white; padding: 1.75rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; font-weight: 700; color: #1e293b;">📊 Aktivitas Terakhir</h3>
            <div id="recent-activity" style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 350px; overflow-y: auto;">
              <p style="color: #94a3b8; text-align: center; padding: 1rem;">Memuat aktivitas...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadDashboardData() {
  try {
    const [coursesRes, materialsRes, questionsRes, quizzesRes] = await Promise.all([
      fetch(`${API_BASE}/subjects`).catch(() => null),
      fetch(`${API_BASE}/materials`).catch(() => null),
      fetch(`${API_BASE}/questions`).catch(() => null),
      fetch(`${API_BASE}/quizzes`).catch(() => null)
    ]);

    const courses = coursesRes ? await coursesRes.json() : { data: [] };
    const materials = materialsRes ? await materialsRes.json() : { data: [] };
    const questions = questionsRes ? await questionsRes.json() : { data: [] };
    const quizzes = quizzesRes ? await quizzesRes.json() : { data: [] };

    const statsSubjects = document.getElementById('stat-subjects');
    const statsMaterials = document.getElementById('stat-materials');
    const statsQuestions = document.getElementById('stat-questions');
    const statsQuizzes = document.getElementById('stat-quizzes');

    if (statsSubjects) statsSubjects.textContent = courses.data?.length || 0;
    if (statsMaterials) statsMaterials.textContent = materials.data?.length || 0;
    if (statsQuestions) statsQuestions.textContent = questions.data?.length || 0;
    if (statsQuizzes) statsQuizzes.textContent = quizzes.data?.length || 0;

    await loadMyCourses(courses.data);
    
    await loadUpcomingClasses();
    
    loadRecentActivity();
    
  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

async function loadMyCourses(courses) {
  try {
    const myCoursesList = document.getElementById('my-courses-list');
    if (!myCoursesList || !courses || courses.length === 0) {
      if (myCoursesList) myCoursesList.innerHTML = '<p style="color: #94a3b8; text-align: center;">Tidak ada kursus</p>';
      return;
    }

    const coursesToShow = courses.slice(0, 5);
    const html = coursesToShow.map(course => `
      <div onclick="window.location.hash='#/subjects/${course.subject_id}'" style="padding: 1rem; background: #f8fafc; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.3s; border-left: 4px solid #7c3aed;" onmouseover="this.style.backgroundColor = '#f0f4f8'; this.style.transform = 'translateX(4px)'" onmouseout="this.style.backgroundColor = '#f8fafc'; this.style.transform = 'translateX(0)'">
        <div>
          <div style="font-weight: 600; color: #1e293b; margin-bottom: 0.25rem;">${course.name}</div>
          <div style="font-size: 0.85rem; color: #64748b;">${course.teacher_name || 'Unknown'}</div>
        </div>
        <div style="font-size: 1.2rem;">→</div>
      </div>
    `).join('');
    
    myCoursesList.innerHTML = html;
  } catch (err) {
    console.error('Error loading courses:', err);
  }
}

async function loadUpcomingClasses() {
  try {
    const upcomingClasses = document.getElementById('upcoming-classes');
    if (!upcomingClasses) return;

    const response = await fetch(`${API_BASE}/schedules`);
    const result = await response.json();

    const schedules = result.success && result.data ? result.data.slice(0, 5) : [];
    
    if (schedules.length === 0) {
      upcomingClasses.innerHTML = '<p style="color: #94a3b8; text-align: center;">Tidak ada jadwal</p>';
      return;
    }

    const html = schedules.map(schedule => `
      <div style="padding: 1rem; background: #f8fafc; border-radius: 8px; border-left: 4px solid #4facfe;">
        <div style="font-weight: 600; color: #1e293b; margin-bottom: 0.5rem;">${schedule.subject_name || 'Class'}</div>
        <div style="font-size: 0.85rem; color: #64748b;">
          📅 ${new Date(schedule.class_date).toLocaleDateString('id-ID')} 
          <br>
          ⏰ ${schedule.start_time ? schedule.start_time.substring(0, 5) : 'N/A'}
        </div>
      </div>
    `).join('');
    
    upcomingClasses.innerHTML = html;
  } catch (err) {
    console.error('Error loading schedules:', err);
    const upcomingClasses = document.getElementById('upcoming-classes');
    if (upcomingClasses) upcomingClasses.innerHTML = '<p style="color: #94a3b8; text-align: center;">Tidak ada jadwal</p>';
  }
}

function loadRecentActivity() {
  const activities = [
    { icon: '✅', text: 'Menyelesaikan Quiz Matematika', time: '2 jam lalu' },
    { icon: '📚', text: 'Membuka materi Fisika Klasik', time: '1 hari lalu' },
    { icon: '🎯', text: 'Nilai Quiz: 85/100', time: '3 hari lalu' },
    { icon: '🎓', text: 'Mendaftar kursus Bahasa Inggris', time: '1 minggu lalu' }
  ];
  
  const recentEl = document.getElementById('recent-activity');
  if (!recentEl) return;

  const html = activities.map(activity => `
    <div style="padding: 0.875rem; background: #f8fafc; border-radius: 8px; border-left: 4px solid #7c3aed;">
      <div style="font-weight: 500; color: #1e293b; margin-bottom: 0.25rem;">${activity.icon} ${activity.text}</div>
      <div style="font-size: 0.8rem; color: #94a3b8;">${activity.time}</div>
    </div>
  `).join('');
  
  recentEl.innerHTML = html;
}
