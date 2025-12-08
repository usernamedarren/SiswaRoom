import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

// Load subjects page static HTML
export async function initSubjects(container) {
  const html = await fetch("./src/pages/static/subjects.html").then(r => r.text());
  container.innerHTML = html;
  
  // Initialize logic
  loadSubjects();
  setupFilters();
}

async function loadSubjects(category = null, search = null) {
  try {
    let url = `${API_BASE}/subjects`;
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    if (params.toString()) url += '?' + params.toString();

    const res = await fetch(url, {
      headers: AuthService.getAuthHeaders()
    });
    const subjects = await res.json();
    const grid = document.getElementById('subjects-grid');
    const noSubjects = document.getElementById('no-subjects');

    if (!subjects || subjects.length === 0) {
      grid.innerHTML = '';
      noSubjects.style.display = 'block';
      return;
    }

    noSubjects.style.display = 'none';
    grid.innerHTML = subjects.map(subject => `
      <div onclick="window.location.hash='#/subjects/${subject.subject_id}'" style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); cursor: pointer; transition: all 0.3s;">
        <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 600; margin: 0 0 0.5rem 0;">
          ${subject.name}
        </h3>
        <p style="color: #64748b; font-size: 0.95rem; margin: 0 0 1rem 0;">
          ${subject.description || 'Mata pelajaran'}
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="background: #ddd6fe; color: #7c3aed; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600;">
            ${subject.category || 'general'}
          </span>
          <span style="color: #7c3aed; font-weight: 600;">→</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading subjects:', err);
  }
}

function setupFilters() {
  const categoryFilter = document.getElementById('category-filter');
  const searchInput = document.getElementById('search-subjects');

  // Load categories
  loadCategories();

  // Event listeners
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      const search = searchInput?.value || null;
      loadSubjects(categoryFilter.value || null, search);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const category = categoryFilter?.value || null;
      loadSubjects(category, searchInput.value || null);
    });
  }
}

async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/subjects/categories/list`, {
      headers: AuthService.getAuthHeaders()
    });
    const categories = await res.json();
    const select = document.getElementById('category-filter');

    if (!categories || categories.length === 0) return;

    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.category || cat;
      option.textContent = cat.category || cat;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Error loading categories:', err);
  }
}
