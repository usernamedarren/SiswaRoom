import { AuthService } from "../../utils/auth.js";
import { API_BASE } from "../../utils/config.js";

const FALLBACK_BANK = {
  "q-lain-1": {
    title: "Kuis Materi EduToon",
    questions: [
      {
        question: "Huruf apakah yang ada di awal ibu?",
        options: ["B", "I", "U", "A"],
        answer: "I",
        explanation: "Kata ibu diawali dengan huruf I. Kita membaca kata dari huruf pertama ya",
      }
    ]
  },
  q1: {
    title: "Bilangan Bulat",
    questions: [
      {
        question: "Hasil dari <strong>-15 + 23</strong> adalah...",
        options: ["8", "-8", "38", "-38"],
        answer: "8",
        explanation: "Karena -15 + 23 = 8. Ingat aturan penjumlahan bilangan negatif dan positif.",
      },
      { question: "Berapa hasil 5 x 6?", options: ["11", "30", "56", "15"], answer: "30", explanation: "5 x 6 = 30 karena perkalian adalah penjumlahan berulang (5 ditambahkan 6 kali)." },
      { question: "Bilangan prima kecil berikut ini adalah...", options: ["4", "6", "7", "9"], answer: "7", explanation: "7 adalah bilangan prima karena hanya memiliki 1 dan dirinya sendiri sebagai pembagi." },
    ],
  },
  q2: {
    title: "Aljabar Dasar",
    questions: [
      { question: "Jika x = 3, maka 2x + 1 = ?", options: ["6", "7", "8", "9"], answer: "7", explanation: "2x + 1 = 2*3 + 1 = 7." },
      { question: "Penyelesaian dari x + 5 = 12 adalah...", options: ["5", "6", "7", "8"], answer: "7", explanation: "x = 12 - 5 = 7." },
    ],
  },
  default: {
    title: "Quiz",
    questions: [
      { question: "Contoh soal: 1 + 1 = ?", options: ["1", "2", "3", "4"], answer: "2", explanation: "1 + 1 = 2." },
    ],
  },
};

export async function initQuizDetailPage(container, quizId) {
  try {
    const response = await fetch(new URL("../static/quizDetail.html", import.meta.url).href);
    if (!response.ok) throw new Error("Failed to load quiz detail html");
    const html = await response.text();
    container.innerHTML = html;

    const quiz = await fetchQuizData(quizId);
    initQuizDetail(quiz);
  } catch (err) {
    console.error("[QUIZ DETAIL] Failed to load HTML:", err);
    container.innerHTML = '<p class="center text-gray">Error loading quiz detail. Silakan refresh.</p>';
  }
}

async function fetchQuizData(quizId) {
// 1. CEK DULU: Jika quizId adalah kuis 'Lain-lain', ambil langsung dari FE
  if (quizId.startsWith('q-lain') || quizId.includes('lain')) {
    console.log("[QUIZ] Mengambil kuis Lain-lain langsung dari Frontend (FE)");
    const fallback = FALLBACK_BANK[quizId] || FALLBACK_BANK.default;
    return normalizeQuiz(fallback, quizId, true);
  }

  try {
    const res = await fetch(`${API_BASE}/quizzes/${quizId}`, {
      headers: { ...AuthService.getAuthHeaders() },
    });

    if (!res.ok) throw new Error(`Status ${res.status}`);

    const payload = await res.json();
    return normalizeQuiz(payload, quizId);
  } catch (err) {
    console.warn("[QUIZ DETAIL] Falling back to dummy quiz:", err);
    const fallback = FALLBACK_BANK[quizId] || FALLBACK_BANK.default;
    return normalizeQuiz(fallback, quizId, true);
  }
}

