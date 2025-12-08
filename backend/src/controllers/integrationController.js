import { UserModel } from "../models/UserModel.js";
import { SubjectModel } from "../models/SubjectModel.js";
import { ScheduleModel } from "../models/ScheduleModel.js";
import { QuizModel } from "../models/QuizModel.js";
import { MaterialModel } from "../models/MaterialModel.js";
import db from "../config/db.js";

/**
 * GET /api/integration/students
 * Get list of all students with their basic info and progress
 * Requires: API Key in header
 */
export async function getStudentsForIntegration(req, res) {
  try {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        COUNT(DISTINCT uc.course_id) as enrolled_courses,
        COUNT(DISTINCT q.id) as quizzes_taken,
        AVG(q.score) as avg_score
      FROM users u
      LEFT JOIN user_courses uc ON u.id = uc.user_id
      LEFT JOIN quizzes q ON u.id = q.user_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.name, u.email, u.role, u.created_at
      ORDER BY u.created_at DESC
      LIMIT 1000
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("[INTEGRATION] Error fetching students:", err);
        return res.status(500).json({ error: "Failed to fetch students" });
      }

      res.json({
        success: true,
        count: results.length,
        data: results.map(student => ({
          id: student.id,
          name: student.name,
          email: student.email,
          role: student.role,
          enrolledCourses: student.enrolled_courses,
          quizzesTaken: student.quizzes_taken,
          averageScore: parseFloat(student.avg_score || 0).toFixed(2),
          joinDate: student.created_at
        }))
      });
    });
  } catch (err) {
    console.error("[INTEGRATION] Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/integration/courses
 * Get list of all courses with materials and enrollment info
 */
export async function getCoursesForIntegration(req, res) {
  try {
    const query = `
      SELECT 
        s.id,
        s.name,
        s.description,
        s.category,
        COUNT(DISTINCT uc.user_id) as total_enrolled,
        COUNT(DISTINCT m.id) as total_materials,
        s.created_at
      FROM subjects s
      LEFT JOIN user_courses uc ON s.id = uc.course_id
      LEFT JOIN materials m ON s.id = m.subject_id
      GROUP BY s.id, s.name, s.description, s.category, s.created_at
      ORDER BY s.created_at DESC
      LIMIT 1000
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("[INTEGRATION] Error fetching courses:", err);
        return res.status(500).json({ error: "Failed to fetch courses" });
      }

      res.json({
        success: true,
        count: results.length,
        data: results.map(course => ({
          id: course.id,
          name: course.name,
          description: course.description,
          category: course.category,
          totalEnrolled: course.total_enrolled,
          totalMaterials: course.total_materials,
          createdAt: course.created_at
        }))
      });
    });
  } catch (err) {
    console.error("[INTEGRATION] Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/integration/schedules
 * Get class schedules with teacher and room info
 */
export async function getSchedulesForIntegration(req, res) {
  try {
    const query = `
      SELECT 
        sch.id,
        sch.subject_id,
        s.name as subject_name,
        sch.teacher_id,
        u.name as teacher_name,
        u.email as teacher_email,
        sch.room,
        sch.day,
        sch.start_time,
        sch.end_time,
        COUNT(DISTINCT uc.user_id) as students_count
      FROM schedules sch
      LEFT JOIN subjects s ON sch.subject_id = s.id
      LEFT JOIN users u ON sch.teacher_id = u.id
      LEFT JOIN user_courses uc ON s.id = uc.course_id
      GROUP BY sch.id, sch.subject_id, s.name, sch.teacher_id, u.name, u.email, sch.room, sch.day, sch.start_time, sch.end_time
      ORDER BY sch.day, sch.start_time
      LIMIT 500
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("[INTEGRATION] Error fetching schedules:", err);
        return res.status(500).json({ error: "Failed to fetch schedules" });
      }

      res.json({
        success: true,
        count: results.length,
        data: results.map(schedule => ({
          id: schedule.id,
          subjectId: schedule.subject_id,
          subjectName: schedule.subject_name,
          teacherId: schedule.teacher_id,
          teacherName: schedule.teacher_name,
          teacherEmail: schedule.teacher_email,
          room: schedule.room,
          day: schedule.day,
          startTime: schedule.start_time,
          endTime: schedule.end_time,
          studentCount: schedule.students_count
        }))
      });
    });
  } catch (err) {
    console.error("[INTEGRATION] Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/integration/quizzes
 * Get quizzes with results and difficulty info
 */
export async function getQuizzesForIntegration(req, res) {
  try {
    const query = `
      SELECT 
        q.id,
        q.subject_id,
        s.name as subject_name,
        q.title,
        q.description,
        q.duration,
        q.passing_score,
        COUNT(DISTINCT qr.id) as total_attempts,
        AVG(qr.score) as avg_score,
        q.created_at
      FROM quizzes q
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN quiz_results qr ON q.id = qr.quiz_id
      GROUP BY q.id, q.subject_id, s.name, q.title, q.description, q.duration, q.passing_score, q.created_at
      ORDER BY q.created_at DESC
      LIMIT 500
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("[INTEGRATION] Error fetching quizzes:", err);
        return res.status(500).json({ error: "Failed to fetch quizzes" });
      }

      res.json({
        success: true,
        count: results.length,
        data: results.map(quiz => ({
          id: quiz.id,
          subjectId: quiz.subject_id,
          subjectName: quiz.subject_name,
          title: quiz.title,
          description: quiz.description,
          durationMinutes: quiz.duration,
          passingScore: quiz.passing_score,
          totalAttempts: quiz.total_attempts,
          averageScore: parseFloat(quiz.avg_score || 0).toFixed(2),
          createdAt: quiz.created_at
        }))
      });
    });
  } catch (err) {
    console.error("[INTEGRATION] Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/integration/sync-grades
 * Receive and sync grades/scores from partner platform
 * Body: { studentId, courseId, grade, source }
 */
export async function syncGrades(req, res) {
  try {
    const { studentId, courseId, grade, source } = req.body;

    // Validate input
    if (!studentId || !courseId || grade === undefined) {
      return res.status(400).json({ 
        error: "Missing required fields: studentId, courseId, grade" 
      });
    }

    // Verify student exists
    const studentQuery = "SELECT id FROM users WHERE id = ? AND role = 'student'";
    db.query(studentQuery, [studentId], (err, students) => {
      if (err || students.length === 0) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Verify course exists
      const courseQuery = "SELECT id FROM subjects WHERE id = ?";
      db.query(courseQuery, [courseId], (err, courses) => {
        if (err || courses.length === 0) {
          return res.status(404).json({ error: "Course not found" });
        }

        // Create sync record in grades table (if exists) or log it
        const syncQuery = `
          INSERT INTO grade_sync (student_id, subject_id, grade, source, sync_date)
          VALUES (?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE 
            grade = VALUES(grade),
            sync_date = NOW()
        `;

        db.query(syncQuery, [studentId, courseId, grade, source || 'integration'], (err) => {
          if (err) {
            console.error("[INTEGRATION] Sync error:", err);
            return res.status(500).json({ error: "Failed to sync grades" });
          }

          res.json({
            success: true,
            message: "Grade synced successfully",
            data: {
              studentId,
              courseId,
              grade,
              syncdAt: new Date().toISOString()
            }
          });
        });
      });
    });
  } catch (err) {
    console.error("[INTEGRATION] Sync error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/integration/health
 * Health check endpoint for integration
 */
export async function integrationHealth(req, res) {
  try {
    res.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
