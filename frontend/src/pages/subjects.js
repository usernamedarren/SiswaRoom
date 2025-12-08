import { API_BASE } from "../config/api.js";
import { AuthService } from "../utils/auth.js";

export function SubjectsPage() {
  setTimeout(() => loadSubjects(), 100);
  return `
    <div style="max-width: 1400px; margin: 0 auto; padding: 2rem;">
      // Page Header
      <div style="margin-bottom: 3rem;">
        <h1 style="color: #7c3aed; font-size: 2.5rem; font-weight: 700; margin: 0; margin-bottom: 0.5rem;">
          📚 Daftar Mata Pelajaran
        </h1>
        <p style="color: #64748b; font-size: 1.1rem; margin: 0;">
          Pilih mata pelajaran untuk melihat materi, topik, dan quiz
        </p>
      </div>

      // Search and Filter Bar
      <div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
        <input type="text" id="search-subjects" placeholder="Cari mata pelajaran..." style="flex: 1; min-width: 250px; padding: 0.875rem 1rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; transition: all 0.3s; outline: none;" onkeyup="filterSubjects()" onfocus="this.style.borderColor = '#7c3aed'; this.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'" onblur="this.style.borderColor = '#e2e8f0'; this.style.boxShadow = 'none'" />
        <select id="category-filter" style="padding: 0.875rem 1rem; border: 2px solid #e2e8f0; border-radius: 10px; background: white; font-size: 1rem; cursor: pointer; transition: all 0.3s;" onchange="filterSubjects()" onfocus="this.style.borderColor = '#7c3aed'; this.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'" onblur="this.style.borderColor = '#e2e8f0'; this.style.boxShadow = 'none'">
          <option value="">Semua Kategori</option>
          <option value="sains">Sains</option>
          <option value="sosial">Sosial</option>
          <option value="bahasa">Bahasa</option>
          <option value="lainnya">Lainnya</option>
        </select>
      </div>

      // Subjects Grid
      <div id="subjects-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
        ${generateSkeletonCards()}
      </div>

      // No Results Message
      <div id="no-results" style="display: none; grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
        <p style="color: #64748b; font-size: 1.1rem;">
          Tidak ada mata pelajaran yang sesuai dengan pencarian Anda.
        </p>
      </div>
    </div>
  `;
}

function generateSkeletonCards() {
  return Array(6).fill(0).map((_, i) => `
    <div style="padding: 1.5rem; background: #f8fafc; border-radius: 12px; animation: pulse 2s infinite;">
      <div style="height: 60px; background: #e2e8f0; border-radius: 8px; margin-bottom: 1rem;"></div>
      <div style="height: 20px; background: #e2e8f0; border-radius: 4px; margin-bottom: 0.5rem;"></div>
      <div style="height: 60px; background: #e2e8f0; border-radius: 4px;"></div>
    </div>
  `).join('');
}

async function loadSubjects() {
  try {
    const res = await fetch(`${API_BASE}/subjects`, {
      headers: AuthService.getAuthHeaders()
    });
    const data = await res.json();
    const subjects = Array.isArray(data) ? data : (data.data || []);

    const container = document.getElementById("subjects-list");
    if (!container) return;

    if (!subjects || subjects.length === 0) {
      container.innerHTML = '';
      document.getElementById("no-results").style.display = 'block';
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
      'Sosiologi': '👥',
      'Pendidikan Kewarganegaraan': '🏛️',
      'Seni Budaya': '🎨'
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
          <div onclick="window.location.hash='#/subjects/${s.subject_id}'" style="
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
            // Gradient Header
            <div style="
              background: ${color.bg};
              color: white;
              padding: 2rem 1.5rem;
              display: flex;
              align-items: center;
              justify-content: space-between;
            ">
              <div style="font-size: 2.5rem;">${icon}</div>
              <div style="text-align: right;">
                <div style="font-weight: 700; font-size: 1.3rem;">${s.name.split(' ')[0]}</div>
              </div>
            </div>
            
            // Content
            <div style="padding: 1.5rem;">
              <h3 style="margin: 0 0 0.5rem 0; color: #1e293b; font-size: 1.1rem; font-weight: 700;">
                ${s.name}
              </h3>
              <p style="margin: 0 0 1.25rem 0; color: #64748b; font-size: 0.9rem; line-height: 1.5;">
                ${s.description || 'Mata pelajaran dengan berbagai materi pembelajaran menarik'}
              </p>
              
              // Stats
              <div style="display: flex; gap: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; margin-top: 1rem;">
                <div style="flex: 1; text-align: center;">
                  <div style="font-weight: 700; color: #7c3aed; font-size: 1.1rem;">${s.material_count || 0}</div>
                  <div style="font-size: 0.8rem; color: #94a3b8;">Materi</div>
                </div>
                <div style="flex: 1; text-align: center;">
                  <div style="font-weight: 700; color: #3b82f6; font-size: 1.1rem;">${s.quiz_count || 0}</div>
                  <div style="font-size: 0.8rem; color: #94a3b8;">Quiz</div>
                </div>
              </div>
              
              // CTA Button
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
              " onmouseover="
                this.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
                this.style.transform = 'scale(1.02)';
              " onmouseout="
                this.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.2)';
                this.style.transform = 'scale(1)';
              " onclick="event.stopPropagation()">
                Pelajari Sekarang →
              </button>
            </div>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error('Error loading subjects:', err);
    const container = document.getElementById("subjects-list");
    if (container) {
      container.innerHTML = '';
      const noResults = document.getElementById("no-results");
      if (noResults) {
        noResults.style.display = 'block';
        noResults.innerHTML = `
          <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
          <p style="color: #64748b; font-size: 1.1rem;">
            Gagal memuat mata pelajaran. Silakan coba lagi.
          </p>
        `;
      }
    }
  }
}

window.filterSubjects = function() {
  const searchTerm = document.getElementById("search-subjects")?.value.toLowerCase() || '';
  const categoryTerm = document.getElementById("category-filter")?.value || '';
  const cards = document.querySelectorAll('[onclick*="subjects"]');
  
  let visibleCount = 0;
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const matches = text.includes(searchTerm);
    card.style.display = matches ? 'block' : 'none';
    if (matches) visibleCount++;
  });
  
  const noResults = document.getElementById("no-results");
  if (noResults && visibleCount === 0) {
    noResults.style.display = 'block';
  } else if (noResults) {
    noResults.style.display = 'none';
  }
};
