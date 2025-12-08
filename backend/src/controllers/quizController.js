import db from "../config/db.js";

// GET /api/quizzes - Get all quizzes
export async function getQuizzes(req, res, next) {
  try {
    const { subject_id } = req.query;
    let query = `
      SELECT 
        q.*,
        s.name as subject_name,
        COUNT(DISTINCT qq.question_id) as question_count
      FROM quizzes q
      LEFT JOIN subjects s ON q.subject_id = s.subject_id
      LEFT JOIN quiz_questions qq ON q.quiz_id = qq.quiz_id
      WHERE 1=1
    `;
    const params = [];

    if (subject_id) {
      query += " AND q.subject_id = ?";
      params.push(subject_id);
    }

    query += " GROUP BY q.quiz_id ORDER BY q.quiz_id DESC";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/quizzes/:id - Get quiz detail with questions
export async function getQuizDetail(req, res, next) {
  try {
    const { id } = req.params;

    // Get quiz info
    const [quizzes] = await db.query(
      "SELECT * FROM quizzes WHERE quiz_id = ?",
      [id]
    );

    if (!quizzes[0]) {
      return res.status(404).json({ message: "Quiz tidak ditemukan" });
    }

    // Get questions in quiz
    const [questions] = await db.query(
      `SELECT q.question_id, q.question_text, q.option_a, q.option_b, 
              q.option_c, q.option_d, q.difficulty
       FROM questions q
       JOIN quiz_questions qq ON q.question_id = qq.question_id
       WHERE qq.quiz_id = ?
       ORDER BY qq.question_id ASC`,
      [id]
    );

    const quiz = quizzes[0];
    quiz.questions = questions;

    res.json(quiz);
  } catch (err) {
    next(err);
  }
}

// POST /api/quizzes/:id/start - Start quiz attempt
export async function startQuiz(req, res, next) {
  try {
    const { id } = req.params;
    const { user_id } = req.user;

    // Validate quiz exists
    const [quizzes] = await db.query(
      "SELECT quiz_id FROM quizzes WHERE quiz_id = ?",
      [id]
    );

    if (!quizzes[0]) {
      return res.status(404).json({ message: "Quiz tidak ditemukan" });
    }

    // Create quiz result
    const [result] = await db.query(
      `INSERT INTO quiz_results (quiz_id, user_id, score, started_at, finished_at)
       VALUES (?, ?, 0, NOW(), NULL)`,
      [id, user_id]
    );

    res.status(201).json({
      result_id: result.insertId,
      quiz_id: id,
      user_id,
      started_at: new Date(),
      message: "Quiz dimulai"
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/quiz-results/:result_id/submit - Submit quiz answers
export async function submitQuiz(req, res, next) {
  try {
    const { result_id } = req.params;
    const { answers } = req.body; // Array of {question_id, selected_option}
    const { user_id } = req.user;

    // Validate result exists
    const [results] = await db.query(
      "SELECT * FROM quiz_results WHERE result_id = ? AND user_id = ?",
      [result_id, user_id]
    );

    if (!results[0]) {
      return res.status(404).json({ message: "Quiz result tidak ditemukan" });
    }

    // Check each answer and calculate score
    let score = 0;
    const totalQuestions = answers.length;

    for (const answer of answers) {
      // Get correct answer
      const [questions] = await db.query(
        "SELECT correct_option FROM questions WHERE question_id = ?",
        [answer.question_id]
      );

      if (questions[0]) {
        const isCorrect = answer.selected_option === questions[0].correct_option;

        // Save answer
        await db.query(
          `INSERT INTO quiz_answers (result_id, question_id, selected_option, is_correct)
           VALUES (?, ?, ?, ?)`,
          [result_id, answer.question_id, answer.selected_option, isCorrect ? 1 : 0]
        );

        if (isCorrect) score++;
      }
    }

    // Calculate percentage
    const scorePercentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    // Update quiz result
    await db.query(
      `UPDATE quiz_results 
       SET score = ?, finished_at = NOW()
       WHERE result_id = ?`,
      [scorePercentage, result_id]
    );

    res.json({
      result_id,
      score: scorePercentage,
      correct_answers: score,
      total_questions: totalQuestions,
      message: "Quiz selesai"
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/quiz-results - Get user's quiz results
export async function getUserQuizResults(req, res, next) {
  try {
    const { user_id } = req.user;

    const [results] = await db.query(
      `SELECT qr.result_id, qr.quiz_id, qr.score, qr.started_at, qr.finished_at,
              q.title as quiz_title, s.name as subject_name
       FROM quiz_results qr
       JOIN quizzes q ON qr.quiz_id = q.quiz_id
       JOIN subjects s ON q.subject_id = s.subject_id
       WHERE qr.user_id = ?
       ORDER BY qr.finished_at DESC`,
      [user_id]
    );

    res.json(results);
  } catch (err) {
    next(err);
  }
}

// GET /api/quiz-results/:result_id - Get quiz result detail with answers
export async function getQuizResult(req, res, next) {
  try {
    const { result_id } = req.params;
    const { user_id } = req.user;

    // Get result
    const [results] = await db.query(
      `SELECT * FROM quiz_results WHERE result_id = ? AND user_id = ?`,
      [result_id, user_id]
    );

    if (!results[0]) {
      return res.status(404).json({ message: "Hasil quiz tidak ditemukan" });
    }

    // Get answers detail
    const [answers] = await db.query(
      `SELECT qa.answer_id, qa.question_id, qa.selected_option, qa.is_correct,
              q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option
       FROM quiz_answers qa
       JOIN questions q ON qa.question_id = q.question_id
       WHERE qa.result_id = ?`,
      [result_id]
    );

    const result = results[0];
    result.answers = answers;

    res.json(result);
  } catch (err) {
    next(err);
  }
}
