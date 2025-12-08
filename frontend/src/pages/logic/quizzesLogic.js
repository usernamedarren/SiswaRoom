import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

// Load quizzes page static HTML
export async function initQuizzes(container) {
  try {
    const response = await fetch(new URL('../static/quizzes.html', import.meta.url).href);
    if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
    const html = await response.text();
    container.innerHTML = html;
    
    // Initialize logic
    loadQuizzes();
  } catch (err) {
    console.error('[QUIZZES] Failed to load HTML:', err);
    container.innerHTML = '<p>Error loading quizzes page. Please refresh.</p>';
  }
}

async function loadQuizzes() {
  try {
    const res = await fetch(`${API_BASE}/quizzes`, {
      headers: AuthService.getAuthHeaders()
    });
    const quizzes = await res.json();
    const container = document.getElementById('quizzes-container');
    const noQuizzes = document.getElementById('no-quizzes');

    if (!quizzes || quizzes.length === 0) {
      container.innerHTML = '';
      noQuizzes.style.display = 'block';
      return;
    }

    noQuizzes.style.display = 'none';
    container.innerHTML = quizzes.map(quiz => `
      <div style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s; cursor: pointer;">
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

        <button data-quiz-id="${quiz.quiz_id}" class="start-quiz-btn" style="width: 100%; background: #7c3aed; color: white; border: none; padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
          Mulai Quiz
        </button>
      </div>
    `).join('');

    // Add event listeners to quiz buttons
    container.querySelectorAll('.start-quiz-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const quizId = btn.dataset.quizId;
        window.location.hash = `#/quiz/${quizId}`;
      });
    });
  } catch (err) {
    console.error('Error loading quizzes:', err);
  }
}
