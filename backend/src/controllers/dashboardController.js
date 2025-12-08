import db from "../config/db.js";

// GET /api/dashboard/summary - System-wide statistics
export async function getDashboardSummary(req, res, next) {
  try {
    const [[{ subjectsCount }]] = await db.query(
      "SELECT COUNT(*) AS subjectsCount FROM subjects"
    );
    const [[{ materialsCount }]] = await db.query(
      "SELECT COUNT(*) AS materialsCount FROM materials"
    );
    const [[{ questionsCount }]] = await db.query(
      "SELECT COUNT(*) AS questionsCount FROM questions"
    );
    const [[{ quizzesCount }]] = await db.query(
      "SELECT COUNT(*) AS quizzesCount FROM quizzes"
    );

    res.json({
      subjectsCount,
      materialsCount,
      questionsCount,
      quizzesCount
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/dashboard/user-stats - User-specific statistics
export async function getUserStats(req, res, next) {
  try {
    const { user_id } = req.user;

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

    // Classes attended
    const [[{ classesCount }]] = await db.query(
      `SELECT COUNT(DISTINCT cs.schedule_id) AS classesCount
       FROM class_students cs
       WHERE cs.user_id = ?`,
      [user_id]
    );

    // Subjects enrolled
    const [[{ subjectsCount }]] = await db.query(
      `SELECT COUNT(DISTINCT s.subject_id) AS subjectsCount
       FROM subjects s
       WHERE s.subject_id IN (
         SELECT DISTINCT s2.subject_id
         FROM class_schedule cs
         JOIN subjects s2 ON cs.subject_id = s2.subject_id
         WHERE cs.schedule_id IN (
           SELECT schedule_id FROM class_students WHERE user_id = ?
         )
       )`,
      [user_id]
    );

    res.json({
      totalQuizzes: totalQuizzes || 0,
      avgScore: avgScore || 0,
      classesCount: classesCount || 0,
      subjectsCount: subjectsCount || 0
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/dashboard/classes
export async function getUpcomingClasses(req, res, next) {
  try {
    const { user_id } = req.user;

    const [rows] = await db.query(
      `SELECT cs.schedule_id, cs.class_name, cs.class_date,
              cs.start_time, cs.end_time, cs.meeting_url,
              s.name AS subject_name,
              u.name AS teacher_name
       FROM class_schedule cs
       JOIN subjects s ON cs.subject_id = s.subject_id
       JOIN users u ON cs.teacher_id = u.user_id
       WHERE cs.schedule_id IN (
         SELECT schedule_id FROM class_students WHERE user_id = ?
       )
       AND cs.class_date >= CURDATE()
       ORDER BY cs.class_date ASC, cs.start_time ASC
       LIMIT 5`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/dashboard/quiz-results
export async function getLatestQuizResults(req, res, next) {
  try {
    const { user_id } = req.user;

    const [rows] = await db.query(
      `SELECT qr.result_id, qr.score, qr.started_at, qr.finished_at,
              q.title AS quiz_title, q.quiz_id,
              s.name AS subject_name
       FROM quiz_results qr
       JOIN quizzes q ON qr.quiz_id = q.quiz_id
       JOIN subjects s ON q.subject_id = s.subject_id
       WHERE qr.user_id = ?
       ORDER BY qr.finished_at DESC
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
    const { user_id } = req.user;

    const [rows] = await db.query(
      `SELECT s.subject_id, s.name,
              COUNT(DISTINCT qr.quiz_id) as quizzes_taken,
              ROUND(AVG(qr.score)) as avg_score,
              COUNT(DISTINCT m.material_id) as materials_studied
       FROM subjects s
       LEFT JOIN quizzes q ON s.subject_id = q.subject_id
       LEFT JOIN quiz_results qr ON q.quiz_id = qr.quiz_id AND qr.user_id = ?
       LEFT JOIN materials m ON s.subject_id = m.subject_id
       WHERE s.subject_id IN (
         SELECT DISTINCT subject_id FROM class_schedule cs
         WHERE cs.schedule_id IN (
           SELECT schedule_id FROM class_students WHERE user_id = ?
         )
       )
       GROUP BY s.subject_id, s.name`,
      [user_id, user_id]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

