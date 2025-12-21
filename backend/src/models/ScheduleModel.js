import db from "../config/db.js";

export const ScheduleModel = {
  // Get all schedules
  async getAll() {
    const [rows] = await db.query(`
      `SELECT 
        cs.*,
        sub.name as subject_name,
        u.full_name as teacher_name
      FROM schedules s
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      LEFT JOIN users u ON s.teacher_id = u.id
      ORDER BY FIELD(s.day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), s.start_time ASC
    `);
    return rows;
  },

  // Get schedules by subject
  async getBySubject(subjectId) {
    const [rows] = await db.query(`
      SELECT 
        s.*,
        u.name as teacher_name
      FROM schedules s
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.subject_id = ?
      ORDER BY FIELD(s.day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), s.start_time ASC
    `, [subjectId]);
    return rows;
  },

  // Get schedules by teacher
  async getByTeacher(teacherId) {
    const [rows] = await db.query(`
      SELECT 
        s.*,
        sub.name as subject_name
      FROM schedules s
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      WHERE s.teacher_id = ?
      ORDER BY FIELD(s.day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), s.start_time ASC
    `, [teacherId]);
    return rows;
  },

  // Get single schedule
  async getById(id) {
    const [rows] = await db.query(`
      SELECT 
        s.*,
        sub.name as subject_name,
        u.name as teacher_name
      FROM schedules s
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.id = ?
    `, [id]);
    return rows[0] || null;
  },

  // Create schedule
  async create(data) {
    const { subject_id, teacher_id, room, day, start_time, end_time } = data;
    const [result] = await db.query(
      `INSERT INTO schedules 
       (subject_id, teacher_id, room, day, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [subject_id, teacher_id, room || null, day, start_time, end_time]
    );
    return { id: result.insertId, ...data };
  },

  // Update schedule
  async update(id, data) {
    const { subject_id, teacher_id, room, day, start_time, end_time } = data;
    await db.query(
      `UPDATE schedules 
       SET subject_id = ?, teacher_id = ?, room = ?, day = ?, start_time = ?, end_time = ?
       WHERE id = ?`,
      [subject_id, teacher_id, room, day, start_time, end_time, id]
    );
    return this.getById(id);
  },

  // Delete schedule
  async delete(id) {
    await db.query("DELETE FROM schedules WHERE id = ?", [id]);
    return true;
  }
};
