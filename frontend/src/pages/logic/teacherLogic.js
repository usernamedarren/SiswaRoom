import { AuthService } from "../../utils/auth.js";

/**
 * Guru Panel (role: teacher)
 * - Hanya: Materi, Video, Kuis
 * - Fallback localStorage kalau backend belum siap
 */

const LS_KEYS = {
  materi: "siswaroom_teacher_materi",
  video: "siswaroom_teacher_video",
  quiz: "siswaroom_teacher_quiz",
};

function safeJsonParse(str, fallback) {
  try { return JSON.parse(str) ?? fallback; } catch { return fallback; }
}
function loadLS(key) { return safeJsonParse(localStorage.getItem(key), []); }
function saveLS(key, value) { localStorage.setItem(key, JSON.stringify(value || [])); }
function uid(prefix = "id") { return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`; }

function getAPIBase() {
  return (typeof API_BASE !== "undefined" && API_BASE) || window.API_BASE || "";
}
function hasBackend() {
  const b = getAPIBase();
  return typeof b === "string" && b.length > 0;
}

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

// ========= Tab helper =========
function getTeacherTabFromHash() {
  const hash = location.hash || "#/teacher?tab=materi";
  const qs = hash.split("?")[1] || "";
  const params = new URLSearchParams(qs);
  const t = (params.get("tab") || "materi").toLowerCase();
  if (t === "video") return "video";
  if (t === "kuis") return "kuis";
  return "materi";
}

function switchTab(tabName) {
  // show/hide hanya berdasarkan section wrapper
  ["materi", "video", "kuis"].forEach(t => {
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
  if (tab === "video") await loadVideo();
  if (tab === "kuis") await loadQuiz();
}

// ========= Page init =========
export async function initTeacher(container) {
  const user = AuthService.getUser();
  if (!user || !["teacher", "admin"].includes(user.role)) {
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
  if (hasBackend()) {
    try {
      const res = await fetch(`${getAPIBase()}/teacher/materials`, {
        headers: AuthService.getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
      }
    } catch { }
  }
  return loadLS(LS_KEYS.materi);
}

async function persistMateri(next) {
  saveLS(LS_KEYS.materi, next);
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
        <td>${escapeHtml(m.subject || "-")}</td>
        <td class="text-gray">${escapeHtml(truncate(m.description || "", 64))}</td>
        <td>${m.link ? `<a class="link" href="${escapeAttr(m.link)}" target="_blank" rel="noreferrer">Buka</a>` : `<span class="text-gray">-</span>`}</td>
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
          <th>Mapel</th>
          <th>Deskripsi</th>
          <th>Link</th>
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

  el.innerHTML = `
    <div class="card fade-in-up">
      <h3>Tambah Materi</h3>

      <div class="input-group">
        <label>Judul</label>
        <input id="m-title" class="input" placeholder="Contoh: Persamaan Kuadrat" />
      </div>

      <div class="input-group">
        <label>Mapel</label>
        <input id="m-subject" class="input" placeholder="Contoh: Matematika" />
      </div>

      <div class="input-group">
        <label>Deskripsi</label>
        <input id="m-desc" class="input" placeholder="Ringkas aja" />
      </div>

      <div class="input-group">
        <label>Link Materi (Drive/Docs/PDF)</label>
        <input id="m-link" class="input" placeholder="https://..." />
      </div>

      <div style="display:flex; gap:.75rem; flex-wrap:wrap; margin-top:.25rem;">
        <button class="btn btn-primary" id="m-save">Simpan</button>
        <button class="btn btn-secondary" onclick="location.hash='#/teacher?tab=materi'">Batal</button>
      </div>
    </div>
  `;

  document.getElementById("m-save").onclick = async () => {
    const title = document.getElementById("m-title")?.value?.trim();
    const subject = document.getElementById("m-subject")?.value?.trim();
    const description = document.getElementById("m-desc")?.value?.trim();
    const link = document.getElementById("m-link")?.value?.trim();

    if (!title) return alert("Judul wajib.");
    if (!subject) return alert("Mapel wajib.");

    const current = await fetchMateri();
    const next = [
      ...current,
      {
        id: uid("materi"),
        title,
        subject,
        description: description || "",
        link: link || "",
        created_at: new Date().toISOString(),
      }
    ];

    await persistMateri(next);
    await loadMateri();
  };
};

async function editMateri(id) {
  if (!id) return;
  const current = await fetchMateri();
  const m = current.find(x => (x.id || x._id || x.uuid) === id);
  if (!m) return alert("Materi tidak ditemukan.");

  const el = document.getElementById("teacher-materi-list");
  if (!el) return;

  el.innerHTML = `
    <div class="card fade-in-up">
      <h3>Edit Materi</h3>

      <div class="input-group">
        <label>Judul</label>
        <input id="m-title" class="input" value="${escapeAttr(m.title || "")}" />
      </div>

      <div class="input-group">
        <label>Mapel</label>
        <input id="m-subject" class="input" value="${escapeAttr(m.subject || "")}" />
      </div>

      <div class="input-group">
        <label>Deskripsi</label>
        <input id="m-desc" class="input" value="${escapeAttr(m.description || "")}" />
      </div>

      <div class="input-group">
        <label>Link</label>
        <input id="m-link" class="input" value="${escapeAttr(m.link || "")}" />
      </div>

      <div style="display:flex; gap:.75rem; flex-wrap:wrap; margin-top:.25rem;">
        <button class="btn btn-primary" id="m-update">Simpan</button>
        <button class="btn btn-secondary" onclick="location.hash='#/teacher?tab=materi'">Batal</button>
      </div>
    </div>
  `;

  document.getElementById("m-update").onclick = async () => {
    const title = document.getElementById("m-title")?.value?.trim();
    const subject = document.getElementById("m-subject")?.value?.trim();
    const description = document.getElementById("m-desc")?.value?.trim();
    const link = document.getElementById("m-link")?.value?.trim();

    if (!title) return alert("Judul wajib.");
    if (!subject) return alert("Mapel wajib.");

    const next = current.map(x => {
      const xid = x.id || x._id || x.uuid;
      if (xid !== id) return x;
      return { ...x, title, subject, description: description || "", link: link || "" };
    });

    await persistMateri(next);
    await loadMateri();
  };
}

async function deleteMateri(id) {
  if (!id) return;
  if (!confirm("Hapus materi ini?")) return;
  const current = await fetchMateri();
  const next = current.filter(x => (x.id || x._id || x.uuid) !== id);
  await persistMateri(next);
  await loadMateri();
}

// ============================
// Video
// ============================
async function fetchVideo() {
  if (hasBackend()) {
    try {
      const res = await fetch(`${getAPIBase()}/teacher/videos`, { headers: AuthService.getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
      }
    } catch { }
  }
  return loadLS(LS_KEYS.video);
}
async function persistVideo(next) { saveLS(LS_KEYS.video, next); }

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
        <td>${escapeHtml(v.subject || "-")}</td>
        <td>${v.url ? `<a class="link" href="${escapeAttr(v.url)}" target="_blank" rel="noreferrer">Buka</a>` : `<span class="text-gray">-</span>`}</td>
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
          <th>Mapel</th>
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
        <label>Judul</label>
        <input id="v-title" class="input" placeholder="Contoh: Trigonometri Dasar" />
      </div>

      <div class="input-group">
        <label>Mapel</label>
        <input id="v-subject" class="input" placeholder="Contoh: Matematika" />
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

  document.getElementById("v-save").onclick = async () => {
    const title = document.getElementById("v-title")?.value?.trim();
    const subject = document.getElementById("v-subject")?.value?.trim();
    const url = document.getElementById("v-url")?.value?.trim();

    if (!title) return alert("Judul wajib.");
    if (!subject) return alert("Mapel wajib.");
    if (!url) return alert("Link video wajib.");

    const current = await fetchVideo();
    const next = [
      ...current,
      { id: uid("video"), title, subject, url, created_at: new Date().toISOString() }
    ];

    await persistVideo(next);
    await loadVideo();
  };
};

async function editVideo(id) {
  if (!id) return;
  const current = await fetchVideo();
  const v = current.find(x => (x.id || x._id || x.uuid) === id);
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
        <label>Mapel</label>
        <input id="v-subject" class="input" value="${escapeAttr(v.subject || "")}" />
      </div>

      <div class="input-group">
        <label>Link Video</label>
        <input id="v-url" class="input" value="${escapeAttr(v.url || "")}" />
      </div>

      <div style="display:flex; gap:.75rem; flex-wrap:wrap; margin-top:.25rem;">
        <button class="btn btn-primary" id="v-update">Simpan</button>
        <button class="btn btn-secondary" onclick="location.hash='#/teacher?tab=video'">Batal</button>
      </div>
    </div>
  `;

  document.getElementById("v-update").onclick = async () => {
    const title = document.getElementById("v-title")?.value?.trim();
    const subject = document.getElementById("v-subject")?.value?.trim();
    const url = document.getElementById("v-url")?.value?.trim();

    if (!title) return alert("Judul wajib.");
    if (!subject) return alert("Mapel wajib.");
    if (!url) return alert("Link video wajib.");

    const next = current.map(x => {
      const xid = x.id || x._id || x.uuid;
      if (xid !== id) return x;
      return { ...x, title, subject, url };
    });

    await persistVideo(next);
    await loadVideo();
  };
}

