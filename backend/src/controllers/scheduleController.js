import db from "../config/db.js";

// GET /api/schedules - Get class schedules
export async function getSchedules(req, res, next) {
  try {
    const { user_id } = req.user;
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        s.*,
        sub.name as subject_name,
        u.name as teacher_name
      FROM class_schedule s
      LEFT JOIN subjects sub ON s.subject_id = sub.subject_id
      LEFT JOIN users u ON s.teacher_id = u.user_id
      WHERE s.schedule_id IN (
        SELECT DISTINCT schedule_id FROM class_students WHERE user_id = ?
      )
    `;
    const params = [user_id];

    // Filter by date range
    if (start_date && end_date) {
      query += ` AND s.class_date BETWEEN ? AND ?`;
      params.push(start_date, end_date);
    }

    query += ` ORDER BY s.class_date ASC, s.start_time ASC`;

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/schedules/upcoming - Get upcoming schedules
export async function getUpcomingSchedules(req, res, next) {
  try {
    const { user_id } = req.user;
    const { limit = 5 } = req.query;

    const [rows] = await db.query(
      `SELECT s.*, su.name as subject_name, u.name as teacher_name
       FROM class_schedule s
       JOIN subjects su ON s.subject_id = su.subject_id
       JOIN users u ON s.teacher_id = u.user_id
       WHERE s.schedule_id IN (
         SELECT DISTINCT schedule_id FROM class_students WHERE user_id = ?
       )
       AND s.class_date >= CURDATE()
       ORDER BY s.class_date ASC, s.start_time ASC
       LIMIT ?`,
      [user_id, parseInt(limit)]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/schedules/:id - Get schedule detail
export async function getScheduleDetail(req, res, next) {
  try {
    const { id } = req.params;
    const { user_id } = req.user;

    const [rows] = await db.query(
      `SELECT s.*, su.name as subject_name, u.name as teacher_name
       FROM class_schedule s
       JOIN subjects su ON s.subject_id = su.subject_id
       JOIN users u ON s.teacher_id = u.user_id
       WHERE s.schedule_id = ? 
       AND s.schedule_id IN (
         SELECT schedule_id FROM class_students WHERE user_id = ?
       )`,
      [id, user_id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    // Get students in class
    const [students] = await db.query(
      `SELECT u.user_id, u.name, u.email
       FROM users u
       JOIN class_students cs ON u.user_id = cs.user_id
       WHERE cs.schedule_id = ?`,
      [id]
    );

    const schedule = rows[0];
    schedule.students = students;

    res.json(schedule);
  } catch (err) {
    next(err);
  }
}

// GET /api/calendar - Get calendar view of schedules
export async function getCalendar(req, res, next) {
  try {
    const { user_id } = req.user;
    const { month, year } = req.query;

    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();

    const [rows] = await db.query(
      `SELECT s.class_date, COUNT(*) as total_classes
       FROM class_schedule s
       WHERE s.schedule_id IN (
         SELECT DISTINCT schedule_id FROM class_students WHERE user_id = ?
       )
       AND MONTH(s.class_date) = ? AND YEAR(s.class_date) = ?
       GROUP BY s.class_date
       ORDER BY s.class_date ASC`,
      [user_id, targetMonth, targetYear]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}
