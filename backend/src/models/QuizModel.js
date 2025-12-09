import db from "../config/db.js";

export const QuizModel = {
  // Get all quizzes for a course (subject)
  async getBySubject(courseId) {
    const [rows] = await db.query(`
      SELECT 
        q.*,
        u.name as created_by_name
      FROM quizzes q
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.course_id = ?
      ORDER BY q.created_at DESC
    `, [courseId]);
    return rows;
  },

  // Get single quiz
  async getById(id) {
    const [rows] = await db.query(`
      SELECT 
        q.*,
        u.name as created_by_name
      FROM quizzes q
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.id = ?
    `, [id]);
    return rows[0] || null;
  },

  // Get quiz with questions
  async getWithQuestions(id) {
    const quiz = await this.getById(id);
    if (!quiz) return null;

    const [questions] = await db.query(`
      SELECT *
      FROM questions
      WHERE quiz_id = ?
      ORDER BY id ASC
    `, [id]);

    return { ...quiz, questions };
  },

  // Create quiz
  async create(data) {
    const { title, description, course_id, passing_score, duration, created_by } = data;
    const [result] = await db.query(
      `INSERT INTO quizzes 
       (title, description, course_id, passing_score, duration, created_by, is_published)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [title, description, course_id, passing_score || 70, duration || 60, created_by]
    );
    return { id: result.insertId, ...data };
  },

  // Update quiz
  async update(id, data) {
    const { title, description, passing_score, duration, is_published } = data;
    await db.query(
      `UPDATE quizzes 
       SET title = ?, description = ?, passing_score = ?, duration = ?, is_published = ?
       WHERE id = ?`,
      [title, description, passing_score, duration, is_published ? 1 : 0, id]
    );
    return this.getById(id);
  },

  // Delete quiz
  async delete(id) {
    await db.query("DELETE FROM quizzes WHERE quiz_id = ?", [id]);
    return true;
  }
};