async function deleteVideo(id) {
  if (!id) return;
  if (!confirm("Hapus video ini?")) return;
  const current = await fetchVideo();
  const next = current.filter(x => (x.id || x._id || x.uuid) !== id);
  await persistVideo(next);
  await loadVideo();
}

// ============================
// Quiz
// ============================
async function fetchQuiz() {
  if (hasBackend()) {
    try {
      const res = await fetch(`${getAPIBase()}/teacher/quizzes`, { headers: AuthService.getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
      }
    } catch { }
  }
  return loadLS(LS_KEYS.quiz);
}
async function persistQuiz(next) { saveLS(LS_KEYS.quiz, next); }

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
        <td>${escapeHtml(q.subject || "-")}</td>
        <td class="text-gray">${escapeHtml(truncate(q.description || "", 64))}</td>
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
          <th>Mapel</th>
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

  el.innerHTML = `
    <div class="card fade-in-up">
      <h3>Tambah Kuis</h3>

      <div class="input-group">
        <label>Judul</label>
        <input id="q-title" class="input" placeholder="Contoh: Kuis Bab 1" />
      </div>

      <div class="input-group">
        <label>Mapel</label>
        <input id="q-subject" class="input" placeholder="Contoh: Matematika" />
      </div>

      <div class="input-group">
        <label>Deskripsi</label>
        <input id="q-desc" class="input" placeholder="Misal: 10 soal pilihan ganda" />
      </div>

      <div style="display:flex; gap:.75rem; flex-wrap:wrap; margin-top:.25rem;">
        <button class="btn btn-primary" id="q-save">Simpan</button>
        <button class="btn btn-secondary" onclick="location.hash='#/teacher?tab=kuis'">Batal</button>
      </div>
    </div>
  `;

  document.getElementById("q-save").onclick = async () => {
    const title = document.getElementById("q-title")?.value?.trim();
    const subject = document.getElementById("q-subject")?.value?.trim();
    const description = document.getElementById("q-desc")?.value?.trim();

    if (!title) return alert("Judul wajib.");
    if (!subject) return alert("Mapel wajib.");

    const current = await fetchQuiz();
    const next = [
      ...current,
      { id: uid("quiz"), title, subject, description: description || "", created_at: new Date().toISOString() }
    ];

    await persistQuiz(next);
    await loadQuiz();
  };
};

