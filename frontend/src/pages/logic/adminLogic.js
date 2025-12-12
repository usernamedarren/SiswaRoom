import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

// Load Admin Page
export async function initAdmin(container) {
  try {
    const htmlRaw = await fetch(new URL("../static/admin.html", import.meta.url)).then(r => r.text());
    container.innerHTML = htmlRaw;

    setupTabs();
    loadAdminStats();

    // default tab
    loadSubjectsAdmin();

  } catch (err) {
    console.error("[ADMIN] Failed to load page:", err);
    container.innerHTML = `<p class="center text-gray">Gagal memuat halaman admin.</p>`;
  }
}

// ===========================
// TAB CONTROLLER
// ===========================
function setupTabs() {
  document.querySelectorAll(".admin-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      switchAdminTab(tab);
    });
  });
}

export function switchAdminTab(tabName) {
  document.querySelectorAll(".admin-tab-btn").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.tab === tabName)
  );

  document.querySelectorAll("[id^='tab-']").forEach(tabDiv => {
    tabDiv.style.display = tabDiv.id === `tab-${tabName}` ? "block" : "none";
  });

  if (tabName === "subjects") loadSubjectsAdmin();
  if (tabName === "materials") loadMaterialsAdmin();
  if (tabName === "questions") loadQuestionsAdmin();
  if (tabName === "quizzes") loadQuizzesAdmin();
}

// ===========================
// LOAD ADMIN DASHBOARD STATS
// ===========================
async function loadAdminStats() {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: AuthService.getAuthHeaders()
    });
    const stats = await res.json();

    document.getElementById("stat-users").textContent = stats.users ?? "-";
    document.getElementById("stat-subjects").textContent = stats.subjects ?? "-";
    document.getElementById("stat-topics").textContent = stats.topics ?? "-";
    document.getElementById("stat-materials").textContent = stats.materials ?? "-";
    document.getElementById("stat-questions").textContent = stats.questions ?? "-";

  } catch (err) {
    console.error("[ADMIN] Failed stats:", err);
  }
}
// ===========================
// SUBJECTS CRUD
// ===========================
async function loadSubjectsAdmin() {
  try {
    const res = await fetch(`${API_BASE}/subjects`, {
      headers: AuthService.getAuthHeaders()
    });
    const subjects = await res.json();

    const container = document.getElementById("subjects-list");
    if (!subjects || subjects.length === 0) {
      container.innerHTML = `<p class="center text-gray">Tidak ada mata pelajaran.</p>`;
      return;
    }

    container.innerHTML = `
      <table class="admin-table fade-in-up">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Deskripsi</th>
            <th>Kategori</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${subjects.map(renderSubjectRow).join("")}
        </tbody>
      </table>
    `;

    attachSubjectActions();

  } catch (err) {
    console.error("[ADMIN] Failed load subjects:", err);
  }
}

function renderSubjectRow(sub) {
  return `
    <tr data-id="${sub.subject_id}">
      <td>${sub.name}</td>
      <td>${sub.description || "-"}</td>
      <td>${sub.category || "General"}</td>
      <td>
        <button class="admin-action-btn admin-edit" data-action="edit">Edit</button>
        <button class="admin-action-btn admin-delete" data-action="delete">Hapus</button>
      </td>
    </tr>
  `;
}

function attachSubjectActions() {
  document.querySelectorAll("#subjects-list [data-action='edit']").forEach(btn =>
    btn.addEventListener("click", () => {
      const row = btn.closest("tr");
      editSubject(row.dataset.id);
    })
  );

  document.querySelectorAll("#subjects-list [data-action='delete']").forEach(btn =>
    btn.addEventListener("click", () => {
      const row = btn.closest("tr");
      deleteSubject(row.dataset.id);
    })
  );
}

// =======================
// ADD SUBJECT FORM
// =======================
window.showAddSubjectForm = function () {
  const container = document.getElementById("subjects-list");
  container.innerHTML = `
    <div class="card fade-in-up">
      <h3>Tambah Mata Pelajaran</h3>

      <div class="input-group">
        <label>Nama</label>
        <input id="new-subject-name" class="input" />
      </div>

      <div class="input-group">
        <label>Deskripsi</label>
        <input id="new-subject-desc" class="input" />
      </div>

      <div class="input-group">
        <label>Kategori</label>
        <input id="new-subject-cat" class="input" placeholder="(opsional)" />
      </div>

      <button class="btn btn-primary full" id="btn-save-subject">Simpan</button>
      <button class="btn btn-secondary full" onclick="switchAdminTab('subjects')">Batal</button>
    </div>
  `;

  document.getElementById("btn-save-subject").onclick = saveNewSubject;
};

