import { API_BASE } from "../config/api.js";
import { AuthService } from "../utils/auth.js";

export function QuizzesPage() {
  setTimeout(() => loadQuizzes(), 100);
  return `
    <div style="max-width: 1400px; margin: 0 auto; padding: 2rem;">
      <!-- Page Header -->
      <div style="margin-bottom: 3rem;">
        <h1 style="color: #7c3aed; font-size: 2.5rem; font-weight: 700; margin: 0; margin-bottom: 0.5rem;">
          🎯 Quiz & Kuis
        </h1>
        <p style="color: #64748b; font-size: 1.1rem; margin: 0;">
          Uji pengetahuan Anda dengan quiz dari setiap mata pelajaran
        </p>
      </div>

      <!-- Quizzes Grid -->
      <div id="quizzes-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
        <div style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
          <p style="color: #64748b;">Memuat quiz...</p>
        </div>
      </div>

      <!-- No Results -->
      <div id="no-quizzes" style="display: none; text-align: center; padding: 3rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
        <p style="color: #64748b; font-size: 1.1rem;">
          Tidak ada quiz tersedia
        </p>
      </div>
    </div>
  `;
}

async function loadQuizzes() {
  try {
    const res = await fetch(`${API_BASE}/quizzes`, {
      headers: AuthService.getAuthHeaders()
    });
    const quizzes = await res.json();

    const container = document.getElementById("quizzes-container");
    if (!container) return;

    if (!quizzes || quizzes.length === 0) {
      container.innerHTML = '';
      document.getElementById("no-quizzes").style.display = 'block';
      return;
    }

    const difficultyColors = {
      easy: { color: '#10b981', label: 'Mudah' },
      medium: { color: '#f59e0b', label: 'Sedang' },
      hard: { color: '#ef4444', label: 'Sulit' }
    };

    container.innerHTML = quizzes.map(quiz => `
      <div style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s; cursor: pointer;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 16px rgba(0,0,0,0.12)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 600; margin: 0; flex: 1;">
            ${quiz.title}
          </h3>
          <span style="background: #f0f9ff; color: #0ea5e9; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
            ${quiz.question_count || 0} soal
          </span>
        </div>

        <p style="color: #64748b; font-size: 0.95rem; margin: 0 0 1rem 0;">
          ${quiz.description || 'Quiz untuk menguji pemahaman Anda'}
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; padding: 1rem; background: #f8fafc; border-radius: 8px;">
          <div>
            <p style="color: #64748b; font-size: 0.85rem; margin: 0 0 0.25rem 0;">⏱️ Waktu</p>
            <p style="color: #1e293b; font-weight: 600; margin: 0;">${quiz.time_limit} menit</p>
          </div>
          <div>
            <p style="color: #64748b; font-size: 0.85rem; margin: 0 0 0.25rem 0;">✅ Lulus</p>
            <p style="color: #1e293b; font-weight: 600; margin: 0;">${quiz.passing_score}%</p>
          </div>
        </div>

        <button onclick="startQuiz('${quiz.quiz_id}')" style="width: 100%; background: #7c3aed; color: white; border: none; padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s; font-size: 0.95rem;">
          Mulai Quiz
        </button>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading quizzes:', err);
    const container = document.getElementById("quizzes-container");
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #ef4444; grid-column: 1 / -1;">
          <p>⚠️ Gagal memuat quiz</p>
        </div>
      `;
    }
  }
}

window.startQuiz = function(quizId) {
  window.location.hash = `#/quiz/${quizId}`;
};

// Quiz Taking Page
export function QuizTakePage(quizId) {
  setTimeout(() => loadQuizDetail(quizId), 100);
  return `
    <div style="max-width: 900px; margin: 0 auto; padding: 2rem;">
      <button onclick="window.history.back()" style="background: none; border: none; color: #7c3aed; font-size: 1rem; cursor: pointer; margin-bottom: 1rem; font-weight: 600;">
        ← Kembali
      </button>

      <div id="quiz-detail-container">
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
          <p style="color: #64748b;">Memuat quiz...</p>
        </div>
      </div>
    </div>
  `;
}

