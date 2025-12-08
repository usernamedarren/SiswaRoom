import db from "../config/db.js";

export const UserModel = {
  async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [id]);
    return rows[0] || null;
  },

  async create({ name, email, passwordHash, role = "student" }) {
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, passwordHash, role]
    );
    return { user_id: result.insertId, name, email, role };
  },

  // Get all users
  async getAll(filter = {}) {
    let query = "SELECT user_id, name, email, role, created_at FROM users";
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
      `SELECT u.user_id, u.name, u.email, u.bio,
              COUNT(DISTINCT s.subject_id) as total_courses,
              COUNT(DISTINCT cs.schedule_id) as total_classes
       FROM users u
       LEFT JOIN subjects s ON u.user_id = s.teacher_id
       LEFT JOIN class_schedule cs ON u.user_id = cs.teacher_id
       WHERE u.role = 'teacher'
       GROUP BY u.user_id
       ORDER BY u.name`
    );
    return rows;
  },

  // Get user with profile
  async getUserProfile(id) {
    const [rows] = await db.query(
      `SELECT u.*, 
              COUNT(DISTINCT s.subject_id) as total_courses,
              COUNT(DISTINCT cs.schedule_id) as total_classes,
              COUNT(DISTINCT qr.result_id) as total_quizzes_taken
       FROM users u
       LEFT JOIN subjects s ON u.user_id = s.teacher_id
       LEFT JOIN class_schedule cs ON u.user_id = cs.teacher_id
       LEFT JOIN quiz_results qr ON u.user_id = qr.user_id
       WHERE u.user_id = ?
       GROUP BY u.user_id`,
      [id]
    );
    return rows[0] || null;
  },

  // Get student's enrolled courses
  async getStudentCourses(studentId) {
    const [rows] = await db.query(
      `SELECT DISTINCT s.* FROM subjects s
       INNER JOIN class_schedule cs ON s.subject_id = cs.subject_id
       INNER JOIN class_students css ON cs.schedule_id = css.schedule_id
       WHERE css.user_id = ?
       ORDER BY s.name`,
      [studentId]
    );
    return rows;
  },

  // Update user
  async update(id, data) {
    const { name, email, bio, profile_picture } = data;
    await db.query(
      `UPDATE users SET name = ?, email = ?, bio = ?, profile_picture = ?
       WHERE user_id = ?`,
      [name, email, bio, profile_picture, id]
    );
    return this.findById(id);
  }
};
