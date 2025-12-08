import { API_BASE } from "../config/api.js";
import { AuthService } from "../utils/auth.js";

export function TopicDetailPage(subjectId, materialId) {
  setTimeout(() => loadMaterial(materialId, subjectId), 100);
  return `
    <div style="max-width: 900px; margin: 0 auto; padding: 2rem;">
      // Back Button
      <div style="margin-bottom: 2rem;">
        <a href="#/materi/${subjectId}" style="
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
          ← Kembali ke Daftar Materi
        </a>
      </div>

      // Content Container
      <div id="material-detail" style="
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        padding: 2.5rem;
        min-height: 400px;
      ">
        <div style="text-align: center; padding: 3rem; color: #64748b;">
          <div style="animation: pulse 2s infinite;">
            Memuat detail materi...
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadMaterial(materialId, subjectId) {
  try {
    const headers = AuthService.getAuthHeaders();
    const res = await fetch(`${API_BASE}/materials/${materialId}`, { headers });
    const response = await res.json();
    const material = response.success ? response.data : response;

    const container = document.getElementById("material-detail");
    if (!container) return;

    if (!material || !material.material_id) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem;">
          <div style="font-size: 4rem; margin-bottom: 1.5rem;">❌</div>
          <h2 style="color: #1e293b; margin: 0 0 0.5rem 0; font-size: 1.5rem;">Materi tidak ditemukan</h2>
          <p style="color: #64748b; margin: 0;">Materi yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      // Material Header with Gradient
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2.5rem;
        margin: -2.5rem -2.5rem 2.5rem -2.5rem;
        border-radius: 12px 12px 0 0;
        animation: slideUp 0.5s ease;
      ">
        <div style="display: flex; align-items: start; gap: 1.5rem; margin-bottom: 1.5rem;">
          <div style="font-size: 3rem;">📚</div>
          <div style="flex: 1;">
            <h1 style="color: white; margin: 0; font-size: 2rem; font-weight: 700; line-height: 1.2;">
              ${material.title}
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 0.75rem 0 0 0; font-size: 1rem;">
              ${material.subject_name || 'Mata Pelajaran'}
            </p>
          </div>
        </div>

        // Meta Information
        <div style="display: flex; gap: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.2); font-size: 0.95rem;">
          <div>
            <div style="opacity: 0.9;">👤 Dibuat oleh</div>
            <div style="font-weight: 600;">${material.created_by || 'Guru'}</div>
          </div>
          <div>
            <div style="opacity: 0.9;">📅 Tanggal</div>
            <div style="font-weight: 600;">${formatDate(material.created_at)}</div>
          </div>
        </div>
      </div>

      // Material Content
      <div class="material-content" style="
        line-height: 1.8;
        color: #1e293b;
        font-size: 1.05rem;
        margin-bottom: 2.5rem;
      ">
        ${formatContent(material.content)}
      </div>

      // File Download Section
      ${material.file_url ? `
        <div style="
          padding: 1.5rem;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-radius: 12px;
          margin-bottom: 2.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          color: white;
        ">
          <div style="font-size: 2rem;">📥</div>
          <div style="flex: 1;">
            <div style="font-weight: 700;">File Materi Tersedia</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">Unduh file lengkap untuk referensi offline</div>
          </div>
          <a href="${material.file_url}" target="_blank" style="
            padding: 0.75rem 1.5rem;
            background: white;
            color: #f5576c;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
          " onmouseover="this.style.transform = 'scale(1.05)'" onmouseout="this.style.transform = 'scale(1)'">
            Unduh
          </a>
        </div>
      ` : ''}

      // Action Buttons
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <a href="#/materi/${subjectId}" style="
          flex: 1;
          min-width: 200px;
          padding: 1rem;
          background: #f8fafc;
          color: #7c3aed;
          text-decoration: none;
          border: 2px solid #7c3aed;
          border-radius: 8px;
          text-align: center;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s;
        " onmouseover="this.style.backgroundColor = '#f0f4f8'" onmouseout="this.style.backgroundColor = '#f8fafc'">
          ← Kembali ke Materi
        </a>
        <button style="
          flex: 1;
          min-width: 200px;
          padding: 1rem;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(79, 172, 254, 0.2);
        " onmouseover="
          this.style.boxShadow = '0 4px 12px rgba(79, 172, 254, 0.3)';
          this.style.transform = 'translateY(-2px)';
        " onmouseout="
          this.style.boxShadow = '0 2px 8px rgba(79, 172, 254, 0.2)';
          this.style.transform = 'translateY(0)';
        " onclick="alert('📝 Fitur kuis akan segera diluncurkan! Tetap pantau untuk update terbaru.')">
          🎯 Kerjakan Quiz Materi
        </button>
      </div>
    `;
  } catch (err) {
    console.error('Error loading material:', err);
    const container = document.getElementById("material-detail");
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem;">
          <div style="font-size: 4rem; margin-bottom: 1.5rem;">⚠️</div>
          <h2 style="color: #1e293b; margin: 0 0 0.5rem 0; font-size: 1.5rem;">Gagal memuat materi</h2>
          <p style="color: #64748b; margin: 0;">Terjadi kesalahan saat memuat detail materi. Silakan coba lagi.</p>
        </div>
      `;
    }
  }
}

function formatContent(content) {
  if (!content) return '<p style="color: var(--text-gray);">Konten materi tidak tersedia.</p>';
  
  // Split by paragraphs and format
  const paragraphs = content.split('\n').filter(p => p.trim());
  return paragraphs.map(p => `<p style="margin-bottom: 1rem;">${p}</p>`).join('');
}
