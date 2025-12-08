import db from "../config/db.js";

export const QuestionModel = {
  // Get all questions for a subject
  async getBySubject(subjectId) {
    const [rows] = await db.query(`
      SELECT 
        q.*,
        u.name as created_by_name
      FROM questions q
      LEFT JOIN users u ON q.created_by = u.user_id
      WHERE q.subject_id = ?
      ORDER BY q.question_id DESC
    `, [subjectId]);
    return rows;
  },

  // Get questions by material
  async getByMaterial(materialId) {
    const [rows] = await db.query(`
      SELECT 
        q.*,
        u.name as created_by_name
      FROM questions q
      LEFT JOIN users u ON q.created_by = u.user_id
      WHERE q.material_id = ?
      ORDER BY q.question_id DESC
    `, [materialId]);
    return rows;
  },

  // Get single question
  async getById(id) {
    const [rows] = await db.query(`
      SELECT 
        q.*,
        u.name as created_by_name
      FROM questions q
      LEFT JOIN users u ON q.created_by = u.user_id
      WHERE q.question_id = ?
    `, [id]);
    return rows[0] || null;
  },

  // Get questions by difficulty
  async getByDifficulty(subjectId, difficulty) {
    const [rows] = await db.query(`
      SELECT * FROM questions
      WHERE subject_id = ? AND difficulty = ?
      ORDER BY question_id DESC
    `, [subjectId, difficulty]);
    return rows;
  },

  // Create question
  async create(data) {
    const { subject_id, material_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, created_by } = data;
    const [result] = await db.query(
      `INSERT INTO questions 
       (subject_id, material_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [subject_id, material_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, created_by]
    );
    return { question_id: result.insertId, ...data };
  },

  // Update question
  async update(id, data) {
    const { question_text, option_a, option_b, option_c, option_d, correct_option, difficulty } = data;
    await db.query(
      `UPDATE questions 
       SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_option = ?, difficulty = ?
       WHERE question_id = ?`,
      [question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, id]
    );
    return this.getById(id);
  },

  // Delete question
  async delete(id) {
    await db.query("DELETE FROM questions WHERE question_id = ?", [id]);
    return true;
  }
};
