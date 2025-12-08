import db from "../config/db.js";

// GET /api/questions - Get all questions with filters
export async function getQuestions(req, res, next) {
  try {
    const { limit = 10 } = req.query;
    const query = "SELECT question_id, question, answer FROM questions ORDER BY question_id ASC LIMIT ?";
    const params = [parseInt(limit)];

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/questions/:id - Get single question
export async function getQuestionById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM questions WHERE question_id = ?",
      [id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Soal tidak ditemukan" });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// GET /api/subjects/:subject_id/questions
export async function getSubjectQuestions(req, res, next) {
  try {
    const { subject_id } = req.params;
    const { limit = 20 } = req.query;

    // Pull questions linked to quizzes of this subject
    const [rows] = await db.query(
      `SELECT q.question_id, q.question AS question_text, q.answer
       FROM questions q
       JOIN quiz_questions qq ON q.question_id = qq.question_id
       JOIN quizzes qu ON qq.quiz_id = qu.quiz_id
       WHERE qu.subject_id = ?
       ORDER BY RAND()
       LIMIT ?`,
      [subject_id, parseInt(limit)]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}