async function saveNewSubject() {
  const name = document.getElementById("new-subject-name").value.trim();
  const desc = document.getElementById("new-subject-desc").value.trim();
  const cat = document.getElementById("new-subject-cat").value.trim();

  if (!name) return alert("Nama wajib diisi.");

  await fetch(`${API_BASE}/subjects`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...AuthService.getAuthHeaders()
    },
    body: JSON.stringify({ name, description: desc, category: cat })
  });

  loadSubjectsAdmin();
}

async function editSubject(id) {
  const res = await fetch(`${API_BASE}/subjects/${id}`, {
    headers: AuthService.getAuthHeaders()
  });
  const sub = await res.json();

  const container = document.getElementById("subjects-list");

  container.innerHTML = `
    <div class="card fade-in-up">
      <h3>Edit Mata Pelajaran</h3>

      <div class="input-group">
        <label>Nama</label>
        <input id="edit-subject-name" class="input" value="${sub.name}" />
      </div>

      <div class="input-group">
        <label>Deskripsi</label>
        <input id="edit-subject-desc" class="input" value="${sub.description || ""}" />
      </div>

      <div class="input-group">
        <label>Kategori</label>
        <input id="edit-subject-cat" class="input" value="${sub.category || ""}" />
      </div>

      <button class="btn btn-primary full" id="btn-update-subject">Perbarui</button>
      <button class="btn btn-secondary full" onclick="switchAdminTab('subjects')">Batal</button>
    </div>
  `;

  document.getElementById("btn-update-subject").onclick = async () => {
    await fetch(`${API_BASE}/subjects/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders()
      },
      body: JSON.stringify({
        name: document.getElementById("edit-subject-name").value.trim(),
        description: document.getElementById("edit-subject-desc").value.trim(),
        category: document.getElementById("edit-subject-cat").value.trim(),
      })
    });

    loadSubjectsAdmin();
  };
}

async function deleteSubject(id) {
  if (!confirm("Hapus mata pelajaran ini?")) return;

  await fetch(`${API_BASE}/subjects/${id}`, {
    method: "DELETE",
    headers: AuthService.getAuthHeaders()
  });

  loadSubjectsAdmin();
}
// ===========================
// MATERIALS CRUD
// ===========================
async function loadMaterialsAdmin() {
  try {
    const res = await fetch(`${API_BASE}/materials`, {
      headers: AuthService.getAuthHeaders(),
    });
    const materials = await res.json();

    const container = document.getElementById("materials-list");

    if (!materials || materials.length === 0) {
      container.innerHTML = `<p class="center text-gray">Tidak ada materi.</p>`;
      return;
    }

    container.innerHTML = `
      <table class="admin-table fade-in-up">
        <thead>
          <tr>
            <th>Judul</th>
            <th>Jenis</th>
            <th>Konten</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${materials.map(renderMaterialRow).join("")}
        </tbody>
      </table>
    `;

    attachMaterialActions();

  } catch (err) {
    console.error("[ADMIN] Failed load materials:", err);
  }
}

function renderMaterialRow(mat) {
  return `
    <tr data-id="${mat.material_id}">
      <td>${mat.title}</td>
      <td>${mat.content_type}</td>
      <td>${shorten(mat.content)}</td>
      <td>
        <button class="admin-action-btn admin-edit" data-action="edit">Edit</button>
        <button class="admin-action-btn admin-delete" data-action="delete">Hapus</button>
      </td>
    </tr>
  `;
}

function attachMaterialActions() {
  document.querySelectorAll("#materials-list [data-action='edit']").forEach(btn =>
    btn.addEventListener("click", () => {
      const id = btn.closest("tr").dataset.id;
      editMaterial(id);
    })
  );

  document.querySelectorAll("#materials-list [data-action='delete']").forEach(btn =>
    btn.addEventListener("click", () => {
      const id = btn.closest("tr").dataset.id;
      deleteMaterial(id);
    })
  );
}

window.showAddMaterialForm = function () {
  const container = document.getElementById("materials-list");
  container.innerHTML = `
    <div class="card fade-in-up">
      <h3>Tambah Materi</h3>

      <div class="input-group">
        <label>Judul</label>
        <input id="new-m-title" class="input" />
      </div>

      <div class="input-group">
        <label>Jenis Konten</label>
        <select id="new-m-type" class="input">
          <option value="text">Text</option>
          <option value="pdf">PDF</option>
          <option value="video">Video</option>
          <option value="image">Image</option>
          <option value="link">Link</option>
        </select>
      </div>

      <div class="input-group">
        <label>Konten (URL / Text)</label>
        <textarea id="new-m-content" class="input"></textarea>
      </div>

      <button class="btn btn-primary full" id="btn-save-material">Simpan</button>
      <button class="btn btn-secondary full" onclick="switchAdminTab('materials')">Batal</button>
    </div>
  `;

  document.getElementById("btn-save-material").onclick = saveNewMaterial;
};

async function saveNewMaterial() {
  const title = document.getElementById("new-m-title").value.trim();
  const type = document.getElementById("new-m-type").value.trim();
  const content = document.getElementById("new-m-content").value.trim();

  if (!title) return alert("Judul wajib diisi.");

  await fetch(`${API_BASE}/materials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...AuthService.getAuthHeaders(),
    },
    body: JSON.stringify({ title, content_type: type, content }),
  });

  loadMaterialsAdmin();
}

