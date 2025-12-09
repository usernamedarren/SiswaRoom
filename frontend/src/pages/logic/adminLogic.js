import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

export async function initAdmin(container) {
  try {
    const response = await fetch(new URL('../static/admin.html', import.meta.url).href);
    if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
    const html = await response.text();
    container.innerHTML = html;
    
    setupAdminTabs();
    loadAdminStats();
    loadSubjectsTable();
  } catch (err) {
    console.error('[ADMIN] Failed to load HTML:', err);
    container.innerHTML = '<p>Error loading admin page. Please refresh.</p>';
  }
}

function setupAdminTabs() {
  window.switchAdminTab = function(tabName) {
    // Hide all tabs
    document.getElementById('tab-subjects').style.display = 'none';
    document.getElementById('tab-materials').style.display = 'none';
    document.getElementById('tab-questions').style.display = 'none';
    document.getElementById('tab-quizzes').style.display = 'none';
    
    // Reset all buttons
    document.querySelectorAll('.admin-tab').forEach(btn => {
      btn.style.background = 'white';
      btn.style.color = '#64748b';
    });
    
    // Show selected tab
    const tabEl = document.getElementById(`tab-${tabName}`);
    if (tabEl) {
      tabEl.style.display = 'block';
      const btn = document.querySelector(`[data-tab="${tabName}"]`);
      if (btn) {
        btn.style.background = '#7c3aed';
        btn.style.color = 'white';
      }
      
      // Load data for the tab
      switch(tabName) {
        case 'subjects': loadSubjectsTable(); break;
        case 'materials': loadMaterialsTable(); break;
        case 'questions': loadQuestionsTable(); break;
        case 'quizzes': loadQuizzesTable(); break;
      }
    }
  };
}

async function loadAdminStats() {
  try {
    // Load users count
    const usersRes = await fetch(`${API_BASE}/users`, {
      headers: AuthService.getAuthHeaders()
    });
    const users = usersRes.ok ? await usersRes.json() : [];
    
    // Load subjects
    const subjectsRes = await fetch(`${API_BASE}/subjects`, {
      headers: AuthService.getAuthHeaders()
    });
    const subjects = subjectsRes.ok ? await subjectsRes.json() : [];
    
    // Load topics
    const topicsRes = await fetch(`${API_BASE}/topics`, {
      headers: AuthService.getAuthHeaders()
    });
    const topics = topicsRes.ok ? await topicsRes.json() : [];
    
    // Load materials
    const materialsRes = await fetch(`${API_BASE}/materials`, {
      headers: AuthService.getAuthHeaders()
    });
    const materials = materialsRes.ok ? await materialsRes.json() : [];
    
    // Load questions
    const questionsRes = await fetch(`${API_BASE}/questions`, {
      headers: AuthService.getAuthHeaders()
    });
    const questions = questionsRes.ok ? await questionsRes.json() : [];

    // Update stats
    const usersEl = document.getElementById('stat-users');
    const subjectsEl = document.getElementById('stat-subjects');
    const topicsEl = document.getElementById('stat-topics');
    const materialsEl = document.getElementById('stat-materials');
    const questionsEl = document.getElementById('stat-questions');

    if (usersEl) usersEl.textContent = users.length || 0;
    if (subjectsEl) subjectsEl.textContent = subjects.length || 0;
    if (topicsEl) topicsEl.textContent = topics.length || 0;
    if (materialsEl) materialsEl.textContent = materials.length || 0;
    if (questionsEl) questionsEl.textContent = questions.length || 0;
  } catch (err) {
    console.error('Error loading admin stats:', err);
  }
}

