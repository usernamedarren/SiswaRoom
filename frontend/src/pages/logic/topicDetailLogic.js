import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

export async function initTopicDetail(container, subjectId) {
  try {
    const res = await fetch(new URL('../static/topicDetail.html', import.meta.url).href);
    container.innerHTML = await res.text();
    loadSubjectDetail(subjectId);

  } catch {
    container.innerHTML = "<p class='text-gray center'>Gagal memuat halaman.</p>";
  }
}

async function loadSubjectDetail(subjectId) {
  try {
    // load subject as topic title fallback
    const subjectRes = await fetch(`${API_BASE}/subjects/${subjectId}`, {
      headers: AuthService.getAuthHeaders(),
    });

    const subject = await subjectRes.json();

    document.getElementById("topic-title").textContent =
      subject.name || "Topik";

    document.getElementById("topic-description").textContent =
      subject.description || "Deskripsi tidak tersedia.";

    // load materials
    const matsRes = await fetch(`${API_BASE}/materials?course_id=${subjectId}`, {
      headers: AuthService.getAuthHeaders(),
    });
    const data = await matsRes.json();

    const materials = Array.isArray(data) ? data : (data.data || []);
    const container = document.getElementById("materials-container");
    const noMat = document.getElementById("no-materials");

    if (!materials || materials.length === 0) {
      container.innerHTML = "";
      noMat.style.display = "block";
      return;
    }

    noMat.style.display = "none";

    container.innerHTML = materials.map(renderMaterialCard).join("");

  } catch (err) {
    console.error(err);
  }
}

function renderMaterialCard(mat) {
  const icon = getMaterialIcon(mat.content_type);

  return `
    <div class="material-card fade-in-up">
      <div class="material-info">
        <h3>${icon} ${mat.title}</h3>
        <p>${mat.description || "Tidak ada deskripsi"}</p>

        <div class="material-meta">
          <span class="quiz-chip">${mat.content_type}</span>
        </div>

        ${renderMaterialPreview(mat)}
      </div>
    </div>
  `;
}

function getMaterialIcon(type) {
  const icons = {
    video: "🎬",
    pdf: "📄",
    link: "🔗",
    image: "🖼️",
    text: "📝",
    document: "📑",
  };
  return icons[type] || "📘";
}

function renderMaterialPreview(mat) {
  if (!mat.content) return "";

  switch (mat.content_type) {
    case "video":
      return `<video controls class="material-video"><source src="${mat.content}" /></video>`;
    case "image":
      return `<img src="${mat.content}" class="material-image"/>`;
    case "pdf":
      return `<a class="btn btn-primary" href="${mat.content}" target="_blank">📥 Unduh PDF</a>`;
    case "link":
      return `<a class="btn btn-primary" href="${mat.content}" target="_blank">🔗 Buka Link</a>`;
    case "text":
    case "document":
      return `<div class="material-text">${mat.content}</div>`;
    default:
      return "";
  }
}