async function editMaterial(id) {
  const res = await fetch(`${API_BASE}/materials/${id}`, {
    headers: AuthService.getAuthHeaders(),
  });
  const mat = await res.json();

  const container = document.getElementById("materials-list");

  container.innerHTML = `
    <div class="card fade-in-up">
      <h3>Edit Materi</h3>

      <div class="input-group">
        <label>Judul</label>
        <input id="edit-m-title" class="input" value="${mat.title}" />
      </div>

      <div class="input-group">
        <label>Jenis Konten</label>
        <select id="edit-m-type" class="input">
          <option ${mat.content_type==="text"?"selected":""} value="text">Text</option>
          <option ${mat.content_type==="pdf"?"selected":""} value="pdf">PDF</option>
          <option ${mat.content_type==="video"?"selected":""} value="video">Video</option>
          <option ${mat.content_type==="image"?"selected":""} value="image">Image</option>
          <option ${mat.content_type==="link"?"selected":""} value="link">Link</option>
        </select>
      </div>

      <div class="input-group">
        <label>Konten</label>
        <textarea id="edit-m-content" class="input">${mat.content || ""}</textarea>
      </div>

      <button class="btn btn-primary full" id="btn-update-material">Perbarui</button>
      <button class="btn btn-secondary full" onclick="switchAdminTab('materials')">Batal</button>
    </div>
  `;

  document.getElementById("btn-update-material").onclick = async () => {
    await fetch(`${API_BASE}/materials/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
      },
      body: JSON.stringify({
        title: document.getElementById("edit-m-title").value.trim(),
        content_type: document.getElementById("edit-m-type").value,
        content: document.getElementById("edit-m-content").value.trim(),
      }),
    });

    loadMaterialsAdmin();
  };
}

async function deleteMaterial(id) {
  if (!confirm("Hapus materi ini?")) return;

  await fetch(`${API_BASE}/materials/${id}`, {
    method: "DELETE",
    headers: AuthService.getAuthHeaders(),
  });

  loadMaterialsAdmin();
}

function shorten(text = "") {
  return text.length > 40 ? text.substring(0, 40) + "..." : text;
}
// ===========================
// QUESTIONS CRUD
// ===========================
async function loadQuestionsAdmin() {
  try {
    const res = await fetch(`${API_BASE}/questions`, {
      headers: AuthService.getAuthHeaders(),
    });
    const questions = await res.json();

    const container = document.getElementById("questions-list");

    if (!questions || questions.length === 0) {
      container.innerHTML = `<p class="center text-gray">Tidak ada pertanyaan.</p>`;
      return;
    }

    container.innerHTML = `
    <table class="admin-table fade-in-up">
      <thead>
        <tr>
          <th>Pertanyaan</th>
          <th>Kunci Jawaban</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        ${questions.map(renderQuestionRow).join("")}
      </tbody>
    </table>
    `;

    attachQuestionActions();

  } catch (err) {
    console.error("[ADMIN] Failed load questions:", err);
  }
}

function renderQuestionRow(q) {
  return `
    <tr data-id="${q.question_id}">
      <td>${shorten(q.question_text)}</td>
      <td>${q.correct_answer}</td>
      <td>
        <button class="admin-action-btn admin-edit" data-action="edit">Edit</button>
        <button class="admin-action-btn admin-delete" data-action="delete">Hapus</button>
      </td>
    </tr>
  `;
}

function attachQuestionActions() {
  document.querySelectorAll("#questions-list [data-action='edit']").forEach(btn =>
    btn.addEventListener("click", () => {
      editQuestion(btn.closest("tr").dataset.id);
    })
  );

  document.querySelectorAll("#questions-list [data-action='delete']").forEach(btn =>
    btn.addEventListener("click", () => {
      deleteQuestion(btn.closest("tr").dataset.id);
    })
  );
}

window.showAddQuestionForm = function () {
  const container = document.getElementById("questions-list");

  container.innerHTML = `
    <div class="card fade-in-up">
      <h3>Tambah Pertanyaan</h3>

      <div class="input-group">
        <label>Pertanyaan</label>
        <textarea id="new-q-text" class="input"></textarea>
      </div>

      <div class="input-group">
        <label>Kunci Jawaban</label>
        <input id="new-q-answer" class="input"/>
      </div>

      <button class="btn btn-primary full" id="btn-save-question">Simpan</button>
      <button class="btn btn-secondary full" onclick="switchAdminTab('questions')">Batal</button>
    </div>
  `;

  document.getElementById("btn-save-question").onclick = saveNewQuestion;
};

async function saveNewQuestion() {
  const text = document.getElementById("new-q-text").value.trim();
  const ans = document.getElementById("new-q-answer").value.trim();

  if (!text || !ans) return alert("Semua field wajib diisi");

  await fetch(`${API_BASE}/questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...AuthService.getAuthHeaders(),
    },
    body: JSON.stringify({ question_text: text, correct_answer: ans }),
  });

  loadQuestionsAdmin();
}

