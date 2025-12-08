import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

// Load topic detail page static HTML
export async function initTopicDetail(container, topicId) {
  try {
    const response = await fetch(new URL('../static/topicDetail.html', import.meta.url).href);
    if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
    const html = await response.text();
    container.innerHTML = html;
    
    // Initialize logic
    loadTopicDetail(topicId);
  } catch (err) {
    console.error('[TOPICDETAIL] Failed to load HTML:', err);
    container.innerHTML = '<p>Error loading topic detail. Please refresh.</p>';
  }
}

async function loadTopicDetail(topicId) {
  try {
    // Load topic data
    const topicRes = await fetch(`${API_BASE}/topics/${topicId}`, {
      headers: AuthService.getAuthHeaders()
    });
    const topic = await topicRes.json();

    const titleEl = document.getElementById('topic-title');
    const descEl = document.getElementById('topic-description');
    const materialsEl = document.getElementById('materials-container');

    if (titleEl) titleEl.textContent = topic.title || 'Topik';
    if (descEl) descEl.textContent = topic.description || 'Deskripsi topik tidak tersedia';

    // Load materials for this topic
    const matsRes = await fetch(`${API_BASE}/materials`, {
      headers: AuthService.getAuthHeaders()
    });
    const materialsResponse = await matsRes.json();
    const materials = materialsResponse.data || materialsResponse;

    if (!materials || materials.length === 0) {
      if (materialsEl) {
        materialsEl.innerHTML = '<p style="color: #64748b; text-align: center; padding: 2rem;">Tidak ada materi untuk topik ini</p>';
      }
      return;
    }

    if (materialsEl) {
      materialsEl.innerHTML = materials.map(mat => renderMaterialCard(mat)).join('');
    }
  } catch (err) {
    console.error('Error loading topic detail:', err);
  }
}

function renderMaterialCard(material) {
  const icon = getMaterialIcon(material.content_type);
  const preview = getMaterialPreview(material);

  return `
    <div style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 1.5rem;">
      <div style="display: flex; gap: 1.5rem;">
        <div style="font-size: 2.5rem; min-width: 80px; display: flex; align-items: center; justify-content: center;">
          ${icon}
        </div>
        <div style="flex: 1;">
          <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 600; margin: 0 0 0.5rem 0;">
            ${material.title}
          </h3>
          <p style="color: #64748b; font-size: 0.95rem; margin: 0 0 1rem 0;">
            ${material.description || 'Tidak ada deskripsi'}
          </p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span style="background: #f0f9ff; color: #0ea5e9; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem;">
              ${material.content_type}
            </span>
          </div>
          ${preview}
        </div>
      </div>
    </div>
  `;
}

function getMaterialIcon(contentType) {
  const icons = {
    'video': '🎬',
    'pdf': '📄',
    'document': '📝',
    'image': '🖼️',
    'link': '🔗',
    'text': '📑'
  };
  return icons[contentType] || '📚';
}

function getMaterialPreview(material) {
  if (!material.content_type) return '';

  switch (material.content_type.toLowerCase()) {
    case 'video':
      return material.content ? `
        <div style="margin-top: 1rem;">
          <video style="width: 100%; border-radius: 8px;" controls>
            <source src="${material.content}" type="video/mp4">
            Browser Anda tidak mendukung video.
          </video>
        </div>
      ` : '';
    
    case 'image':
      return material.content ? `
        <div style="margin-top: 1rem;">
          <img src="${material.content}" style="max-width: 100%; border-radius: 8px;" alt="${material.title}" />
        </div>
      ` : '';
    
    case 'pdf':
      return material.content ? `
        <div style="margin-top: 1rem;">
          <a href="${material.content}" target="_blank" style="display: inline-block; background: #7c3aed; color: white; padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; font-weight: 600;">
            📥 Unduh PDF
          </a>
        </div>
      ` : '';
    
    case 'link':
      return material.content ? `
        <div style="margin-top: 1rem;">
          <a href="${material.content}" target="_blank" style="display: inline-block; background: #0ea5e9; color: white; padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; font-weight: 600;">
            🔗 Buka Link Eksternal
          </a>
        </div>
      ` : '';
    
    case 'text':
    case 'document':
      return material.content ? `
        <div style="margin-top: 1rem; background: #f8fafc; padding: 1rem; border-radius: 8px; max-height: 300px; overflow-y: auto; color: #334155;">
          ${material.content}
        </div>
      ` : '';
    
    default:
      return '';
  }
}
