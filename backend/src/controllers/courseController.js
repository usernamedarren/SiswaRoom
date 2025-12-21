import db from "../config/db.js";
import { UserCourseModel } from "../models/UserCourseModel.js";

// GET /api/courses - Get user's enrolled courses
export async function getUserCourses(req, res, next) {
  try {
    const { id: user_id } = req.user;
    
    const [courses] = await db.query(
      `SELECT s.*, u.full_name as teacher_name
       FROM subjects s
       LEFT JOIN users u ON s.teacher_id = u.id
       WHERE s.id IN (
         SELECT course_id FROM user_courses WHERE user_id = ? AND status = 'active'
       )
       ORDER BY s.name ASC`,
      [user_id]
    );
    
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

// GET /api/courses/available - Get available courses for enrollment
export async function getAvailableCourses(req, res, next) {
  try {
    const { id: user_id } = req.user;
    const { search = "" } = req.query;

    let query = `
      SELECT s.*, 
             u.full_name as teacher_name,
             COUNT(DISTINCT m.id) as total_materials,
             COUNT(DISTINCT q.id) as total_quizzes,
             (CASE WHEN uc.user_id IS NOT NULL THEN 1 ELSE 0 END) as is_enrolled
      FROM subjects s
      LEFT JOIN users u ON s.teacher_id = u.id
      LEFT JOIN materials m ON s.id = m.course_id
      LEFT JOIN quizzes q ON s.id = q.course_id
      LEFT JOIN user_courses uc ON s.id = uc.course_id AND uc.user_id = ?
      WHERE 1=1
    `;
    const params = [user_id];

    if (search) {
      query += ` AND s.name LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY s.id ORDER BY s.name ASC`;

    const [courses] = await db.query(query, params);
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

// POST /api/courses/:id/enroll - Enroll user in course
export async function enrollCourse(req, res, next) {
  try {
    const { id: courseId } = req.params;
    const { id: user_id } = req.user;

    // Check if course exists
    const [courses] = await db.query("SELECT id FROM subjects WHERE id = ?", [courseId]);

    if (!courses[0]) {
      return res.status(404).json({ message: "Mata pelajaran tidak ditemukan" });
    }

    // Check if already enrolled
    const [enrolled] = await db.query(
      "SELECT id FROM user_courses WHERE user_id = ? AND course_id = ?",
      [user_id, courseId]
    );

    if (enrolled[0]) {
      return res.status(400).json({ message: "Anda sudah terdaftar di mata pelajaran ini" });
    }

    // Enroll user
    await db.query(
      "INSERT INTO user_courses (user_id, course_id, status) VALUES (?, ?, 'active')",
      [user_id, courseId]
    );

    res.status(201).json({
      success: true,
      message: "Berhasil mendaftar mata pelajaran"
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/courses/:id/unenroll - Unenroll from course
export async function unenrollCourse(req, res, next) {
  try {
    const { id: courseId } = req.params;
    const { id: user_id } = req.user;

    const [result] = await db.query(
      "DELETE FROM user_courses WHERE user_id = ? AND course_id = ?",
      [user_id, courseId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Anda tidak terdaftar di mata pelajaran ini" });
    }

    res.json({
      success: true,
      message: "Berhasil batal dari mata pelajaran"
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/courses/:id - Get course details
export async function getCourseDetail(req, res, next) {
  try {
    const { id: subjectId } = req.params;
    const user_id = req.user.id;

    // Get course info
    const [courses] = await db.query(
      `SELECT s.*, u.full_name as teacher_name, u.email as teacher_email
       FROM subjects s
       LEFT JOIN users u ON s.teacher_id = u.id
       WHERE s.id = ?`,
      [subjectId]
    );

    if (!courses[0]) {
      return res.status(404).json({ message: "Kursus tidak ditemukan" });
    }

    const course = courses[0];

    // Check if user is enrolled
    course.is_enrolled = await UserCourseModel.isEnrolled(user_id, subjectId);

    // Get course stats
    const stats = await UserCourseModel.getCourseStats(user_id, subjectId);
    course.stats = stats;

    // Get materials if enrolled
    if (course.is_enrolled) {
      const [materials] = await db.query(
        `SELECT * FROM materials WHERE course_id = ? ORDER BY id ASC`,
        [subjectId]
      );
      course.materials = materials;

      // Get quizzes with question count
      const [quizzes] = await db.query(
        `SELECT q.*, COUNT(DISTINCT qs.id) as question_count
         FROM quizzes q
         LEFT JOIN questions qs ON q.id = qs.quiz_id
         WHERE q.course_id = ?
         GROUP BY q.id`,
        [subjectId]
      );
      course.quizzes = quizzes;
    }

    res.json(course);
  } catch (err) {
    next(err);
  }
}

// GET /api/courses/:id/schedules - Get schedules for a course
export async function getCourseSchedules(req, res, next) {
  try {
    const { id: subjectId } = req.params;
    const user_id = req.user.id;

    // Check if user is enrolled
    const isEnrolled = await UserCourseModel.isEnrolled(user_id, subjectId);
    if (!isEnrolled) {
      return res.status(403).json({ message: "Anda tidak terdaftar di kursus ini" });
    }

    const [schedules] = await db.query(
      `SELECT s.*, 
              u.name as teacher_name
       FROM schedules s
       LEFT JOIN users u ON s.teacher_id = u.id
       WHERE s.subject_id = ?
       ORDER BY FIELD(s.day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), s.start_time ASC`,
      [subjectId]
    );

    res.json(schedules);
  } catch (err) {
    next(err);
  }
}
