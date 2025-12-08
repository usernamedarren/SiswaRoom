import { API_BASE } from "../config/api.js";

export function SubjectsPage() {
  setTimeout(() => loadSubjects(), 100);
  return `
    <div style="max-width: 1400px; margin: 0 auto; padding: 2rem;">
      <div style="margin-bottom: 2.5rem;">
        <h1 style="color: #7c3aed; font-size: 2.5rem; font-weight: 700; margin: 0; margin-bottom: 0.5rem;">
          📚 Daftar Mata Pelajaran
        </h1>
        <p style="color: #64748b; font-size: 1.1rem; margin: 0;">
          Pilih mata pelajaran untuk melihat materi dan quiz
        </p>
      </div>

      <div id="subjects-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
        ${generateSkeletonCards()}
      </div>

      <div id="no-subjects" style="display: none; text-align: center; padding: 4rem 2rem;">
        <div style="font-size: 4rem; margin-bottom: 1.5rem;">📭</div>
        <p style="color: #64748b; font-size: 1.1rem;">
          Belum ada mata pelajaran tersedia.
        </p>
      </div>
    </div>
  `;
}

function generateSkeletonCards() {
  return Array(6).fill(0).map(() => `
    <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); animation: pulse 2s infinite;">
      <div style="height: 60px; background: #e2e8f0; border-radius: 8px; margin-bottom: 1rem;"></div>
      <div style="height: 20px; background: #e2e8f0; border-radius: 4px; margin-bottom: 0.5rem;"></div>
      <div style="height: 60px; background: #e2e8f0; border-radius: 4px;"></div>
    </div>
  `).join('');
}

async function loadSubjects() {
  try {
    const res = await fetch(`${API_BASE}/subjects`);
    const data = await res.json();
    const subjects = Array.isArray(data) ? data : (data.data || []);

    const container = document.getElementById("subjects-list");
    if (!container) return;

    if (!subjects || subjects.length === 0) {
      container.innerHTML = '';
      const noSubjects = document.getElementById("no-subjects");
      if (noSubjects) noSubjects.style.display = 'block';
      return;
    }

    const subjectIcons = {
      'Matematika': '🔢',
      'Fisika': '⚛️',
      'Kimia': '🧪',
      'Biologi': '🧬',
      'Bahasa Indonesia': '📖',
      'Bahasa Inggris': '🗣️',
      'Sejarah': '📜',
      'Geografi': '🌍',
      'Ekonomi': '💰',
      'Sosiologi': '👥'
    };

    const subjectColors = [
      { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', shadow: 'rgba(102, 126, 234, 0.3)' },
      { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', shadow: 'rgba(245, 87, 108, 0.3)' },
      { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', shadow: 'rgba(79, 172, 254, 0.3)' },
      { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', shadow: 'rgba(250, 112, 154, 0.3)' }
    ];

    container.innerHTML = subjects
      .map((s, index) => {
        const icon = subjectIcons[s.name] || '📚';
        const colorIndex = index % 4;
        const color = subjectColors[colorIndex];
        
        return `
          <div onclick="window.location.hash='#/materi/${s.subject_id}'" style="
            background: white;
            border-radius: 12px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            transform: translateY(0);
            animation: slideUp 0.5s ease ${index * 0.08}s backwards;
          " onmouseover="
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
          " onmouseout="
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
          ">
            <div style="
              background: ${color.bg};
              color: white;
              padding: 2rem;
              display: flex;
              align-items: center;
              justify-content: space-between;
            ">
              <div style="font-size: 2.5rem;">${icon}</div>
              <div style="flex: 1; margin-left: 1.5rem;">
                <h3 style="margin: 0; font-weight: 700; font-size: 1.3rem;">${s.name}</h3>
              </div>
            </div>
            
            <div style="padding: 1.5rem;">
              <p style="color: #64748b; margin: 0 0 1rem 0; font-size: 0.95rem; line-height: 1.5;">
                ${s.description || 'Mata pelajaran dengan berbagai materi pembelajaran menarik'}
              </p>
              
              <button style="
                width: 100%;
                padding: 0.75rem;
                background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 0.95rem;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);
              " onmouseover="
                this.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
                this.style.transform = 'scale(1.02)';
              " onmouseout="
                this.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.2)';
                this.style.transform = 'scale(1)';
              " onclick="event.stopPropagation()">
                Lihat Materi →
              </button>
            </div>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error(err);
    const container = document.getElementById("subjects-list");
    if (container) {
      container.innerHTML = '';
      const noSubjects = document.getElementById("no-subjects");
      if (noSubjects) {
        noSubjects.style.display = 'block';
        noSubjects.innerHTML = `
          <div style="font-size: 3rem; margin-bottom: 1.5rem;">⚠️</div>
          <p style="color: #64748b; font-size: 1.1rem;">
            Gagal memuat mata pelajaran. Silakan coba lagi.
          </p>
        `;
      }
    }
  }
}
