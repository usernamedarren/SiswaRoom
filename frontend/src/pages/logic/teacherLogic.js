import { AuthService } from "../../utils/auth.js";
import { API_BASE } from "../../utils/config.js";
import tplCreateMateri from "../templates/teacher/create-materi.html?raw";
import tplEditMateri from "../templates/teacher/edit-materi.html?raw";
import tplCreateQuiz from "../templates/teacher/create-quiz.html?raw";
import tplEditQuiz from "../templates/teacher/edit-quiz.html?raw";
import tplCreateLibrary from "../templates/teacher/create-library.html?raw";
import tplEditLibrary from "../templates/teacher/edit-library.html?raw";

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(str) { return escapeHtml(str).replaceAll("`", "&#096;"); }
function truncate(str, n = 80) {
  const s = String(str || "");
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function renderTemplate(raw, replacements = {}) {
  let html = raw;
  Object.entries(replacements).forEach(([k, v]) => {
    const safe = escapeAttr(String(v ?? ""));
    html = html.replaceAll(`{{${k}}}`, safe);
  });
  return html;
}

// ========= Tab helper =========
function getTeacherTabFromHash() {
  const hash = location.hash || "#/teacher?tab=materi";
  const qs = hash.split("?")[1] || "";
  const params = new URLSearchParams(qs);
  const t = (params.get("tab") || "materi").toLowerCase();
  if (t === "kuis") return "kuis";
  if (t === "library") return "library";
  return "materi";
}

function switchTab(tabName) {
  // show/hide hanya berdasarkan section wrapper
  ["materi", "kuis", "library"].forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    if (el) el.style.display = (t === tabName) ? "block" : "none";
  });
}

async function renderTeacherByHash() {
  // pastikan hanya jalan untuk halaman teacher
  const base = (location.hash || "").split("?")[0];
  if (base !== "#/teacher") return;

  const tab = getTeacherTabFromHash();
  switchTab(tab);

  if (tab === "materi") await loadMateri();
  if (tab === "kuis") await loadQuiz();
  if (tab === "library") await loadLibrary();
}

// ========= Page init =========
export async function initTeacher(container) {
  const user = AuthService.getUser();
  if (!user || !["teacher", "guru", "admin"].includes(user.role)) {
    container.innerHTML = `<p class="center text-gray">Access denied.</p>`;
    return;
  }

  const html = await fetch(new URL("../static/teacher.html", import.meta.url)).then(r => r.text());
  container.innerHTML = html;

  // Render pertama kali sesuai tab dari navbar
  await renderTeacherByHash();

  // Sync setiap klik tab navbar (hash berubah tapi masih /teacher)
  // biar gak nambah listener berulang kali kalau halaman teacher di-init ulang
  if (!window.__teacherHashBound) {
    window.__teacherHashBound = true;
    window.addEventListener("hashchange", () => {
      renderTeacherByHash();
    });
  }
}

// ============================
// Materi
// ============================
async function fetchMateri() {
  try {
    const res = await fetch(`${API_BASE}/teacher/materials`, {
      headers: AuthService.getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
    }
  } catch (err) {
    console.error("[TEACHER MATERI] Fetch error:", err);
  }
  return [];
}

async function loadMateri() {
  const el = document.getElementById("teacher-materi-list");
  if (!el) return;

  el.innerHTML = `<p class="center text-gray">Memuat...</p>`;

  const items = await fetchMateri();

  if (!items.length) {
    el.innerHTML = `<div class="center text-gray" style="padding:1rem;">Belum ada materi. Klik <b>Tambah Materi</b>.</div>`;
    return;
  }

  const rows = items.map(m => {
    const id = m.id || m._id || m.uuid;
    return `
      <tr data-id="${id}">
        <td style="font-weight:700;">${escapeHtml(m.title || "-")}</td>
        <td>${escapeHtml(m.course_name || "-")}</td>
        <td class="text-gray">${escapeHtml(truncate(m.short_description || m.full_description || "", 64))}</td>
        <td>${m.video_url ? `<a class="link" href="${escapeAttr(m.video_url)}" target="_blank" rel="noreferrer">Buka</a>` : `<span class="text-gray">-</span>`}</td>
        <td style="white-space:nowrap; display:flex; gap:.5rem; flex-wrap:wrap;">
          <button class="btn btn-secondary" data-action="edit">Edit</button>
          <button class="btn" data-action="delete">Hapus</button>
        </td>
      </tr>
    `;
  }).join("");

  el.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Judul</th>
          <th>Kursus</th>
          <th>Deskripsi</th>
          <th>Link Video</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  el.querySelectorAll("[data-action='edit']").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.closest("tr")?.dataset?.id;
      editMateri(id);
    });
  });

  el.querySelectorAll("[data-action='delete']").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.closest("tr")?.dataset?.id;
      deleteMateri(id);
    });
  });
}

