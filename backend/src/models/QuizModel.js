import db from "../config/db.js";

export const QuizModel = {
  // Get all quizzes for a subject
  async getBySubject(subjectId) {
    const [rows] = await db.query(`
      SELECT 
        q.*,
        u.name as created_by_name,
        COUNT(DISTINCT qq.question_id) as total_questions,
        COUNT(DISTINCT qr.result_id) as times_taken
      FROM quizzes q
      LEFT JOIN users u ON q.created_by = u.user_id
      LEFT JOIN quiz_questions qq ON q.quiz_id = qq.quiz_id
      LEFT JOIN quiz_results qr ON q.quiz_id = qr.quiz_id
      WHERE q.subject_id = ?
      GROUP BY q.quiz_id
      ORDER BY q.created_at DESC
    `, [subjectId]);
    return rows;
  },

  // Get single quiz
  async getById(id) {
    const [rows] = await db.query(`
      SELECT 
        q.*,
        u.name as created_by_name,
        COUNT(DISTINCT qq.question_id) as total_questions
      FROM quizzes q
      LEFT JOIN users u ON q.created_by = u.user_id
      LEFT JOIN quiz_questions qq ON q.quiz_id = qq.quiz_id
      WHERE q.quiz_id = ?
      GROUP BY q.quiz_id
    `, [id]);
    return rows[0] || null;
  },

  // Get quiz with questions
  async getWithQuestions(id) {
    const quiz = await this.getById(id);
    if (!quiz) return null;

    const [questions] = await db.query(`
      SELECT q.*
      FROM questions q
      INNER JOIN quiz_questions qq ON q.question_id = qq.question_id
      WHERE qq.quiz_id = ?
      ORDER BY qq.question_order ASC
    `, [id]);

    return { ...quiz, questions };
  },

  // Create quiz
  async create(data) {
    const { title, description, subject_id, passing_score, time_limit, created_by } = data;
    const [result] = await db.query(
      `INSERT INTO quizzes 
       (title, description, subject_id, passing_score, time_limit, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, subject_id, passing_score || 70, time_limit || 60, created_by]
    );
    return { quiz_id: result.insertId, ...data };
  },

  // Update quiz
  async update(id, data) {
    const { title, description, passing_score, time_limit } = data;
    await db.query(
      `UPDATE quizzes 
       SET title = ?, description = ?, passing_score = ?, time_limit = ?
       WHERE quiz_id = ?`,
      [title, description, passing_score, time_limit, id]
    );
    return this.getById(id);
  },

  // Add question to quiz
  async addQuestion(quizId, questionId, order) {
    await db.query(
      `INSERT INTO quiz_questions (quiz_id, question_id, question_order)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE question_order = ?`,
      [quizId, questionId, order, order]
    );
    return true;
  },

  // Remove question from quiz
  async removeQuestion(quizId, questionId) {
    await db.query(
      `DELETE FROM quiz_questions WHERE quiz_id = ? AND question_id = ?`,
      [quizId, questionId]
    );
    return true;
  },

  // Delete quiz
  async delete(id) {
    await db.query("DELETE FROM quizzes WHERE quiz_id = ?", [id]);
    return true;
  }
};
