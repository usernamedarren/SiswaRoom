import db from "../config/db.js";

// GET /api/dashboard/summary - System-wide statistics
export async function getDashboardSummary(req, res, next) {
  try {
    const [[{ subjectsCount }]] = await db.query("SELECT COUNT(*) AS subjectsCount FROM subjects");
    const [[{ materialsCount }]] = await db.query("SELECT COUNT(*) AS materialsCount FROM materials");
    const [[{ questionsCount }]] = await db.query("SELECT COUNT(*) AS questionsCount FROM questions");
    const [[{ quizzesCount }]] = await db.query("SELECT COUNT(*) AS quizzesCount FROM quizzes");
    const [[{ usersCount }]] = await db.query("SELECT COUNT(*) AS usersCount FROM users");

    res.json({
      users: usersCount || 0,
      subjects: subjectsCount || 0,
      materials: materialsCount || 0,
      questions: questionsCount || 0,
      quizzes: quizzesCount || 0
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/dashboard/user-stats - User-specific statistics
export async function getUserStats(req, res, next) {
  try {
    const user_id = req.user.id;

    // Total quizzes taken
    const [[{ totalQuizzes }]] = await db.query(
      "SELECT COUNT(*) AS totalQuizzes FROM quiz_results WHERE user_id = ?",
      [user_id]
    );

    // Average score
    const [[{ avgScore }]] = await db.query(
      "SELECT ROUND(AVG(score)) AS avgScore FROM quiz_results WHERE user_id = ? AND score > 0",
      [user_id]
    );

    // Subjects enrolled via user_courses
    const [[{ subjectsCount }]] = await db.query(
      `SELECT COUNT(DISTINCT course_id) AS subjectsCount
       FROM user_courses
       WHERE user_id = ?`,
      [user_id]
    );

    res.json({
      totalQuizzes: totalQuizzes || 0,
      avgScore: avgScore || 0,
      subjectsCount: subjectsCount || 0
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/dashboard/quiz-results
export async function getLatestQuizResults(req, res, next) {
  try {
    const user_id = req.user.id;

    const [rows] = await db.query(
      `SELECT qr.result_id, qr.score, qr.completed_at,
              q.title AS quiz_title, q.id AS quiz_id,
              s.name AS subject_name
       FROM quiz_results qr
       JOIN quizzes q ON qr.quiz_id = q.id
       JOIN subjects s ON q.course_id = s.id
       WHERE qr.user_id = ?
       ORDER BY qr.completed_at DESC
       LIMIT 10`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/dashboard/progress - Learning progress by subject
export async function getProgress(req, res, next) {
  try {
    const user_id = req.user.id;

    const [rows] = await db.query(
      `SELECT s.id, s.name,
              COUNT(DISTINCT qr.quiz_id) as quizzes_taken,
              ROUND(AVG(qr.score)) as avg_score,
              COUNT(DISTINCT m.id) as materials_available
       FROM subjects s
       LEFT JOIN quizzes q ON s.id = q.course_id
       LEFT JOIN quiz_results qr ON q.id = qr.quiz_id AND qr.user_id = ?
       LEFT JOIN materials m ON s.id = m.course_id
       WHERE s.id IN (
         SELECT DISTINCT course_id FROM user_courses WHERE user_id = ?
       )
       GROUP BY s.id, s.name`,
      [user_id, user_id]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