async function editQuiz(id) {
  if (!id) return;
  const current = await fetchQuiz();
  const q = current.find(x => (x.id || x._id || x.uuid) === id);
  if (!q) return alert("Kuis tidak ditemukan.");

  const el = document.getElementById("teacher-quiz-list");
  if (!el) return;

  el.innerHTML = `
    <div class="card fade-in-up">
      <h3>Edit Kuis</h3>

      <div class="input-group">
        <label>Judul</label>
        <input id="q-title" class="input" value="${escapeAttr(q.title || "")}" />
      </div>

      <div class="input-group">
        <label>Mapel</label>
        <input id="q-subject" class="input" value="${escapeAttr(q.subject || "")}" />
      </div>

      <div class="input-group">
        <label>Deskripsi</label>
        <input id="q-desc" class="input" value="${escapeAttr(q.description || "")}" />
      </div>

      <div style="display:flex; gap:.75rem; flex-wrap:wrap; margin-top:.25rem;">
        <button class="btn btn-primary" id="q-update">Simpan</button>
        <button class="btn btn-secondary" onclick="location.hash='#/teacher?tab=kuis'">Batal</button>
      </div>
    </div>
  `;

  document.getElementById("q-update").onclick = async () => {
    const title = document.getElementById("q-title")?.value?.trim();
    const subject = document.getElementById("q-subject")?.value?.trim();
    const description = document.getElementById("q-desc")?.value?.trim();

    if (!title) return alert("Judul wajib.");
    if (!subject) return alert("Mapel wajib.");

    const next = current.map(x => {
      const xid = x.id || x._id || x.uuid;
      if (xid !== id) return x;
      return { ...x, title, subject, description: description || "" };
    });

    await persistQuiz(next);
    await loadQuiz();
  };
}

async function deleteQuiz(id) {
  if (!id) return;
  if (!confirm("Hapus kuis ini?")) return;
  const current = await fetchQuiz();
  const next = current.filter(x => (x.id || x._id || x.uuid) !== id);
  await persistQuiz(next);
  await loadQuiz();
}