window.showTeacherCreateMateri = function () {
  const el = document.getElementById("teacher-materi-list");
  if (!el) return;

  el.innerHTML = tplCreateMateri;

  // Load courses for dropdown
  loadCoursesForDropdown("m-course");

  document.getElementById("m-save").onclick = async () => {
    const course_id = document.getElementById("m-course")?.value?.trim();
    const title = document.getElementById("m-title")?.value?.trim();
    const short_description = document.getElementById("m-short-desc")?.value?.trim();
    const full_description = document.getElementById("m-full-desc")?.value?.trim();
    const video_url = document.getElementById("m-video-url")?.value?.trim();

    if (!course_id) return alert("Pilih kursus terlebih dahulu.");
    if (!title) return alert("Judul wajib.");

    try {
      const res = await fetch(`${API_BASE}/materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...AuthService.getAuthHeaders(),
        },
        body: JSON.stringify({
          course_id: parseInt(course_id),
          title,
          short_description: short_description || "",
          full_description: full_description || "",
          video_url: video_url || ""
        })
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(`Error: ${err.message || "Gagal membuat materi"}`);
      }

      alert("Materi berhasil ditambahkan!");
      await loadMateri();
    } catch (err) {
      console.error("[TEACHER MATERI] Create error:", err);
      alert("Error: " + err.message);
    }
  };
};

async function editMateri(id) {
  if (!id) return;
  const items = await fetchMateri();
  const m = items.find(x => x.id === id);
  if (!m) return alert("Materi tidak ditemukan.");

  const el = document.getElementById("teacher-materi-list");
  if (!el) return;

  el.innerHTML = renderTemplate(tplEditMateri, {
    title: m.title || "",
    short_description: m.short_description || "",
    full_description: m.full_description || "",
    video_url: m.video_url || "",
  });

  document.getElementById("m-update").onclick = async () => {
    const title = document.getElementById("m-title")?.value?.trim();
    const short_description = document.getElementById("m-short-desc")?.value?.trim();
    const full_description = document.getElementById("m-full-desc")?.value?.trim();
    const video_url = document.getElementById("m-video-url")?.value?.trim();

    if (!title) return alert("Judul wajib.");

    try {
      const res = await fetch(`${API_BASE}/materials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...AuthService.getAuthHeaders(),
        },
        body: JSON.stringify({
          title,
          short_description: short_description || "",
          full_description: full_description || "",
          video_url: video_url || ""
        })
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(`Error: ${err.message || "Gagal mengubah materi"}`);
      }

      alert("Materi berhasil diubah!");
      await loadMateri();
    } catch (err) {
      console.error("[TEACHER MATERI] Update error:", err);
      alert("Error: " + err.message);
    }
  };
}

