import db from "../config/db.js";

// GET /api/questions - Get all questions with filters
export async function getQuestions(req, res, next) {
  try {
    const { subject_id, material_id, difficulty, limit = 10 } = req.query;
    let query = "SELECT * FROM questions WHERE 1=1";
    const params = [];

    if (subject_id) {
      query += " AND subject_id = ?";
      params.push(subject_id);
    }

    if (material_id) {
      query += " AND material_id = ?";
      params.push(material_id);
    }

    if (difficulty) {
      query += " AND difficulty = ?";
      params.push(difficulty);
    }

    query += " ORDER BY question_id ASC LIMIT ?";
    params.push(parseInt(limit));

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

    const [rows] = await db.query(
      `SELECT question_id, question_text, option_a, option_b, option_c, option_d, 
              difficulty, material_id
       FROM questions 
       WHERE subject_id = ?
       ORDER BY RAND()
       LIMIT ?`,
      [subject_id, parseInt(limit)]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}