async function editQuestion(id) {
  const res = await fetch(`${API_BASE}/questions/${id}`, {
    headers: AuthService.getAuthHeaders(),
  });

  const q = await res.json();

  const container = document.getElementById("questions-list");

  container.innerHTML = `
    <div class="card fade-in-up">
      <h3>Edit Pertanyaan</h3>

      <div class="input-group">
        <label>Pertanyaan</label>
        <textarea id="edit-q-text" class="input">${q.question_text}</textarea>
      </div>

      <div class="input-group">
        <label>Kunci Jawaban</label>
        <input id="edit-q-answer" class="input" value="${q.correct_answer}"/>
      </div>

      <button class="btn btn-primary full" id="btn-update-question">Perbarui</button>
      <button class="btn btn-secondary full" onclick="switchAdminTab('questions')">Batal</button>
    </div>
  `;

  document.getElementById("btn-update-question").onclick = async () => {
    await fetch(`${API_BASE}/questions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
      },
      body: JSON.stringify({
        question_text: document.getElementById("edit-q-text").value.trim(),
        correct_answer: document.getElementById("edit-q-answer").value.trim(),
      }),
    });

    loadQuestionsAdmin();
  };
}

async function deleteQuestion(id) {
  if (!confirm("Hapus pertanyaan ini?")) return;

  await fetch(`${API_BASE}/questions/${id}`, {
    method: "DELETE",
    headers: AuthService.getAuthHeaders(),
  });

  loadQuestionsAdmin();
}
// ===========================
// QUIZZES CRUD
// ===========================
async function loadQuizzesAdmin() {
  try {
    const res = await fetch(`${API_BASE}/quizzes`, {
      headers: AuthService.getAuthHeaders(),
    });
    const quizzes = await res.json();

    const container = document.getElementById("quizzes-list");

    if (!quizzes || quizzes.length === 0) {
      container.innerHTML = `<p class="center text-gray">Tidak ada kuis.</p>`;
      return;
    }

    container.innerHTML = `
      <table class="admin-table fade-in-up">
        <thead>
          <tr>
            <th>Judul</th>
            <th>Deskripsi</th>
            <th>Soal</th>
            <th>Waktu (menit)</th>
            <th>Lulus (%)</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${quizzes.map(renderQuizRowAdmin).join("")}
        </tbody>
      </table>
    `;

    attachQuizActionsAdmin();

  } catch (err) {
    console.error("[ADMIN] Failed load quizzes:", err);
  }
}

function renderQuizRowAdmin(quiz) {
  return `
    <tr data-id="${quiz.quiz_id}">
      <td>${quiz.title}</td>
      <td>${shorten(quiz.description || "")}</td>
      <td>${quiz.question_count ?? 0}</td>
      <td>${quiz.time_limit ?? 0}</td>
      <td>${quiz.passing_score ?? 0}</td>
      <td>
        <button class="admin-action-btn admin-edit" data-action="edit">Edit</button>
        <button class="admin-action-btn admin-delete" data-action="delete">Hapus</button>
      </td>
    </tr>
  `;
}

function attachQuizActionsAdmin() {
  document
    .querySelectorAll("#quizzes-list [data-action='edit']")
    .forEach((btn) =>
      btn.addEventListener("click", () => {
        const id = btn.closest("tr").dataset.id;
        editQuizAdmin(id);
      })
    );

  document
    .querySelectorAll("#quizzes-list [data-action='delete']")
    .forEach((btn) =>
      btn.addEventListener("click", () => {
        const id = btn.closest("tr").dataset.id;
        deleteQuizAdmin(id);
      })
    );
}

// ===========================
// ADD QUIZ FORM
// ===========================
window.showAddQuizForm = function () {
  const container = document.getElementById("quizzes-list");

  container.innerHTML = `
    <div class="card fade-in-up">
      <h3>Tambah Kuis</h3>

      <div class="input-group">
        <label>Judul Quiz</label>
        <input id="new-quiz-title" class="input" />
      </div>

      <div class="input-group">
        <label>Deskripsi</label>
        <textarea id="new-quiz-desc" class="input"></textarea>
      </div>

      <div class="input-group">
        <label>Jumlah Soal</label>
        <input id="new-quiz-questions" class="input" type="number" min="1" />
      </div>

      <div class="input-group">
        <label>Waktu (menit)</label>
        <input id="new-quiz-time" class="input" type="number" min="0" />
      </div>

      <div class="input-group">
        <label>Passing Score (%)</label>
        <input id="new-quiz-passing" class="input" type="number" min="0" max="100" />
      </div>

      <button class="btn btn-primary full" id="btn-save-quiz">Simpan</button>
      <button class="btn btn-secondary full" onclick="switchAdminTab('quizzes')">Batal</button>
    </div>
  `;

  document.getElementById("btn-save-quiz").onclick = saveNewQuizAdmin;
};

async function saveNewQuizAdmin() {
  const title = document.getElementById("new-quiz-title").value.trim();
  const desc = document.getElementById("new-quiz-desc").value.trim();
  const qCount = Number(document.getElementById("new-quiz-questions").value);
  const time = Number(document.getElementById("new-quiz-time").value);
  const passing = Number(document.getElementById("new-quiz-passing").value);

  if (!title) return alert("Judul wajib diisi.");

  await fetch(`${API_BASE}/quizzes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...AuthService.getAuthHeaders(),
    },
    body: JSON.stringify({
      title,
      description: desc,
      question_count: qCount || 0,
      time_limit: time || 0,
      passing_score: passing || 0,
    }),
  });

  loadQuizzesAdmin();
}