function normalizeQuiz(raw, quizId, isFallback = false) {
  const questionsRaw = Array.isArray(raw?.questions) ? raw.questions : [];
  const normalizedQuestions = questionsRaw.length ? questionsRaw.map((q, idx) => normalizeQuestion(q, idx)) : normalizeFromSimple(raw.questions || []);

  if (normalizedQuestions.length === 0 && isFallback) {
    return {
      id: quizId,
      title: raw.title || raw.name || "Quiz",
      questions: (raw.questions || []).map((q, idx) => normalizeSimpleQuestion(q, idx)),
    };
  }

  if (normalizedQuestions.length === 0) {
    const fallback = FALLBACK_BANK.default;
    return normalizeQuiz(fallback, quizId, true);
  }

  return {
    id: raw.id || quizId,
    title: raw.title || raw.name || "Quiz",
    questions: normalizedQuestions,
  };
}

function normalizeFromSimple(list) {
  return (list || []).map((q, idx) => normalizeSimpleQuestion(q, idx));
}

function normalizeSimpleQuestion(q, idx) {
  const opts = Array.isArray(q.options) ? q.options : [];
  return {
    id: q.id || q.question_id || `${idx}`,
    question: q.question || q.question_text || q.text || "Pertanyaan belum tersedia.",
    options: opts.map((opt, oIdx) => ({
      id: typeof opt === "string" ? `${idx}-${oIdx}` : opt.id || opt.option_id || `${idx}-${oIdx}`,
      text: typeof opt === "string" ? opt : opt.option_text || opt.text || opt.label || String(opt.value || ""),
      isCorrect: typeof opt === "string" ? opt === q.answer : Boolean(opt.is_correct || opt.correct),
    })),
    explanation: q.explanation || "",
  };
}

function normalizeQuestion(q, idx) {
  const optionsRaw = Array.isArray(q.options) ? q.options : Array.isArray(q.choices) ? q.choices : [];
  const options = optionsRaw.map((opt, oIdx) => {
    const id = opt.id || opt.option_id || `${idx}-${oIdx}`;
    const text = opt.option_text || opt.text || opt.label || String(opt.value || "");
    const isCorrect = Boolean(
      opt.is_correct ||
      opt.correct ||
      opt.is_true ||
      (q.correct_option_id && (id === q.correct_option_id || opt.option_id === q.correct_option_id)) ||
      (q.correct_answer && String(q.correct_answer).trim() === text.trim())
    );

    return { id, text, isCorrect };
  }).filter((o) => o.text);

  if (q.correct_answer) {
    options.forEach((opt) => {
      if (String(q.correct_answer).trim() === opt.text.trim()) opt.isCorrect = true;
    });
  }

  const hasCorrect = options.some((o) => o.isCorrect);
  if (!hasCorrect && options.length) options[0].isCorrect = true;

  return {
    id: q.id || q.question_id || `${idx}`,
    question: q.question || q.question_text || q.text || "Pertanyaan belum tersedia.",
    options,
    explanation: q.explanation || "",
  };
}

