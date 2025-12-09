import db from "../config/db.js";

export class UserCourseModel {
  // Get user's enrolled courses
  static async getUserCourses(userId) {
    const query = `
      SELECT DISTINCT s.*, 
             u.name as teacher_name,
             CASE WHEN uc.user_id IS NOT NULL THEN 1 ELSE 0 END as is_enrolled
      FROM subjects s
      LEFT JOIN users u ON s.teacher_id = u.id
      LEFT JOIN user_courses uc ON s.id = uc.course_id AND uc.user_id = ?
      WHERE uc.user_id = ?
      ORDER BY s.created_at DESC
    `;
    const [rows] = await db.query(query, [userId, userId]);
    return rows;
  }

  // Get all available courses (not enrolled by user)
  static async getAvailableCourses(userId) {
    const query = `
      SELECT s.*, 
             u.name as teacher_name,
             0 as is_enrolled
      FROM subjects s
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.id NOT IN (
        SELECT course_id FROM user_courses WHERE user_id = ?
      )
      ORDER BY s.created_at DESC
    `;
    const [rows] = await db.query(query, [userId]);
    return rows;
  }

  // Enroll user in course
  static async enrollCourse(userId, subjectId) {
    const query = `
      INSERT INTO user_courses (user_id, course_id, enrolled_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE enrolled_at = NOW()
    `;
    const [result] = await db.query(query, [userId, subjectId]);
    return result;
  }

  // Unenroll user from course
  static async unenrollCourse(userId, subjectId) {
    const query = `DELETE FROM user_courses WHERE user_id = ? AND course_id = ?`;
    const [result] = await db.query(query, [userId, subjectId]);
    return result;
  }

  // Check if user is enrolled
  static async isEnrolled(userId, subjectId) {
    const query = `SELECT 1 FROM user_courses WHERE user_id = ? AND course_id = ?`;
    const [rows] = await db.query(query, [userId, subjectId]);
    return rows.length > 0;
  }

  // Get course stats for user
  static async getCourseStats(userId, subjectId) {
    const query = `
      SELECT 
        COUNT(DISTINCT m.id) as total_materials,
        COUNT(DISTINCT q.id) as total_quizzes,
        COUNT(DISTINCT CASE WHEN qr.quiz_id IS NOT NULL THEN qr.quiz_id END) as completed_quizzes,
        AVG(CASE WHEN qr.quiz_id IS NOT NULL THEN qr.score ELSE NULL END) as avg_quiz_score
      FROM subjects s
      LEFT JOIN materials m ON s.id = m.course_id
      LEFT JOIN quizzes q ON s.id = q.course_id
      LEFT JOIN quiz_results qr ON q.id = qr.quiz_id AND qr.user_id = ?
      WHERE s.id = ?
    `;
    const [rows] = await db.query(query, [userId, subjectId]);
    return rows[0];
  }
}