// ===========================
// EDIT QUIZ
// ===========================
async function editQuizAdmin(id) {
  const res = await fetch(`${API_BASE}/quizzes/${id}`, {
    headers: AuthService.getAuthHeaders(),
  });
  const quiz = await res.json();

  const container = document.getElementById("quizzes-list");

  container.innerHTML = `
    <div class="card fade-in-up">
      <h3>Edit Kuis</h3>

      <div class="input-group">
        <label>Judul Quiz</label>
        <input id="edit-quiz-title" class="input" value="${quiz.title}" />
      </div>

      <div class="input-group">
        <label>Deskripsi</label>
        <textarea id="edit-quiz-desc" class="input">${quiz.description || ""}</textarea>
      </div>

      <div class="input-group">
        <label>Jumlah Soal</label>
        <input id="edit-quiz-questions" class="input" type="number" value="${quiz.question_count ?? 0}" />
      </div>

      <div class="input-group">
        <label>Waktu (menit)</label>
        <input id="edit-quiz-time" class="input" type="number" value="${quiz.time_limit ?? 0}" />
      </div>

      <div class="input-group">
        <label>Passing Score (%)</label>
        <input id="edit-quiz-passing" class="input" type="number" value="${quiz.passing_score ?? 0}" />
      </div>

      <button class="btn btn-primary full" id="btn-update-quiz">Perbarui</button>
      <button class="btn btn-secondary full" onclick="switchAdminTab('quizzes')">Batal</button>
    </div>
  `;

  document.getElementById("btn-update-quiz").onclick = async () => {
    await fetch(`${API_BASE}/quizzes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
      },
      body: JSON.stringify({
        title: document.getElementById("edit-quiz-title").value.trim(),
        description: document.getElementById("edit-quiz-desc").value.trim(),
        question_count: Number(document.getElementById("edit-quiz-questions").value) || 0,
        time_limit: Number(document.getElementById("edit-quiz-time").value) || 0,
        passing_score: Number(document.getElementById("edit-quiz-passing").value) || 0,
      }),
    });

    loadQuizzesAdmin();
  };
}

// ===========================
// DELETE QUIZ
// ===========================
async function deleteQuizAdmin(id) {
  if (!confirm("Hapus kuis ini?")) return;

  await fetch(`${API_BASE}/quizzes/${id}`, {
    method: "DELETE",
    headers: AuthService.getAuthHeaders(),
  });

  loadQuizzesAdmin();
}
