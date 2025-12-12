import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

// Load Subjects Page
export async function initSubjects(container) {
  try {
    const response = await fetch(new URL('../static/subjects.html', import.meta.url).href);
    container.innerHTML = await response.text();

    loadSubjects();
    setupFilters();

  } catch (err) {
    container.innerHTML = "<p class='text-gray center'>Error memuat halaman.</p>";
  }
}

async function loadSubjects(category = null, search = null) {
  try {
    let url = `${API_BASE}/subjects`;
    const params = new URLSearchParams();

    if (category) params.append("category", category);
    if (search) params.append("search", search);

    if (params.toString()) url += "?" + params.toString();

    const res = await fetch(url, { headers: AuthService.getAuthHeaders() });
    const subjects = await res.json();

    const grid = document.getElementById("subjects-grid");
    const noSubjects = document.getElementById("no-subjects");

    if (!subjects || subjects.length === 0) {
      grid.innerHTML = "";
      noSubjects.style.display = "block";
      return;
    }

    noSubjects.style.display = "none";

    grid.innerHTML = subjects.map(sub => renderSubjectCard(sub)).join("");

    // add click events
    grid.querySelectorAll(".subject-card").forEach(card => {
      card.addEventListener("click", () => {
        window.location.hash = `#/subjects/${card.dataset.subjectId}`;
      });
    });

  } catch (err) {
    console.error(err);
  }
}

function renderSubjectCard(subject) {
  return `
    <div class="subject-card fade-in-up" data-subject-id="${subject.subject_id}">
      <h3>${subject.name}</h3>
      <p>${subject.description || "Tidak ada deskripsi"}</p>

      <div class="subject-progress">
        <div class="subject-label">
          <span>Kategori</span>
          <span>${subject.category || "General"}</span>
        </div>

        <div class="progress-track">
          <div class="progress-fill" style="width: ${Math.floor(Math.random()*60+30)}%"></div>
        </div>
      </div>
    </div>
  `;
}

function setupFilters() {
  const categoryFilter = document.getElementById("category-filter");
  const searchInput = document.getElementById("search-subjects");

  loadCategories();

  categoryFilter.addEventListener("change", () => {
    loadSubjects(categoryFilter.value, searchInput.value);
  });

  searchInput.addEventListener("input", () => {
    loadSubjects(categoryFilter.value, searchInput.value);
  });
}

async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/subjects/categories/list`, {
      headers: AuthService.getAuthHeaders(),
    });
    const categories = await res.json();

    const select = document.getElementById("category-filter");

    categories.forEach(cat => {
      const op = document.createElement("option");
      op.value = cat.category || cat;
      op.textContent = cat.category || cat;
      select.appendChild(op);
    });
  } catch {}
}
