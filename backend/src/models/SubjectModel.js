import db from "../config/db.js";

export const SubjectModel = {
  // Get all subjects with teacher info
  async getAll() {
    const [rows] = await db.query(`
      SELECT 
        s.id,
        s.name,
        s.description,
        s.teacher_id,
        u.name as teacher_name,
        COUNT(DISTINCT uc.user_id) as enrolled_count,
        COUNT(DISTINCT m.id) as material_count,
        COUNT(DISTINCT q.id) as quiz_count
      FROM subjects s
      LEFT JOIN users u ON s.teacher_id = u.id
      LEFT JOIN user_courses uc ON s.id = uc.course_id
      LEFT JOIN materials m ON s.id = m.course_id
      LEFT JOIN quizzes q ON s.id = q.course_id
      GROUP BY s.id
      ORDER BY s.name
    `);
    return rows;
  },

  // Get single subject
  async getById(id) {
    const [rows] = await db.query(`
      `SELECT 
        s.*,
        u.full_name as teacher_name,
        u.email as teacher_email
        COUNT(DISTINCT uc.user_id) as total_enrolled,
        COUNT(DISTINCT m.id) as material_count,
        COUNT(DISTINCT q.id) as quiz_count
      FROM subjects s
      LEFT JOIN users u ON s.teacher_id = u.id
      LEFT JOIN user_courses uc ON s.id = uc.course_id
      LEFT JOIN materials m ON s.id = m.course_id
      LEFT JOIN quizzes q ON s.id = q.course_id
      WHERE s.id = ?
      GROUP BY s.id
    `, [id]);
    return rows[0] || null;
  },

  // Get subjects by teacher
  async getByTeacher(teacherId) {
    const [rows] = await db.query(`
      SELECT 
        s.*,
        COUNT(DISTINCT uc.user_id) as total_enrolled
      FROM subjects s
      LEFT JOIN user_courses uc ON s.id = uc.course_id
      WHERE s.teacher_id = ?
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `, [teacherId]);
    return rows;
  },

  // Create new subject
  async create(data) {
    const { name, description, teacher_id } = data;
    const [result] = await db.query(
      `INSERT INTO subjects (name, description, teacher_id)
       VALUES (?, ?, ?)`,
      [name, description, teacher_id]
    );
    return { id: result.insertId, ...data };
  },

  // Update subject
  async update(id, data) {
    const { name, description } = data;
    await db.query(
      `UPDATE subjects 
       SET name = ?, description = ?
       WHERE id = ?`,
      [name, description, id]
    );
    return this.getById(id);
  },

  // Delete subject
  async delete(id) {
    await db.query(`DELETE FROM subjects WHERE id = ?`, [id]);
    return true;
  },

  // Get subject by name search
  async search(keyword) {
    const [rows] = await db.query(`
      SELECT s.*, u.name as teacher_name
      FROM subjects s
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.name LIKE ?
      ORDER BY s.name
    `, [`%${keyword}%`]);
    return rows;
  }
};
