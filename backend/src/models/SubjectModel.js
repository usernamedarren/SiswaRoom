import db from "../config/db.js";

export const SubjectModel = {
  // Get all subjects with teacher info
  async getAll() {
    const [rows] = await db.query(`
      SELECT 
        s.subject_id,
        s.name,
        s.description,
        s.category,
        s.level,
        s.thumbnail_url,
        s.teacher_id,
        s.price,
        s.max_students,
        u.name as teacher_name,
        COUNT(DISTINCT cs.schedule_id) as enrolled_students,
        COUNT(DISTINCT m.material_id) as material_count,
        COUNT(DISTINCT q.quiz_id) as quiz_count
      FROM subjects s
      LEFT JOIN users u ON s.teacher_id = u.user_id
      LEFT JOIN class_schedule cs ON s.subject_id = cs.subject_id
      LEFT JOIN class_students css ON cs.schedule_id = css.schedule_id
      LEFT JOIN materials m ON s.subject_id = m.subject_id
      LEFT JOIN quizzes q ON s.subject_id = q.subject_id
      GROUP BY s.subject_id
      ORDER BY s.name
    `);
    return rows;
  },

  // Get single subject
  async getById(id) {
    const [rows] = await db.query(`
      SELECT 
        s.*,
        u.name as teacher_name,
        u.email as teacher_email,
        COUNT(DISTINCT css.user_id) as total_enrolled,
        COUNT(DISTINCT m.material_id) as material_count,
        COUNT(DISTINCT q.quiz_id) as quiz_count
      FROM subjects s
      LEFT JOIN users u ON s.teacher_id = u.user_id
      LEFT JOIN class_schedule cs ON s.subject_id = cs.subject_id
      LEFT JOIN class_students css ON cs.schedule_id = css.schedule_id
      LEFT JOIN materials m ON s.subject_id = m.subject_id
      LEFT JOIN quizzes q ON s.subject_id = q.subject_id
      WHERE s.subject_id = ?
      GROUP BY s.subject_id
    `, [id]);
    return rows[0] || null;
  },

  // Get subjects by teacher
  async getByTeacher(teacherId) {
    const [rows] = await db.query(`
      SELECT 
        s.*,
        COUNT(DISTINCT css.user_id) as total_enrolled
      FROM subjects s
      LEFT JOIN class_schedule cs ON s.subject_id = cs.subject_id
      LEFT JOIN class_students css ON cs.schedule_id = css.schedule_id
      WHERE s.teacher_id = ?
      GROUP BY s.subject_id
      ORDER BY s.created_at DESC
    `, [teacherId]);
    return rows;
  },

  // Create new subject
  async create(data) {
    const { name, description, category, level, teacher_id, price, max_students } = data;
    const [result] = await db.query(
      `INSERT INTO subjects (name, description, category, level, teacher_id, price, max_students)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, category, level, teacher_id, price, max_students]
    );
    return { subject_id: result.insertId, ...data };
  },

  // Update subject
  async update(id, data) {
    const { name, description, category, level, price, max_students } = data;
    await db.query(
      `UPDATE subjects 
       SET name = ?, description = ?, category = ?, level = ?, price = ?, max_students = ?
       WHERE subject_id = ?`,
      [name, description, category, level, price, max_students, id]
    );
    return this.getById(id);
  },

  // Get subjects by category
  async getByCategory(category) {
    const [rows] = await db.query(`
      SELECT s.*, u.name as teacher_name
      FROM subjects s
      LEFT JOIN users u ON s.teacher_id = u.user_id
      WHERE s.category = ?
      ORDER BY s.name
    `, [category]);
    return rows;
  },

  // Get all categories
  async getCategories() {
    const [rows] = await db.query(
      `SELECT DISTINCT category FROM subjects ORDER BY category`
    );
    return rows.map(r => r.category);
  }
};
