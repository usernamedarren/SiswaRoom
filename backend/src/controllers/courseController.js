import db from "../config/db.js";
import { UserCourseModel } from "../models/UserCourseModel.js";

// GET /api/courses - Get user's enrolled courses
export async function getUserCourses(req, res, next) {
  try {
    const { user_id } = req.user;
    const courses = await UserCourseModel.getUserCourses(user_id);
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

// GET /api/courses/available - Get available courses for enrollment
export async function getAvailableCourses(req, res, next) {
  try {
    const { user_id } = req.user;
    const { search = "", category = "" } = req.query;

    let query = `
      SELECT s.*, 
             u.name as teacher_name,
             0 as is_enrolled,
             COUNT(DISTINCT m.material_id) as total_materials,
             COUNT(DISTINCT q.quiz_id) as total_quizzes
      FROM subjects s
      LEFT JOIN users u ON s.teacher_id = u.user_id
      LEFT JOIN materials m ON s.subject_id = m.subject_id
      LEFT JOIN quizzes q ON s.subject_id = q.subject_id
      WHERE s.subject_id NOT IN (
        SELECT subject_id FROM user_courses WHERE user_id = ?
      )
    `;
    const params = [user_id];

    if (search) {
      query += ` AND (s.name LIKE ? OR s.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category && category !== "all") {
      query += ` AND s.category = ?`;
      params.push(category);
    }

    query += ` GROUP BY s.subject_id ORDER BY s.created_at DESC`;

    const [courses] = await db.query(query, params);
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

// POST /api/courses/:id/enroll - Enroll user in course
export async function enrollCourse(req, res, next) {
  try {
    const { id: subjectId } = req.params;
    const { user_id } = req.user;

    // Check if course exists
    const [courses] = await db.query(
      "SELECT subject_id FROM subjects WHERE subject_id = ?",
      [subjectId]
    );

    if (!courses[0]) {
      return res.status(404).json({ message: "Kursus tidak ditemukan" });
    }

    // Check if already enrolled
    const isEnrolled = await UserCourseModel.isEnrolled(user_id, subjectId);
    if (isEnrolled) {
      return res.status(400).json({ message: "Anda sudah terdaftar di kursus ini" });
    }

    // Enroll user
    await UserCourseModel.enrollCourse(user_id, subjectId);

    res.status(201).json({
      success: true,
      message: "Berhasil mendaftar kursus",
      subject_id: subjectId
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/courses/:id/unenroll - Unenroll from course
export async function unenrollCourse(req, res, next) {
  try {
    const { id: subjectId } = req.params;
    const { user_id } = req.user;

    // Check if enrolled
    const isEnrolled = await UserCourseModel.isEnrolled(user_id, subjectId);
    if (!isEnrolled) {
      return res.status(400).json({ message: "Anda tidak terdaftar di kursus ini" });
    }

    // Unenroll
    await UserCourseModel.unenrollCourse(user_id, subjectId);

    res.json({
      success: true,
      message: "Berhasil keluar dari kursus"
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/courses/:id - Get course details
export async function getCourseDetail(req, res, next) {
  try {
    const { id: subjectId } = req.params;
    const { user_id } = req.user;

    // Get course info
    const [courses] = await db.query(
      `SELECT s.*, u.name as teacher_name, u.email as teacher_email
       FROM subjects s
       LEFT JOIN users u ON s.teacher_id = u.user_id
       WHERE s.subject_id = ?`,
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
        `SELECT * FROM materials WHERE subject_id = ? ORDER BY \`order\` ASC`,
        [subjectId]
      );
      course.materials = materials;

      // Get quizzes
      const [quizzes] = await db.query(
        `SELECT q.*, COUNT(DISTINCT qq.question_id) as question_count
         FROM quizzes q
         LEFT JOIN quiz_questions qq ON q.quiz_id = qq.quiz_id
         WHERE q.subject_id = ?
         GROUP BY q.quiz_id`,
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
    const { user_id } = req.user;

    // Check if user is enrolled
    const isEnrolled = await UserCourseModel.isEnrolled(user_id, subjectId);
    if (!isEnrolled) {
      return res.status(403).json({ message: "Anda tidak terdaftar di kursus ini" });
    }

    const [schedules] = await db.query(
      `SELECT cs.*, 
              u.name as teacher_name,
              (SELECT COUNT(*) FROM class_students WHERE schedule_id = cs.schedule_id) as total_students,
              (SELECT COUNT(*) FROM class_students WHERE schedule_id = cs.schedule_id AND user_id = ?) as is_joined
       FROM class_schedule cs
       LEFT JOIN users u ON cs.teacher_id = u.user_id
       WHERE cs.subject_id = ?
       ORDER BY cs.class_date ASC, cs.start_time ASC`,
      [user_id, subjectId]
    );

    res.json(schedules);
  } catch (err) {
    next(err);
  }
}
