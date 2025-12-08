import { API_BASE } from "../config/api.js";
import { AuthService } from "../utils/auth.js";

export function TopicsPage(subjectId) {
  setTimeout(() => loadTopics(subjectId), 100);
  return `
    <div style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
      <div style="margin-bottom: 2rem;">
        <a href="#/subjects" style="
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #7c3aed;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s;
          padding: 0.5rem 1rem;
          border-radius: 8px;
        " onmouseover="this.style.backgroundColor = 'rgba(124, 58, 237, 0.1)'" onmouseout="this.style.backgroundColor = 'transparent'">
          ← Kembali ke Mata Pelajaran
        </a>
      </div>

      <div id="subject-info" style="margin-bottom: 2.5rem;"></div>

      <div id="topics-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        ${generateSkeletonLoaders()}
      </div>

      <div id="no-topics" style="display: none; text-align: center; padding: 4rem 2rem;">
        <div style="font-size: 4rem; margin-bottom: 1.5rem;">📭</div>
        <p style="color: #64748b; font-size: 1.1rem;">
          Belum ada materi untuk mata pelajaran ini.
        </p>
      </div>
    </div>
  `;
}

function generateSkeletonLoaders() {
  return Array(6).fill(0).map(() => `
    <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); animation: pulse 2s infinite;">
      <div style="height: 24px; background: #e2e8f0; border-radius: 4px; margin-bottom: 1rem;"></div>
      <div style="height: 16px; background: #e2e8f0; border-radius: 4px; margin-bottom: 0.5rem;"></div>
      <div style="height: 16px; background: #e2e8f0; border-radius: 4px; margin-bottom: 1rem; width: 80%;"></div>
      <div style="height: 40px; background: #e2e8f0; border-radius: 4px;"></div>
    </div>
  `).join('');
}

async function loadTopics(subjectId) {
  try {
    const headers = AuthService.getAuthHeaders();
    
    const [subjectRes, materialsRes] = await Promise.all([
      fetch(`${API_BASE}/subjects`, { headers }).catch(() => null),
      fetch(`${API_BASE}/subjects/${subjectId}/materials`, { headers }).catch(() => null)
    ]);
    
    const subjectsData = subjectRes ? await subjectRes.json() : [];
    const materialsData = materialsRes ? await materialsRes.json() : [];
    const subjects = Array.isArray(subjectsData) ? subjectsData : (subjectsData.data || []);
    const materials = Array.isArray(materialsData) ? materialsData : (materialsData.data || []);
    
    const subject = subjects.find(s => s.subject_id == subjectId);
    
    const subjectInfo = document.getElementById('subject-info');
    if (subjectInfo && subject) {
      const icons = {
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
      const icon = icons[subject.name] || '📚';
      
      subjectInfo.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          animation: slideUp 0.5s ease;
        ">
          <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1rem;">
            <div style="font-size: 3rem;">${icon}</div>
            <div>
              <h1 style="color: white; margin: 0; font-size: 2rem; font-weight: 700;">
                ${subject.name}
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0.5rem 0 0 0; font-size: 1rem;">
                ${subject.description || 'Materi pembelajaran lengkap'}
              </p>
            </div>
          </div>
          <div style="display: flex; gap: 2rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2);">
            <div>
              <div style="font-weight: 700; font-size: 1.5rem;">${materials.length || 0}</div>
              <div style="opacity: 0.9; font-size: 0.9rem;">Materi Tersedia</div>
            </div>
          </div>
        </div>
      `;
    }

    const container = document.getElementById("topics-list");
    const noTopics = document.getElementById("no-topics");
    
    if (!container) return;

    if (!materials || materials.length === 0) {
      container.innerHTML = '';
      if (noTopics) noTopics.style.display = 'block';
      return;
    }

    if (noTopics) noTopics.style.display = 'none';

    container.innerHTML = materials
      .map((m, index) => `
        <div onclick="window.location.hash='#/materi/${subjectId}/${m.material_id}'" style="
          background: white;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transform: translateY(0);
          animation: slideUp 0.5s ease ${index * 0.1}s backwards;
        " onmouseover="
          this.style.transform = 'translateY(-8px)';
          this.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
        " onmouseout="
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        ">
          <div style="
            background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
            color: white;
            padding: 1.5rem;
          ">
            <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📄</div>
            <h3 style="margin: 0; font-weight: 700; font-size: 1.1rem; line-height: 1.4;">
              ${m.title}
            </h3>
          </div>

          <div style="padding: 1.5rem;">
            <p style="color: #64748b; margin: 0 0 1rem 0; line-height: 1.5; font-size: 0.95rem;">
              ${(m.content || 'Klik untuk melihat detail materi').slice(0, 120)}...
            </p>

            <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem; color: #94a3b8; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
              <div>👤 ${m.created_by || 'Guru'}</div>
              <div>📅 ${formatDate(m.created_at)}</div>
            </div>

            <button style="
              width: 100%;
              margin-top: 1rem;
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
            " onclick="event.stopPropagation()" onmouseover="
              this.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
              this.style.transform = 'scale(1.02)';
            " onmouseout="
              this.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.2)';
              this.style.transform = 'scale(1)';
            ">
              Baca Selengkapnya →
            </button>
          </div>
        </div>
      `)
      .join("");
  } catch (err) {
    console.error('Error loading topics:', err);
    const container = document.getElementById("topics-list");
    if (container) {
      container.innerHTML = '';
    }
    const noTopics = document.getElementById("no-topics");
    if (noTopics) {
      noTopics.style.display = 'block';
      noTopics.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1.5rem;">⚠️</div>
        <p style="color: #64748b; font-size: 1.1rem;">
          Gagal memuat materi. Silakan coba lagi.
        </p>
      `;
    }
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
}
