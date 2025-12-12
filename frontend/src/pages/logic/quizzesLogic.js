import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

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

    const quizzes = await res.json();
    const container = document.getElementById("quizzes-container");
    const noQuizzes = document.getElementById("no-quizzes");

    if (!quizzes || quizzes.length === 0) {
      if (container) container.innerHTML = "";
      if (noQuizzes) noQuizzes.style.display = "block";
      return;
    }

    if (noQuizzes) noQuizzes.style.display = "none";

    if (container) {
      container.innerHTML = quizzes.map(renderQuizCard).join("");

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
  const desc = quiz.description || "Quiz untuk menguji pemahaman Anda";
  const questions = quiz.question_count || 0;
  const time = quiz.time_limit || 0;
  const passing = quiz.passing_score || 0;

  return `
    <div class="quiz-card fade-in-up">
      <div class="quiz-meta">
        <h3>${title}</h3>
        <span class="quiz-chip">${questions} soal</span>
      </div>

      <p>${desc}</p>

      <div class="materials-list" style="margin-top: 1rem;">
        <div class="material-meta">
          <span>⏱️ Waktu: <strong>${time}</strong> menit</span>
          <span>✅ Lulus: <strong>${passing}%</strong></span>
        </div>
      </div>

      <button 
        class="btn btn-primary full start-quiz-btn" 
        data-quiz-id="${quiz.quiz_id}">
        Mulai Quiz
      </button>
    </div>
  `;
}
