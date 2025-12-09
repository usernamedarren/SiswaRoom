import db from "../config/db.js";

// GET /api/schedules - Get class schedules
export async function getSchedules(req, res, next) {
  try {
    const { day, subject_id } = req.query;

    let query = `
      SELECT 
        s.id,
        s.subject_id,
        s.teacher_id,
        s.room,
        s.day,
        s.start_time,
        s.end_time,
        sub.name as subject_name,
        u.name as teacher_name
      FROM schedules s
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (day) {
      query += ` AND s.day = ?`;
      params.push(day);
    }

    if (subject_id) {
      query += ` AND s.subject_id = ?`;
      params.push(subject_id);
    }

    query += ` ORDER BY FIELD(s.day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), s.start_time ASC`;

    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/schedules/:id - Get schedule detail
export async function getScheduleDetail(req, res, next) {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT s.*, sub.name as subject_name, u.name as teacher_name
       FROM schedules s
       LEFT JOIN subjects sub ON s.subject_id = sub.id
       LEFT JOIN users u ON s.teacher_id = u.id
       WHERE s.id = ?`,
      [id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// POST /api/schedules - Create schedule (admin/teacher only)
export async function createSchedule(req, res, next) {
  try {
    const { subject_id, teacher_id, room, day, start_time, end_time } = req.body;

    if (!subject_id || !teacher_id || !day || !start_time || !end_time) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const [result] = await db.query(
      `INSERT INTO schedules (subject_id, teacher_id, room, day, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [subject_id, teacher_id, room || null, day, start_time, end_time]
    );

    res.status(201).json({ id: result.insertId, message: "Jadwal berhasil dibuat" });
  } catch (err) {
    next(err);
  }
}

// PUT /api/schedules/:id - Update schedule
export async function updateSchedule(req, res, next) {
  try {
    const { id } = req.params;
    const { subject_id, teacher_id, room, day, start_time, end_time } = req.body;

    const [result] = await db.query(
      `UPDATE schedules 
       SET subject_id = ?, teacher_id = ?, room = ?, day = ?, start_time = ?, end_time = ?
       WHERE id = ?`,
      [subject_id, teacher_id, room, day, start_time, end_time, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    res.json({ message: "Jadwal berhasil diperbarui" });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/schedules/:id - Delete schedule
export async function deleteSchedule(req, res, next) {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM schedules WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    res.json({ message: "Jadwal berhasil dihapus" });
  } catch (err) {
    next(err);
  }
}
