import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { db } from "../config/db.js";

const router = express.Router();

// Middleware: ensure user is teacher or admin
function ensureTeacher(req, res, next) {
  const role = req.user?.role?.toLowerCase() || "";
  if (!["guru", "teacher", "admin"].includes(role)) {
    return res.status(403).json({ message: "Forbidden: Teacher or admin role required" });
  }
  next();
}

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /teacher/materials:
 *   get:
 *     summary: Get all materials created by current teacher
 *     tags: [Teacher]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of teacher's materials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Material'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - teacher role required
 */
router.get("/materials", ensureTeacher, async (req, res) => {
  try {
    const connection = await db.getConnection();

    // Get courses created by teacher, then get all materials from those courses
    const [courses] = await connection.query(
      `SELECT id FROM courses WHERE teacher_id = ?`,
      [req.user.id]
    );

    if (!courses.length) {
      connection.release();
      return res.json([]);
    }

    const courseIds = courses.map(c => c.id);
    const placeholders = courseIds.map(() => '?').join(',');

    // Get all materials from teacher's courses (parameterized to avoid SQL injection)
    const [materials] = await connection.query(
      `SELECT m.*, c.name AS course_name FROM materials m 
       LEFT JOIN courses c ON m.course_id = c.id
       WHERE m.course_id IN (${placeholders})
       ORDER BY m.created_at DESC`,
      courseIds
    );

    connection.release();

    res.json(materials || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch materials", error: err.message });
  }
});

/**
 * @swagger
 * /teacher/quizzes:
 *   get:
 *     summary: Get all quizzes created by current teacher
 *     tags: [Teacher]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of teacher's quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quiz'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - teacher role required
 */
router.get("/quizzes", ensureTeacher, async (req, res) => {
  try {
    const connection = await db.getConnection();

    // Get courses created by teacher
    const [courses] = await connection.query(
      `SELECT id FROM courses WHERE teacher_id = ?`,
      [req.user.id]
    );

    if (!courses.length) {
      connection.release();
      return res.json([]);
    }

    const courseIds = courses.map(c => c.id);
    const placeholders = courseIds.map(() => '?').join(',');

    // Get all quizzes from teacher's courses (parameterized)
    const [quizzes] = await connection.query(
      `SELECT q.*, c.name AS course_name FROM quizzes q 
       LEFT JOIN courses c ON q.course_id = c.id
       WHERE q.course_id IN (${placeholders})
       ORDER BY q.created_at DESC`,
      courseIds
    );

    connection.release();

    // Normalize field names
    const normalized = (quizzes || []).map((q) => ({
      ...q,
      total_questions: q.question_count ?? q.total_questions ?? 0
    }));

    res.json(normalized);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch quizzes", error: err.message });
  }
});

/**
 * @swagger
 * /teacher/courses:
 *   get:
 *     summary: Get all courses created by current teacher
 *     tags: [Teacher]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of teacher's courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - teacher role required
 */
router.get("/courses", ensureTeacher, async (req, res) => {
  try {
    const connection = await db.getConnection();

    const [courses] = await connection.query(
      `SELECT c.*, u.full_name as teacher_name
       FROM courses c
       LEFT JOIN users u ON c.teacher_id = u.id
       WHERE c.teacher_id = ?
       ORDER BY c.name`,
      [req.user.id]
    );

    connection.release();

    res.json(courses || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch courses", error: err.message });
  }
});

/**
 * @swagger
 * /teacher/stats:
 *   get:
 *     summary: Get statistics for teacher dashboard
 *     tags: [Teacher]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Teacher statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_courses:
 *                   type: integer
 *                   example: 3
 *                 total_materials:
 *                   type: integer
 *                   example: 15
 *                 total_quizzes:
 *                   type: integer
 *                   example: 8
 *                 total_students:
 *                   type: integer
 *                   example: 45
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - teacher role required
 */
router.get("/stats", ensureTeacher, async (req, res) => {
  try {
    const connection = await db.getConnection();

    // Get teacher's courses
    const [courses] = await connection.query(
      `SELECT id FROM courses WHERE teacher_id = ?`,
      [req.user.id]
    );

    if (!courses.length) {
      connection.release();
      return res.json({
        total_courses: 0,
        total_materials: 0,
        total_quizzes: 0,
        total_students: 0
      });
    }

    const courseIds = courses.map(c => c.id);
    const placeholders = courseIds.map(() => '?').join(',');

    // Get counts (parameterized)
    const [materialCount] = await connection.query(
      `SELECT COUNT(*) as count FROM materials WHERE course_id IN (${placeholders})`,
      courseIds
    );
    const [quizCount] = await connection.query(
      `SELECT COUNT(*) as count FROM quizzes WHERE course_id IN (${placeholders})`,
      courseIds
    );
    const [studentCount] = await connection.query(
      `SELECT COUNT(DISTINCT user_id) as count FROM user_courses WHERE course_id IN (${placeholders})`,
      courseIds
    );

    connection.release();

    res.json({
      total_courses: courses.length,
      total_materials: materialCount[0]?.count || 0,
      total_quizzes: quizCount[0]?.count || 0,
      total_students: studentCount[0]?.count || 0
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
});

export default router;