export function initQuizDetail(quiz) {
  const root = document.querySelector(".quiz-card");
  if (!root) return;
  if (root.__quizInitialized) return;
  root.__quizInitialized = true;

  const titleEl = document.querySelector(".quiz-title");
  if (titleEl) titleEl.textContent = quiz.title || "Quiz";

  const QUIZ = quiz.questions || [];
  if (!QUIZ.length) {
    root.innerHTML = '<p class="text-gray">Tidak ada soal pada quiz ini.</p>';
    return;
  }

  let idx = 0;
  let phase = "answering";
  const answers = Array(QUIZ.length).fill(null);

  const qEl = document.querySelector(".quiz-question");
  const optsContainer = document.querySelector(".quiz-options");
  const progressBar = document.querySelector(".quiz-progress-bar");
  const submit = document.querySelector(".quiz-submit");
  const explBox = document.querySelector(".quiz-explanation");
  const explText = explBox?.querySelector(".quiz-explanation-text");

  function getCorrectOption(question) {
    return question.options.find((o) => o.isCorrect) || null;
  }

  function clearFeedbackArea() {
    const existing = document.querySelectorAll(".quiz-result, .quiz-feedback, .quiz-explanations-summary");
    existing.forEach((el) => el.remove());
  }

  function updateProgress() {
    if (!progressBar) return;
    let answeredCount = answers.filter((a) => a !== null).length;
    const hasSelection = !!optsContainer?.querySelector(".quiz-option.selected");
    if (phase === "answering" && hasSelection && answers[idx] === null) answeredCount += 1;
    const percent = Math.round((answeredCount / QUIZ.length) * 100);
    progressBar.style.width = percent + "%";
    try {
      progressBar.style.background = "#4ee1a1";
      progressBar.style.boxShadow = "none";
    } catch (e) {}
  }

  function renderQuestion() {
    phase = "answering";
    clearFeedbackArea();

    const q = QUIZ[idx];
    qEl.innerHTML = q.question;

    if (explBox) {
      explBox.classList.remove("show");
      explBox.setAttribute("aria-hidden", "true");
      if (explText) explText.textContent = "";
    }

    optsContainer.innerHTML = "";
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.type = "button";
      btn.textContent = opt.text;
      btn.dataset.optionId = String(opt.id ?? opt.text);
      btn.addEventListener("click", () => {
        if (phase !== "answering") return;
        optsContainer.querySelectorAll(".quiz-option").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        submit.classList.remove("disabled");
        submit.removeAttribute("disabled");
        updateProgress();
      });
      optsContainer.appendChild(btn);
    });

    updateProgress();

    submit.textContent = "Kirim Jawaban";
    submit.classList.add("disabled");
    submit.setAttribute("disabled", "");
  }

  async function showResultsPage() {
    const total = QUIZ.length;
    const correct = answers.reduce((c, a, i) => {
      const q = QUIZ[i];
      const correctOpt = getCorrectOption(q);
      return c + (a === (correctOpt?.text || ""));
    }, 0);

    const card = document.querySelector(".quiz-card");
    card.style.display = "none";
    const results = document.createElement("div");
    results.className = "quiz-results-page card";
    results.innerHTML = `
      <div class="quiz-results-content center">
        <div class="quiz-results-grid">
          <div class="quiz-results-chart-wrapper">
            <canvas id="quiz-results-chart" width="220" height="220"></canvas>
          </div>
          <div>
            <h3 class="quiz-results-title">Skor Anda</h3>
            <div class="quiz-results-topic">${document.querySelector('.quiz-title')?.textContent || ''}</div>
            <div class="quiz-results-stats">${correct} Benar dari ${total}</div>
            <div class="quiz-results-actions">
              <button class="btn btn-primary" id="restart-quiz">Mulai Lagi</button>
              <button class="btn" id="back-topic">Kembali ke Topik</button>
            </div>
          </div>
        </div>
      </div>
    `;

    card.parentElement.appendChild(results);

    try {
      const { markQuizCompleted } = await import("../../utils/quizProgress.js");
      markQuizCompleted(quiz.id || "");
      window.dispatchEvent(new CustomEvent("quiz:completed", { detail: { id: quiz.id } }));
    } catch (e) {}

    (async function initResultsChart() {
      try {
        const Chart = window.Chart;
        if (!Chart) {
          console.warn("[QUIZ] Chart.js missing; ensure CDN script loaded");
          return;
        }
        const canvas = results.querySelector("#quiz-results-chart");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        const greenGradient = (() => {
          const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          g.addColorStop(0, "#4ee1a1");
          g.addColorStop(1, "#2abf8f");
          return g;
        })();

        const redGradient = (() => {
          const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          g.addColorStop(0, "#ff7a7a");
          g.addColorStop(1, "#ff4d6d");
          return g;
        })();

        new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Benar", "Salah"],
            datasets: [
              {
                data: [correct, total - correct],
                backgroundColor: [greenGradient, redGradient],
                borderWidth: 0,
                hoverOffset: 14,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",
            plugins: { legend: { position: "bottom" } },
          },
        });
      } catch (err) {
        console.warn("[QUIZ] Chart init failed", err);
      }
    })();

    clearFeedbackArea();

    results.querySelector("#restart-quiz").addEventListener("click", () => {
      results.remove();
      card.style.display = "";
      idx = 0;
      for (let i = 0; i < answers.length; i++) answers[i] = null;
      clearFeedbackArea();
      renderQuestion();
    });
    results.querySelector("#back-topic").addEventListener("click", () => {
      window.history.back();
    });
  }

  function showSummary() {
    const wrongs = [];
    for (let i = 0; i < QUIZ.length; i++) {
      const correctOpt = getCorrectOption(QUIZ[i]);
      if (answers[i] !== (correctOpt?.text || "")) wrongs.push(i);
    }

    const res = document.createElement("div");
    res.className = "quiz-result text-gray";
    res.style.marginTop = ".8rem";

    if (wrongs.length > 0) {
      const summary = document.createElement("div");
      summary.className = "quiz-explanations-summary";
      wrongs.forEach((i) => {
        const item = document.createElement("div");
        const correctOpt = getCorrectOption(QUIZ[i]);
        item.className = "explanation-item";
        item.innerHTML = `<strong>Soal ${i + 1} - Jawaban benar: ${correctOpt?.text || '-'} </strong><div class="explanation-text">${QUIZ[i].explanation || "Penjelasan belum tersedia."}</div>`;
        summary.appendChild(item);
      });
      res.appendChild(summary);
    } else {
      const ok = document.createElement("div");
      ok.className = "text-gray";
      ok.style.marginTop = ".6rem";
      ok.textContent = "Semua jawaban benar. Bagus!";
      res.appendChild(ok);
    }

    submit.parentElement.appendChild(res);
    progressBar.style.width = "100%";
    try {
      progressBar.style.background = "#4ee1a1";
      progressBar.style.boxShadow = "none";
    } catch (e) {}
  }

  submit.addEventListener("click", () => {
    const selectedBtn = optsContainer.querySelector(".quiz-option.selected");
    if (phase === "answering") {
      if (!selectedBtn) {
        alert("Pilih jawaban dulu.");
        return;
      }
      const selectedId = selectedBtn.dataset.optionId;
      const current = QUIZ[idx];
      const selectedOpt = current.options.find((o) => String(o.id ?? o.text) === selectedId) || { text: selectedBtn.textContent.trim(), isCorrect: false };

      const isCorrect = !!selectedOpt.isCorrect;
      answers[idx] = selectedOpt.text;

      optsContainer.querySelectorAll(".quiz-option").forEach((b) => (b.disabled = true));

      if (isCorrect) {
        const fb = document.createElement("div");
        fb.className = "quiz-feedback text-gray";
        fb.style.marginTop = ".5rem";
        fb.style.color = "var(--accent-secondary)";
        fb.textContent = "Benar!";
        submit.parentElement.insertBefore(fb, submit);

        submit.textContent = "Selanjutnya";
        submit.classList.remove("disabled");
        submit.removeAttribute("disabled");
        phase = "evaluated";
        return;
      }

      const correctOpt = getCorrectOption(current);
      if (explBox) {
        if (explText) explText.textContent = current.explanation || correctOpt?.text || "Penjelasan belum tersedia.";
        explBox.classList.add("show");
        explBox.setAttribute("aria-hidden", "false");
      }

      submit.textContent = "Selanjutnya";
      submit.classList.remove("disabled");
      submit.removeAttribute("disabled");
      phase = "evaluated";
      return;
    }

    if (phase === "evaluated") {
      if (idx < QUIZ.length - 1) {
        idx++;
        renderQuestion();
        return;
      }

      showResultsPage();
      return;
    }
  });

  renderQuestion();
}