async function deleteMateri(id) {
  if (!id) return;
  if (!confirm("Hapus materi ini?")) return;
  
  try {
    const res = await fetch(`${API_BASE}/materials/${id}`, {
      method: "DELETE",
      headers: AuthService.getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json();
      return alert(`Error: ${err.message || "Gagal menghapus materi"}`);
    }

    alert("Materi berhasil dihapus!");
    await loadMateri();
  } catch (err) {
    console.error("[TEACHER MATERI] Delete error:", err);
    alert("Error: " + err.message);
  }
}

// ============================
// Video
// ============================
async function fetchVideo() {
  try {
    const res = await fetch(`${API_BASE}/teacher/materials`, {
      headers: AuthService.getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      const materials = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
      // Filter materials that have video_url (treated as videos)
      return materials.filter(m => m.video_url);
    }
  } catch (err) {
    console.error("[TEACHER VIDEO] Fetch error:", err);
  }
  return [];
}

async function loadVideo() {
  const el = document.getElementById("teacher-video-list");
  if (!el) return;

  el.innerHTML = `<p class="center text-gray">Memuat...</p>`;

  const items = await fetchVideo();

  if (!items.length) {
    el.innerHTML = `<div class="center text-gray" style="padding:1rem;">Belum ada video. Klik <b>Tambah Video</b>.</div>`;
    return;
  }

  const rows = items.map(v => {
    const id = v.id || v._id || v.uuid;
    return `
      <tr data-id="${id}">
        <td style="font-weight:700;">${escapeHtml(v.title || "-")}</td>
        <td>${escapeHtml(v.course_name || "-")}</td>
        <td>${v.video_url ? `<a class="link" href="${escapeAttr(v.video_url)}" target="_blank" rel="noreferrer">Buka</a>` : `<span class="text-gray">-</span>`}</td>
        <td style="white-space:nowrap; display:flex; gap:.5rem; flex-wrap:wrap;">
          <button class="btn btn-secondary" data-action="edit">Edit</button>
          <button class="btn" data-action="delete">Hapus</button>
        </td>
      </tr>
    `;
  }).join("");

  el.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Judul</th>
          <th>Kursus</th>
          <th>Link Video</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  el.querySelectorAll("[data-action='edit']").forEach(btn => {
    btn.addEventListener("click", () => editVideo(btn.closest("tr")?.dataset?.id));
  });
  el.querySelectorAll("[data-action='delete']").forEach(btn => {
    btn.addEventListener("click", () => deleteVideo(btn.closest("tr")?.dataset?.id));
  });
}

window.showTeacherCreateVideo = function () {
  const el = document.getElementById("teacher-video-list");
  if (!el) return;

  el.innerHTML = `
    <div class="card fade-in-up">
      <h3>Tambah Video</h3>

      <div class="input-group">
        <label>Pilih Kursus</label>
        <select id="v-course" class="input">
          <option value="">-- Pilih Kursus --</option>
        </select>
      </div>

      <div class="input-group">
        <label>Judul</label>
        <input id="v-title" class="input" placeholder="Contoh: Trigonometri Dasar" />
      </div>

      <div class="input-group">
        <label>Deskripsi</label>
        <textarea id="v-desc" class="input" placeholder="Deskripsi video..." style="min-height:80px;"></textarea>
      </div>

      <div class="input-group">
        <label>Link Video (YouTube/Drive)</label>
        <input id="v-url" class="input" placeholder="https://..." />
      </div>

      <div style="display:flex; gap:.75rem; flex-wrap:wrap; margin-top:.25rem;">
        <button class="btn btn-primary" id="v-save">Simpan</button>
        <button class="btn btn-secondary" onclick="location.hash='#/teacher?tab=video'">Batal</button>
      </div>
    </div>
  `;

  loadCoursesForDropdown("v-course");

  document.getElementById("v-save").onclick = async () => {
    const course_id = document.getElementById("v-course")?.value?.trim();
    const title = document.getElementById("v-title")?.value?.trim();
    const short_description = document.getElementById("v-desc")?.value?.trim();
    const video_url = document.getElementById("v-url")?.value?.trim();

    if (!course_id) return alert("Pilih kursus terlebih dahulu.");
    if (!title) return alert("Judul wajib.");
    if (!video_url) return alert("Link video wajib.");

    try {
      const res = await fetch(`${API_BASE}/materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...AuthService.getAuthHeaders(),
        },
        body: JSON.stringify({
          course_id: parseInt(course_id),
          title,
          short_description: short_description || "",
          full_description: "",
          video_url
        })
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(`Error: ${err.message || "Gagal membuat video"}`);
      }

      alert("Video berhasil ditambahkan!");
      await loadVideo();
    } catch (err) {
      console.error("[TEACHER VIDEO] Create error:", err);
      alert("Error: " + err.message);
    }
  };
};

async function editVideo(id) {
  if (!id) return;
  const items = await fetchVideo();
  const v = items.find(x => x.id === id);
  if (!v) return alert("Video tidak ditemukan.");

  const el = document.getElementById("teacher-video-list");
  if (!el) return;

  el.innerHTML = `
    <div class="card fade-in-up">
      <h3>Edit Video</h3>

      <div class="input-group">
        <label>Judul</label>
        <input id="v-title" class="input" value="${escapeAttr(v.title || "")}" />
      </div>

      <div class="input-group">
        <label>Deskripsi</label>
        <textarea id="v-desc" class="input" style="min-height:80px;">${escapeHtml(v.short_description || "")}</textarea>
      </div>

      <div class="input-group">
        <label>Link Video</label>
        <input id="v-url" class="input" value="${escapeAttr(v.video_url || "")}" />
      </div>

      <div style="display:flex; gap:.75rem; flex-wrap:wrap; margin-top:.25rem;">
        <button class="btn btn-primary" id="v-update">Simpan</button>
        <button class="btn btn-secondary" onclick="location.hash='#/teacher?tab=video'">Batal</button>
      </div>
    </div>
  `;

  document.getElementById("v-update").onclick = async () => {
    const title = document.getElementById("v-title")?.value?.trim();
    const short_description = document.getElementById("v-desc")?.value?.trim();
    const video_url = document.getElementById("v-url")?.value?.trim();

    if (!title) return alert("Judul wajib.");
    if (!video_url) return alert("Link video wajib.");

    try {
      const res = await fetch(`${API_BASE}/materials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...AuthService.getAuthHeaders(),
        },
        body: JSON.stringify({
          title,
          short_description: short_description || "",
          full_description: "",
          video_url
        })
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(`Error: ${err.message || "Gagal mengubah video"}`);
      }

      alert("Video berhasil diubah!");
      await loadVideo();
    } catch (err) {
      console.error("[TEACHER VIDEO] Update error:", err);
      alert("Error: " + err.message);
    }
  };
}

async function deleteVideo(id) {
  if (!id) return;
  if (!confirm("Hapus video ini?")) return;
  
  try {
    const res = await fetch(`${API_BASE}/materials/${id}`, {
      method: "DELETE",
      headers: AuthService.getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json();
      return alert(`Error: ${err.message || "Gagal menghapus video"}`);
    }

    alert("Video berhasil dihapus!");
    await loadVideo();
  } catch (err) {
    console.error("[TEACHER VIDEO] Delete error:", err);
    alert("Error: " + err.message);
  }
}

// ============================
// Quiz
// ============================
async function fetchQuiz() {
  try {
    const res = await fetch(`${API_BASE}/teacher/quizzes`, {
      headers: AuthService.getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
    }
  } catch (err) {
    console.error("[TEACHER QUIZ] Fetch error:", err);
  }
  return [];
}

async function loadQuiz() {
  const el = document.getElementById("teacher-quiz-list");
  if (!el) return;

  el.innerHTML = `<p class="center text-gray">Memuat...</p>`;

  const items = await fetchQuiz();

  if (!items.length) {
    el.innerHTML = `<div class="center text-gray" style="padding:1rem;">Belum ada kuis. Klik <b>Tambah Kuis</b>.</div>`;
    return;
  }

  const rows = items.map(q => {
    const id = q.id || q._id || q.uuid;
    return `
      <tr data-id="${id}">
        <td style="font-weight:700;">${escapeHtml(q.title || "-")}</td>
        <td>${escapeHtml(q.course_name || "-")}</td>
        <td class="text-gray">${escapeHtml(truncate(q.short_description || "", 64))}</td>
        <td style="white-space:nowrap; display:flex; gap:.5rem; flex-wrap:wrap;">
          <button class="btn btn-secondary" data-action="edit">Edit</button>
          <button class="btn" data-action="delete">Hapus</button>
        </td>
      </tr>
    `;
  }).join("");

  el.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Judul</th>
          <th>Kursus</th>
          <th>Deskripsi</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  el.querySelectorAll("[data-action='edit']").forEach(btn => {
    btn.addEventListener("click", () => editQuiz(btn.closest("tr")?.dataset?.id));
  });
  el.querySelectorAll("[data-action='delete']").forEach(btn => {
    btn.addEventListener("click", () => deleteQuiz(btn.closest("tr")?.dataset?.id));
  });
}

window.showTeacherCreateQuiz = function () {
  const el = document.getElementById("teacher-quiz-list");
  if (!el) return;

  el.innerHTML = tplCreateQuiz;

  loadCoursesForDropdown("q-course");

  document.getElementById("q-save").onclick = async () => {
    const course_id = document.getElementById("q-course")?.value?.trim();
    const title = document.getElementById("q-title")?.value?.trim();
    const short_description = document.getElementById("q-desc")?.value?.trim();
    const total_questions = parseInt(document.getElementById("q-total")?.value) || 10;
    const duration_minutes = parseInt(document.getElementById("q-duration")?.value) || 15;
    const passing_score = parseInt(document.getElementById("q-passing")?.value) || 70;

    if (!course_id) return alert("Pilih kursus terlebih dahulu.");
    if (!title) return alert("Judul wajib.");

    try {
      const res = await fetch(`${API_BASE}/quizzes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...AuthService.getAuthHeaders(),
        },
        body: JSON.stringify({
          course_id: parseInt(course_id),
          title,
          short_description: short_description || "",
          total_questions,
          duration_minutes,
          passing_score
        })
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(`Error: ${err.message || "Gagal membuat kuis"}`);
      }

      alert("Kuis berhasil ditambahkan!");
      await loadQuiz();
    } catch (err) {
      console.error("[TEACHER QUIZ] Create error:", err);
      alert("Error: " + err.message);
    }
  };
};

async function editQuiz(id) {
  if (!id) return;
  const items = await fetchQuiz();
  const q = items.find(x => x.id === id);
  if (!q) return alert("Kuis tidak ditemukan.");

  const el = document.getElementById("teacher-quiz-list");
  if (!el) return;

  el.innerHTML = renderTemplate(tplEditQuiz, {
    title: q.title || "",
    short_description: q.short_description || "",
    total_questions: q.total_questions ?? 10,
    duration_minutes: q.duration_minutes ?? 15,
    passing_score: q.passing_score ?? 70,
  });

  document.getElementById("q-update").onclick = async () => {
    const title = document.getElementById("q-title")?.value?.trim();
    const short_description = document.getElementById("q-desc")?.value?.trim();
    const total_questions = parseInt(document.getElementById("q-total")?.value) || 10;
    const duration_minutes = parseInt(document.getElementById("q-duration")?.value) || 15;
    const passing_score = parseInt(document.getElementById("q-passing")?.value) || 70;

    if (!title) return alert("Judul wajib.");

    try {
      const res = await fetch(`${API_BASE}/quizzes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...AuthService.getAuthHeaders(),
        },
        body: JSON.stringify({
          title,
          short_description: short_description || "",
          total_questions,
          duration_minutes,
          passing_score
        })
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(`Error: ${err.message || "Gagal mengubah kuis"}`);
      }

      alert("Kuis berhasil diubah!");
      await loadQuiz();
    } catch (err) {
      console.error("[TEACHER QUIZ] Update error:", err);
      alert("Error: " + err.message);
    }
  };
}

async function deleteQuiz(id) {
  if (!id) return;
  if (!confirm("Hapus kuis ini?")) return;
  
  try {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, {
      method: "DELETE",
      headers: AuthService.getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json();
      return alert(`Error: ${err.message || "Gagal menghapus kuis"}`);
    }

    alert("Kuis berhasil dihapus!");
    await loadQuiz();
  } catch (err) {
    console.error("[TEACHER QUIZ] Delete error:", err);
    alert("Error: " + err.message);
  }
}

// ============================
// Library
// ============================
async function fetchLibraryItems() {
  try {
    const res = await fetch(`${API_BASE}/teacher/library`, {
      headers: AuthService.getAuthHeaders(),
    });

    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
    }
  } catch (err) {
    console.error("[TEACHER LIBRARY] Fetch error:", err);
  }
  return [];
}

async function loadLibrary() {
  const el = document.getElementById("teacher-library-list");
  if (!el) return;

  el.innerHTML = `<p class="center text-gray">Memuat...</p>`;

  const items = await fetchLibraryItems();

  if (!items.length) {
    el.innerHTML = `<div class="center text-gray" style="padding:1rem;">Belum ada library. Klik <b>Tambah Library</b>.</div>`;
    return;
  }

  const rows = items.map(item => {
    const id = item.id || item._id || item.uuid;
    const type = item.type || item.item_type;
    return `
      <tr data-id="${id}">
        <td style="font-weight:700;">${escapeHtml(item.title || "-")}</td>
        <td>${escapeHtml(item.course_name || "-")}</td>
        <td>${escapeHtml(type || "-")}</td>
        <td>${item.file_url ? `<a class="link" href="${escapeAttr(item.file_url)}" target="_blank" rel="noreferrer">Buka</a>` : `<span class="text-gray">-</span>`}</td>
        <td style="white-space:nowrap; display:flex; gap:.5rem; flex-wrap:wrap;">
          <button class="btn btn-secondary" data-action="edit">Edit</button>
          <button class="btn" data-action="delete">Hapus</button>
        </td>
      </tr>
    `;
  }).join("");

  el.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Judul</th>
          <th>Kursus</th>
          <th>Tipe</th>
          <th>Link</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  el.querySelectorAll("[data-action='edit']").forEach(btn => {
    btn.addEventListener("click", () => editLibrary(btn.closest("tr")?.dataset?.id));
  });
  el.querySelectorAll("[data-action='delete']").forEach(btn => {
    btn.addEventListener("click", () => deleteLibrary(btn.closest("tr")?.dataset?.id));
  });
}

window.showTeacherCreateLibrary = function () {
  const el = document.getElementById("teacher-library-list");
  if (!el) return;

  el.innerHTML = tplCreateLibrary;

  loadCoursesForDropdown("l-course");

  document.getElementById("l-save").onclick = async () => {
    const course_id = document.getElementById("l-course")?.value?.trim();
    const title = document.getElementById("l-title")?.value?.trim();
    const type = document.getElementById("l-type")?.value?.trim();
    const short_description = document.getElementById("l-desc")?.value?.trim();
    const file_url = document.getElementById("l-url")?.value?.trim();

    if (!course_id) return alert("Pilih kursus terlebih dahulu.");
    if (!title) return alert("Judul wajib.");
    if (!type) return alert("Tipe wajib.");
    if (!file_url) return alert("Link file wajib.");

    try {
      const res = await fetch(`${API_BASE}/library`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...AuthService.getAuthHeaders(),
        },
        body: JSON.stringify({
          course_id: parseInt(course_id),
          title,
          type,
          short_description: short_description || "",
          file_url
        })
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(`Error: ${err.message || "Gagal menambah library"}`);
      }

      alert("Library berhasil ditambahkan!");
      await loadLibrary();
    } catch (err) {
      console.error("[TEACHER LIBRARY] Create error:", err);
      alert("Error: " + err.message);
    }
  };
};

