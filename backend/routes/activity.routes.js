import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { db } from "../config/db.js";

const router = express.Router();

// Apply authentication to all activity routes
router.use(authenticate);

/**
 * @swagger
 * /activity/recent:
 *   get:
 *     summary: Get recent activities
 *     tags: [Activity]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Recent user activities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   type:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   time:
 *                     type: string
 */
router.get("/recent", async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await db.getConnection();
    
    // Get recent quiz attempts
    const [quizAttempts] = await connection.query(
      `SELECT qa.id, q.title, qa.score, qa.started_at
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.student_id = ?
       ORDER BY qa.started_at DESC
       LIMIT 5`,
      [userId]
    );
    
    connection.release();
    
    // Format activities
    const activities = quizAttempts.map((attempt, idx) => ({
      id: String(attempt.id),
      type: "quiz_completed",
      title: `Kuis: ${attempt.title}`,
      description: `Selesai mengerjakan kuis dengan skor ${attempt.score}`,
      time: formatTime(attempt.started_at)
    }));
    
    // Add default mock activities if no quiz attempts found
    if (activities.length === 0) {
      activities.push(
        {
          id: "1",
          type: "quiz_completed",
          title: "Kuis Bahasa Inggris",
          description: "Selesai mengerjakan kuis Bahasa Inggris",
          time: "2 jam yang lalu"
        },
        {
          id: "2",
          type: "material_viewed",
          title: "Materi Kalkulus",
          description: "Membaca materi Kalkulus Dasar",
          time: "5 jam yang lalu"
        }
      );
    }
    
    res.json(activities);
  } catch (err) {
    console.error("[ACTIVITY] recent error:", err);
    res.status(500).json({ message: "Failed to fetch recent activities", error: err.message });
  }
});

// Helper function to format time difference
function formatTime(date) {
  if (!date) return "baru saja";
  
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return "baru saja";
  if (minutes < 60) return `${minutes} menit yang lalu`;
  if (hours < 24) return `${hours} jam yang lalu`;
  if (days < 7) return `${days} hari yang lalu`;
  
  return date;
}

export default router;