async function loadSubjectsTable() {
  try {
    const res = await fetch(`${API_BASE}/subjects`, {
      headers: AuthService.getAuthHeaders()
    });
    const subjects = await res.json();
    const container = document.getElementById('subjects-list');

    if (!subjects || subjects.length === 0) {
      if (container) container.innerHTML = '<p style="padding: 2rem; color: #64748b; text-align: center;">Tidak ada data mata pelajaran</p>';
      return;
    }

    if (container) {
      container.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
          <thead style="background: #f8fafc;">
            <tr>
              <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e2e8f0; color: #1e293b; font-weight: 600;">Nama</th>
              <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e2e8f0; color: #1e293b; font-weight: 600;">Deskripsi</th>
              <th style="padding: 1rem; text-align: center; border-bottom: 2px solid #e2e8f0; color: #1e293b; font-weight: 600;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${subjects.map(s => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 1rem; color: #1e293b;">${s.subject_name || s.name || 'N/A'}</td>
                <td style="padding: 1rem; color: #64748b;">${s.description || '-'}</td>
                <td style="padding: 1rem; text-align: center;">
                  <button data-action="edit-subject" data-id="${s.subject_id}" style="background: #0ea5e9; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; margin-right: 0.5rem;">Edit</button>
                  <button data-action="delete-subject" data-id="${s.subject_id}" style="background: #ef4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Hapus</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      container.querySelectorAll('button[data-action="edit-subject"]').forEach(btn => {
        btn.addEventListener('click', () => alert('Edit subject #' + btn.dataset.id));
      });
      container.querySelectorAll('button[data-action="delete-subject"]').forEach(btn => {
        btn.addEventListener('click', () => deleteItem('subject', btn.dataset.id));
      });
    }
  } catch (err) {
    console.error('Error loading subjects:', err);
  }
}

async function loadMaterialsTable() {
  try {
    const res = await fetch(`${API_BASE}/materials`, {
      headers: AuthService.getAuthHeaders()
    });
    const materials = await res.json();
    const container = document.getElementById('materials-list');

    if (!materials || materials.length === 0) {
      if (container) container.innerHTML = '<p style="padding: 2rem; color: #64748b; text-align: center;">Tidak ada data materi</p>';
      return;
    }

    if (container) {
      container.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
          <thead style="background: #f8fafc;">
            <tr>
              <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e2e8f0; color: #1e293b; font-weight: 600;">Judul</th>
              <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e2e8f0; color: #1e293b; font-weight: 600;">Tipe</th>
              <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e2e8f0; color: #1e293b; font-weight: 600;">Topik</th>
              <th style="padding: 1rem; text-align: center; border-bottom: 2px solid #e2e8f0; color: #1e293b; font-weight: 600;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${materials.map(m => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 1rem; color: #1e293b;">${m.title || 'N/A'}</td>
                <td style="padding: 1rem; color: #64748b;">${m.content_type || '-'}</td>
                <td style="padding: 1rem; color: #64748b;">${m.topic_id || '-'}</td>
                <td style="padding: 1rem; text-align: center;">
                  <button data-action="edit-material" data-id="${m.material_id}" style="background: #0ea5e9; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; margin-right: 0.5rem;">Edit</button>
                  <button data-action="delete-material" data-id="${m.material_id}" style="background: #ef4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Hapus</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      container.querySelectorAll('button[data-action="edit-material"]').forEach(btn => {
        btn.addEventListener('click', () => alert('Edit material #' + btn.dataset.id));
      });
      container.querySelectorAll('button[data-action="delete-material"]').forEach(btn => {
        btn.addEventListener('click', () => deleteItem('material', btn.dataset.id));
      });
    }
  } catch (err) {
    console.error('Error loading materials:', err);
  }
}

async function loadQuestionsTable() {
  try {
    const res = await fetch(`${API_BASE}/questions`, {
      headers: AuthService.getAuthHeaders()
    });
    const questions = await res.json();
    const container = document.getElementById('questions-list');

    if (!questions || questions.length === 0) {
      if (container) container.innerHTML = '<p style="padding: 2rem; color: #64748b; text-align: center;">Tidak ada data pertanyaan</p>';
      return;
    }

    if (container) {
      container.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
          <thead style="background: #f8fafc;">
            <tr>
              <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e2e8f0; color: #1e293b; font-weight: 600;">Pertanyaan</th>
              <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e2e8f0; color: #1e293b; font-weight: 600;">Kuis</th>
              <th style="padding: 1rem; text-align: center; border-bottom: 2px solid #e2e8f0; color: #1e293b; font-weight: 600;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${questions.map(q => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 1rem; color: #1e293b;">${q.question || 'N/A'}</td>
                <td style="padding: 1rem; color: #64748b;">${q.quiz_id || '-'}</td>
                <td style="padding: 1rem; text-align: center;">
                  <button data-action="edit-question" data-id="${q.question_id}" style="background: #0ea5e9; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; margin-right: 0.5rem;">Edit</button>
                  <button data-action="delete-question" data-id="${q.question_id}" style="background: #ef4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Hapus</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      container.querySelectorAll('button[data-action="edit-question"]').forEach(btn => {
        btn.addEventListener('click', () => alert('Edit question #' + btn.dataset.id));
      });
      container.querySelectorAll('button[data-action="delete-question"]').forEach(btn => {
        btn.addEventListener('click', () => deleteItem('question', btn.dataset.id));
      });
    }
  } catch (err) {
    console.error('Error loading questions:', err);
  }
}