async function editLibrary(id) {
  if (!id) return;
  const items = await fetchLibraryItems();
  const item = items.find(x => (x.id || x._id || x.uuid) === id);
  if (!item) return alert("Library tidak ditemukan.");

  const el = document.getElementById("teacher-library-list");
  if (!el) return;

  const type = item.type || item.item_type || "";
  el.innerHTML = renderTemplate(tplEditLibrary, {
    title: item.title || "",
    short_description: item.short_description || "",
    file_url: item.file_url || "",
    selected_ebook: type === "ebook" ? "selected" : "",
    selected_pdf: type === "pdf" ? "selected" : "",
    selected_catatan: type === "catatan" ? "selected" : "",
    selected_bank_soal: type === "bank_soal" ? "selected" : "",
  });

  document.getElementById("l-update").onclick = async () => {
    const title = document.getElementById("l-title")?.value?.trim();
    const typeUpdate = document.getElementById("l-type")?.value?.trim();
    const short_description = document.getElementById("l-desc")?.value?.trim();
    const file_url = document.getElementById("l-url")?.value?.trim();

    if (!title) return alert("Judul wajib.");
    if (!typeUpdate) return alert("Tipe wajib.");
    if (!file_url) return alert("Link file wajib.");

    try {
      const res = await fetch(`${API_BASE}/library/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...AuthService.getAuthHeaders(),
        },
        body: JSON.stringify({
          title,
          type: typeUpdate,
          short_description: short_description || "",
          file_url
        })
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(`Error: ${err.message || "Gagal mengubah library"}`);
      }

      alert("Library berhasil diubah!");
      await loadLibrary();
    } catch (err) {
      console.error("[TEACHER LIBRARY] Update error:", err);
      alert("Error: " + err.message);
    }
  };
}

async function deleteLibrary(id) {
  if (!id) return;
  if (!confirm("Hapus library ini?")) return;

  try {
    const res = await fetch(`${API_BASE}/library/${id}`, {
      method: "DELETE",
      headers: AuthService.getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json();
      return alert(`Error: ${err.message || "Gagal menghapus library"}`);
    }

    alert("Library berhasil dihapus!");
    await loadLibrary();
  } catch (err) {
    console.error("[TEACHER LIBRARY] Delete error:", err);
    alert("Error: " + err.message);
  }
}

// ============================
// Helper: Load courses for dropdown
// ============================
async function loadCoursesForDropdown(selectElementId) {
  const selectEl = document.getElementById(selectElementId);
  if (!selectEl) return;

  try {
    const res = await fetch(`${API_BASE}/teacher/courses`, {
      headers: AuthService.getAuthHeaders(),
    });

    if (!res.ok) return;

    const courses = await res.json();
    const options = courses.map(c => `<option value="${c.id}">${escapeHtml(c.name || "")}</option>`).join("");
    
    if (options) {
      selectEl.innerHTML = `<option value="">-- Pilih Kursus --</option>${options}`;
    }
  } catch (err) {
    console.error("[TEACHER] Load courses error:", err);
  }
}