async function loadQuizDetail(quizId) {
  try {
    const res = await fetch(`${API_BASE}/quizzes/${quizId}`, {
      headers: AuthService.getAuthHeaders()
    });
    const quiz = await res.json();

    const container = document.getElementById("quiz-detail-container");
    if (!container) return;

    let html = `
      <div style="background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h1 style="color: #1e293b; font-size: 1.8rem; font-weight: 700; margin: 0 0 1rem 0;">
          ${quiz.title}
        </h1>
        <p style="color: #64748b; font-size: 1rem; margin: 0 0 2rem 0;">
          ${quiz.description}
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; padding: 1.5rem; background: #f8fafc; border-radius: 8px; margin-bottom: 2rem;">
          <div style="text-align: center;">
            <p style="color: #64748b; font-size: 0.85rem; margin: 0;">Jumlah Soal</p>
            <p style="color: #7c3aed; font-weight: 700; font-size: 1.5rem; margin: 0.5rem 0 0 0;">${quiz.questions?.length || 0}</p>
          </div>
          <div style="text-align: center;">
            <p style="color: #64748b; font-size: 0.85rem; margin: 0;">Waktu</p>
            <p style="color: #7c3aed; font-weight: 700; font-size: 1.5rem; margin: 0.5rem 0 0 0;">${quiz.time_limit} min</p>
          </div>
          <div style="text-align: center;">
            <p style="color: #64748b; font-size: 0.85rem; margin: 0;">Nilai Lulus</p>
            <p style="color: #7c3aed; font-weight: 700; font-size: 1.5rem; margin: 0.5rem 0 0 0;">${quiz.passing_score}%</p>
          </div>
        </div>

        <form id="quiz-form" style="display: grid; gap: 2rem;">
          ${(quiz.questions || []).map((q, idx) => `
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem;">
              <p style="color: #1e293b; font-weight: 600; margin: 0 0 1rem 0;">
                <span style="background: #7c3aed; color: white; border-radius: 50%; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; margin-right: 0.5rem;">${idx + 1}</span>
                ${q.question_text}
              </p>

              <div style="display: grid; gap: 0.75rem;">
                ${['A', 'B', 'C', 'D'].map(opt => `
                  <label style="display: flex; align-items: center; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                    <input type="radio" name="q_${q.question_id}" value="${opt}" style="margin-right: 0.75rem; cursor: pointer;" onchange="this.parentElement.style.borderColor='#7c3aed'; this.parentElement.style.backgroundColor='#f5f3ff';" />
                    <span style="color: #1e293b;">${opt}. ${q[`option_${opt.toLowerCase()}`]}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}

          <button type="button" onclick="submitQuiz('${quizId}')" style="background: #7c3aed; color: white; border: none; padding: 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: all 0.3s;">
            Kirim Jawaban
          </button>
        </form>
      </div>
    `;

    container.innerHTML = html;
  } catch (err) {
    console.error('Error loading quiz:', err);
    document.getElementById("quiz-detail-container").innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #ef4444;">
        <p>⚠️ Gagal memuat quiz</p>
      </div>
    `;
  }
}

window.submitQuiz = async function(quizId) {
  try {
    const form = document.getElementById("quiz-form");
    const formData = new FormData(form);

    // Start quiz first
    const startRes = await fetch(`${API_BASE}/quizzes/${quizId}/start`, {
      method: 'POST',
      headers: AuthService.getAuthHeaders()
    });
    const startData = await startRes.json();

    if (!startData.result_id) {
      alert('Gagal memulai quiz');
      return;
    }

    // Collect answers
    const answers = [];
    const questions = document.querySelectorAll('input[type="radio"]:checked');
    
    questions.forEach(q => {
      answers.push({
        question_id: parseInt(q.name.split('_')[1]),
        selected_option: q.value
      });
    });

    if (answers.length === 0) {
      alert('Silakan jawab semua pertanyaan');
      return;
    }

    // Submit quiz
    const submitRes = await fetch(`${API_BASE}/quizzes/results/${startData.result_id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeaders()
      },
      body: JSON.stringify({ answers })
    });

    const result = await submitRes.json();

    // Show results
    showQuizResults(result);
  } catch (err) {
    console.error('Error submitting quiz:', err);
    alert('Gagal mengirim jawaban');
  }
};

function showQuizResults(result) {
  const isPassed = result.score >= 70;
  window.location.hash = `#/quiz-results/${result.result_id}`;
}

// Quiz Results Page
export function QuizResultsPage(resultId) {
  setTimeout(() => loadQuizResults(resultId), 100);
  return `
    <div style="max-width: 700px; margin: 0 auto; padding: 2rem;">
      <div id="results-container">
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
          <p style="color: #64748b;">Memuat hasil...</p>
        </div>
      </div>
    </div>
  `;
}

async function loadQuizResults(resultId) {
  try {
    const res = await fetch(`${API_BASE}/quizzes/results/${resultId}`, {
      headers: AuthService.getAuthHeaders()
    });
    const result = await res.json();

    const container = document.getElementById("results-container");
    if (!container) return;

    const isPassed = result.score >= 70;

    container.innerHTML = `
      <div style="background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">
          ${isPassed ? '🎉' : '😢'}
        </div>

        <h1 style="color: #1e293b; font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem 0;">
          ${isPassed ? 'Selamat! Anda Lulus!' : 'Coba Lagi'}
        </h1>

        <p style="color: #64748b; font-size: 1.1rem; margin: 0 0 2rem 0;">
          ${isPassed ? 'Anda berhasil menyelesaikan quiz ini' : 'Nilai Anda belum mencapai batas kelulusan'}
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1.5rem; background: #f8fafc; border-radius: 8px; margin-bottom: 2rem;">
          <div>
            <p style="color: #64748b; font-size: 0.85rem; margin: 0;">Skor Anda</p>
            <p style="color: #7c3aed; font-weight: 700; font-size: 2rem; margin: 0.5rem 0 0 0;">${result.score}%</p>
          </div>
          <div>
            <p style="color: #64748b; font-size: 0.85rem; margin: 0;">Jawaban Benar</p>
            <p style="color: #10b981; font-weight: 700; font-size: 2rem; margin: 0.5rem 0 0 0;">${result.correct_answers}/${result.total_questions}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <button onclick="window.location.hash = '#/kuis'" style="background: #e2e8f0; color: #1e293b; border: none; padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Kembali ke Quiz
          </button>
          <button onclick="window.location.hash = '#/'" style="background: #7c3aed; color: white; border: none; padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Dashboard
          </button>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Error loading results:', err);
    document.getElementById("results-container").innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #ef4444;">
        <p>⚠️ Gagal memuat hasil</p>
      </div>
    `;
  }
}
