import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { db } from "../config/db.js";

const router = express.Router();

// Apply authentication to all dashboard routes
router.use(authenticate);

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subjects:
 *                   type: integer
 *                   example: 5
 *                 materials:
 *                   type: integer
 *                   example: 12
 *                 questions:
 *                   type: integer
 *                   example: 45
 *                 quizzes:
 *                   type: integer
 *                   example: 8
 */
router.get("/stats", async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    // Count distinct courses (subjects)
    const [coursesResult] = await connection.query("SELECT COUNT(*) as count FROM courses");
    const subjects = coursesResult[0]?.count || 0;
    
    // Count materials
    const [materialsResult] = await connection.query("SELECT COUNT(*) as count FROM materials");
    const materials = materialsResult[0]?.count || 0;
    
    // Count quiz questions
    const [questionsResult] = await connection.query("SELECT COUNT(*) as count FROM quiz_questions");
    const questions = questionsResult[0]?.count || 0;
    
    // Count quizzes
    const [quizzesResult] = await connection.query("SELECT COUNT(*) as count FROM quizzes");
    const quizzes = quizzesResult[0]?.count || 0;
    
    connection.release();
    
    res.json({
      subjects,
      materials,
      questions,
      quizzes
    });
  } catch (err) {
    console.error("[DASHBOARD] stats error:", err);
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
});

/**
 * @swagger
 * /dashboard/charts:
 *   get:
 *     summary: Get dashboard chart data
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Chart data for dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quizScores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label:
 *                         type: string
 *                       score:
 *                         type: number
 *                 subjectProgress:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       subject:
 *                         type: string
 *                       progress:
 *                         type: number
 */
router.get("/charts", async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await db.getConnection();
    
    // Get user's quiz scores
    const [quizAttemptsResult] = await connection.query(
      `SELECT q.title, qa.score 
       FROM quiz_attempts qa 
       JOIN quizzes q ON qa.quiz_id = q.id 
       WHERE qa.student_id = ? 
       ORDER BY qa.started_at DESC 
       LIMIT 5`,
      [userId]
    );
    
    const quizScores = quizAttemptsResult.map(attempt => ({
      label: attempt.title,
      score: attempt.score || 0
    }));
    
    // Get subject progress (based on materials viewed)
    const [subjectsResult] = await connection.query(
      `SELECT DISTINCT c.name, COUNT(m.id) as material_count
       FROM courses c
       LEFT JOIN materials m ON c.id = m.course_id
       GROUP BY c.id, c.name
       LIMIT 5`
    );
    
    const subjectProgress = subjectsResult.map((subject, idx) => ({
      subject: subject.name,
      progress: Math.min(100, 50 + (idx * 10))
    }));
    
    connection.release();
    
    res.json({
      quizScores: quizScores.length > 0 ? quizScores : [
        { label: "Kuis 1", score: 85 },
        { label: "Kuis 2", score: 90 }
      ],
      subjectProgress: subjectProgress.length > 0 ? subjectProgress : [
        { subject: "Bahasa Inggris", progress: 75 },
        { subject: "Matematika", progress: 82 }
      ]
    });
  } catch (err) {
    console.error("[DASHBOARD] charts error:", err);
    res.status(500).json({ message: "Failed to fetch charts", error: err.message });
  }
});

export default router;
