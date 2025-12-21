import { AuthService } from "../../utils/auth.js";
import { API_BASE } from "../../utils/config.js";

const DUMMY_DATA = false;
const MOCK_QUIZZES = [];

// Load quizzes page static HTML
export async function initQuizzes(container) {
  try {
    const response = await fetch(
      new URL("../static/quizzes.html", import.meta.url).href
    );
    if (!response.ok) throw new Error(`Failed to load: ${response.status}`);

    const html = await response.text();
    container.innerHTML = html;

    loadQuizzes();

    // listen for quiz completion events so we can refresh the list without a reload
    if (window.__quizzesCompletedHandler) {
      window.removeEventListener('quiz:completed', window.__quizzesCompletedHandler);
    }
    window.__quizzesCompletedHandler = (ev) => {
      try { loadQuizzes(); } catch (e) { /* ignore */ }
    };
    window.addEventListener('quiz:completed', window.__quizzesCompletedHandler);

  } catch (err) {
    console.error("[QUIZZES] Failed to load HTML:", err);
    container.innerHTML =
      "<p class='center text-gray'>Error loading quizzes page. Silakan refresh.</p>";
  }
} 

async function loadQuizzes() {
  try {
    const res = await fetch(`${API_BASE}/quizzes`, {
      headers: AuthService.getAuthHeaders(),
    });

    let quizzes = [];
    if (res.ok) {
      const payload = await res.json();
      quizzes = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
    }

    if (!quizzes.length && DUMMY_DATA) quizzes = MOCK_QUIZZES;

    // import quiz progress helper lazily so this file can run in isolation in some previews
    const { isQuizCompleted } = await import('../../utils/quizProgress.js');

    const container = document.getElementById("quizzes-container");
    const noQuizzes = document.getElementById("no-quizzes");

    if (!quizzes || quizzes.length === 0) {
      if (container) container.innerHTML = "";
      if (noQuizzes) noQuizzes.style.display = "block";
      return;
    }

    if (noQuizzes) noQuizzes.style.display = "none";

    if (container) {
      // Only show quizzes that are not completed and not removed from catalog
      const visible = quizzes.filter(q => !q.removed && !isQuizCompleted(q.id));
      container.innerHTML = visible.map(renderQuizCard).join("");

      container.querySelectorAll(".start-quiz-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const quizId = btn.dataset.quizId;
          if (quizId) {
            window.location.hash = `#/quiz/${quizId}`;
          }
        });
      });
    }
  } catch (err) {
    console.error("[QUIZZES] Error loading quizzes:", err);
  }
}

function renderQuizCard(quiz) {
  const title = quiz.title || "Quiz";
  const desc = quiz.description || "Tidak ada deskripsi";
  const total = quiz.total_questions ?? quiz.question_count ?? 0;
  const duration = quiz.duration ?? quiz.duration_minutes ?? 0;
  const pass = quiz.passing_score ?? quiz.passingScore ?? 0;

  return `
    <div class="card fade-in-up" style="position:relative; padding-bottom:4.5rem;">

      <div>
        <h3>${title}</h3>
        <p class="text-gray">${desc}</p>
      </div>

      <div class="text-gray" style="margin-top:.75rem; font-size:.9rem;">
        <div>📝 ${total} soal</div>
        <div>⏱️ ${duration} menit</div>
        <div>✅ Lulus: ${pass}%</div>
      </div>

      <button
        class="btn btn-primary start-quiz-btn"
        data-quiz-id="${quiz.id}"
        style="position:absolute; bottom:1rem; left:1rem; right:1rem;"
        ${total === 0 ? "disabled" : ""}
      >
        Mulai Quiz
      </button>

    </div>
  `;
}

