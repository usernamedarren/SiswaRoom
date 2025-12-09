import db from "../config/db.js";

// GET /api/questions - Get all questions with filters
export async function getQuestions(req, res, next) {
  try {
    const { limit = 10 } = req.query;
    const query = "SELECT * FROM questions ORDER BY id ASC LIMIT ?";
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
      "SELECT * FROM questions WHERE id = ?",
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

// GET /api/quizzes/:quiz_id/questions - Get questions for a quiz
export async function getQuizQuestions(req, res, next) {
  try {
    const { quiz_id } = req.params;
    const { limit = 50 } = req.query;

    const [rows] = await db.query(
      `SELECT *
       FROM questions
       WHERE quiz_id = ?
       ORDER BY id ASC
       LIMIT ?`,
      [quiz_id, parseInt(limit)]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// POST /api/questions - Create question
export async function createQuestion(req, res, next) {
  try {
    const { quiz_id, question_text, question_type, points } = req.body;

    if (!quiz_id || !question_text || !question_type) {
      return res.status(400).json({ message: "quiz_id, question_text, dan question_type wajib diisi" });
    }

    const [result] = await db.query(
      `INSERT INTO questions (quiz_id, question_text, question_type, points)
       VALUES (?, ?, ?, ?)`,
      [quiz_id, question_text, question_type, points || 10]
    );

    res.status(201).json({ id: result.insertId, message: "Soal berhasil dibuat" });
  } catch (err) {
    next(err);
  }
}

// PUT /api/questions/:id - Update question
export async function updateQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const { question_text, question_type, points } = req.body;

    const [result] = await db.query(
      `UPDATE questions 
       SET question_text = ?, question_type = ?, points = ?
       WHERE id = ?`,
      [question_text, question_type, points, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Soal tidak ditemukan" });
    }

    res.json({ message: "Soal berhasil diperbarui" });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/questions/:id - Delete question
export async function deleteQuestion(req, res, next) {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM questions WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Soal tidak ditemukan" });
    }

    res.json({ message: "Soal berhasil dihapus" });
  } catch (err) {
    next(err);
  }
}
