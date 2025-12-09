import db from "../config/db.js";

export const UserModel = {
  async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0] || null;
  },

  async create({ name, email, passwordHash, role = "student" }) {
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, passwordHash, role]
    );
    return { id: result.insertId, name, email, role };
  },

  // Get all users
  async getAll(filter = {}) {
    let query = "SELECT id, name, email, role, created_at FROM users";
    const params = [];

    if (filter.role) {
      query += " WHERE role = ?";
      params.push(filter.role);
    }

    query += " ORDER BY created_at DESC";
    const [rows] = await db.query(query, params);
    return rows;
  },

  // Get all teachers
  async getTeachers() {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email,
              COUNT(DISTINCT s.id) as total_courses
       FROM users u
       LEFT JOIN subjects s ON u.id = s.teacher_id
       WHERE u.role = 'teacher'
       GROUP BY u.id
       ORDER BY u.name`
    );
    return rows;
  },

  // Get user with profile
  async getUserProfile(id) {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.role,
              COUNT(DISTINCT s.id) as total_courses,
              COUNT(DISTINCT qr.result_id) as total_quizzes_taken
       FROM users u
       LEFT JOIN subjects s ON u.id = s.teacher_id
       LEFT JOIN quiz_results qr ON u.id = qr.user_id
       WHERE u.id = ?
       GROUP BY u.id`,
      [id]
    );
    return rows[0] || null;
  },

  // Get student's enrolled courses
  async getStudentCourses(studentId) {
    const [rows] = await db.query(
      `SELECT DISTINCT s.*
       FROM subjects s
       INNER JOIN user_courses uc ON s.id = uc.course_id
       WHERE uc.user_id = ?
       ORDER BY s.name`,
      [studentId]
    );
    return rows;
  },

  // Update user
  async update(id, data) {
    const { name, email } = data;
    await db.query(
      `UPDATE users SET name = ?, email = ?
       WHERE id = ?`,
      [name, email, id]
    );
    return this.findById(id);
  }
};