async function loadQuizzesTable() {
  try {
    const res = await fetch(`${API_BASE}/quizzes`, {
      headers: AuthService.getAuthHeaders()
    });
    const quizzes = await res.json();
    const container = document.getElementById('quizzes-list');

    if (!quizzes || quizzes.length === 0) {
      if (container) container.innerHTML = '<p style="padding: 2rem; color: #64748b; text-align: center;">Tidak ada data kuis</p>';
      return;
    }

    if (container) {
      container.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
          <thead style="background: #f8fafc;">
            <tr>
              <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e2e8f0; color: #1e293b; font-weight: 600;">Judul</th>
              <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e2e8f0; color: #1e293b; font-weight: 600;">Waktu (menit)</th>
              <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e2e8f0; color: #1e293b; font-weight: 600;">Nilai Lulus</th>
              <th style="padding: 1rem; text-align: center; border-bottom: 2px solid #e2e8f0; color: #1e293b; font-weight: 600;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${quizzes.map(q => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 1rem; color: #1e293b;">${q.title || 'N/A'}</td>
                <td style="padding: 1rem; color: #64748b;">${q.time_limit || '-'}</td>
                <td style="padding: 1rem; color: #64748b;">${q.passing_score || '-'}%</td>
                <td style="padding: 1rem; text-align: center;">
                  <button data-action="edit-quiz" data-id="${q.quiz_id}" style="background: #0ea5e9; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; margin-right: 0.5rem;">Edit</button>
                  <button data-action="delete-quiz" data-id="${q.quiz_id}" style="background: #ef4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Hapus</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      container.querySelectorAll('button[data-action="edit-quiz"]').forEach(btn => {
        btn.addEventListener('click', () => alert('Edit quiz #' + btn.dataset.id));
      });
      container.querySelectorAll('button[data-action="delete-quiz"]').forEach(btn => {
        btn.addEventListener('click', () => deleteItem('quiz', btn.dataset.id));
      });
    }
  } catch (err) {
    console.error('Error loading quizzes:', err);
  }
}

// Global functions
window.showAddSubjectForm = function() {
  alert('Fitur tambah mata pelajaran sedang dikembangkan');
};

window.showAddMaterialForm = function() {
  alert('Fitur tambah materi sedang dikembangkan');
};

window.showAddQuestionForm = function() {
  alert('Fitur tambah pertanyaan sedang dikembangkan');
};

window.showAddQuizForm = function() {
  alert('Fitur tambah kuis sedang dikembangkan');
};

window.editItem = function(type, id) {
  alert(`Edit ${type}: ${id}`);
};

window.deleteItem = async function(type, id) {
  if (confirm(`Hapus ${type} ini?`)) {
    try {
      let endpoint = '';
      switch(type) {
        case 'subject': endpoint = `/subjects/${id}`; break;
        case 'material': endpoint = `/materials/${id}`; break;
        case 'question': endpoint = `/questions/${id}`; break;
        case 'quiz': endpoint = `/quizzes/${id}`; break;
      }
      
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers: AuthService.getAuthHeaders()
      });
      
      if (res.ok) {
        alert('Dihapus berhasil');
        // Reload the appropriate table
        switch(type) {
          case 'subject': loadSubjectsTable(); break;
          case 'material': loadMaterialsTable(); break;
          case 'question': loadQuestionsTable(); break;
          case 'quiz': loadQuizzesTable(); break;
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Gagal menghapus data');
    }
  }
};

// Expose no-op edit for now (to avoid reference errors)
window.editSubject = (id) => alert('Edit subject #' + id);
window.editMaterial = (id) => alert('Edit material #' + id);
window.editQuestion = (id) => alert('Edit question #' + id);
window.editQuiz = (id) => alert('Edit quiz #' + id);