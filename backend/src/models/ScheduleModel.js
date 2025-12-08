import db from "../config/db.js";

export const ScheduleModel = {
  // Get all schedules
  async getAll() {
    const [rows] = await db.query(`
      SELECT 
        cs.*,
        s.name as subject_name,
        u.name as teacher_name,
        COUNT(DISTINCT css.user_id) as enrolled_count
      FROM class_schedule cs
      LEFT JOIN subjects s ON cs.subject_id = s.subject_id
      LEFT JOIN users u ON cs.teacher_id = u.user_id
      LEFT JOIN class_students css ON cs.schedule_id = css.schedule_id
      GROUP BY cs.schedule_id
      ORDER BY cs.class_date ASC, cs.start_time ASC
    `);
    return rows;
  },

  // Get schedules by subject
  async getBySubject(subjectId) {
    const [rows] = await db.query(`
      SELECT 
        cs.*,
        u.name as teacher_name,
        COUNT(DISTINCT css.user_id) as enrolled_count
      FROM class_schedule cs
      LEFT JOIN users u ON cs.teacher_id = u.user_id
      LEFT JOIN class_students css ON cs.schedule_id = css.schedule_id
      WHERE cs.subject_id = ?
      GROUP BY cs.schedule_id
      ORDER BY cs.class_date ASC, cs.start_time ASC
    `, [subjectId]);
    return rows;
  },

  // Get schedules by teacher
  async getByTeacher(teacherId) {
    const [rows] = await db.query(`
      SELECT 
        cs.*,
        s.name as subject_name,
        COUNT(DISTINCT css.user_id) as enrolled_count
      FROM class_schedule cs
      LEFT JOIN subjects s ON cs.subject_id = s.subject_id
      LEFT JOIN class_students css ON cs.schedule_id = css.schedule_id
      WHERE cs.teacher_id = ?
      GROUP BY cs.schedule_id
      ORDER BY cs.class_date ASC, cs.start_time ASC
    `, [teacherId]);
    return rows;
  },

  // Get single schedule
  async getById(id) {
    const [rows] = await db.query(`
      SELECT 
        cs.*,
        s.name as subject_name,
        s.description as subject_description,
        u.name as teacher_name,
        u.email as teacher_email
      FROM class_schedule cs
      LEFT JOIN subjects s ON cs.subject_id = s.subject_id
      LEFT JOIN users u ON cs.teacher_id = u.user_id
      WHERE cs.schedule_id = ?
    `, [id]);
    return rows[0] || null;
  },

  // Get students in a schedule
  async getStudents(scheduleId) {
    const [rows] = await db.query(`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        css.attendance_status,
        css.joined_at
      FROM class_students css
      LEFT JOIN users u ON css.user_id = u.user_id
      WHERE css.schedule_id = ?
      ORDER BY u.name ASC
    `, [scheduleId]);
    return rows;
  },

  // Create schedule
  async create(data) {
    const { subject_id, teacher_id, class_name, class_date, start_time, end_time, meeting_url, meeting_room, is_online } = data;
    const [result] = await db.query(
      `INSERT INTO class_schedule 
       (subject_id, teacher_id, class_name, class_date, start_time, end_time, meeting_url, meeting_room, is_online)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [subject_id, teacher_id, class_name, class_date, start_time, end_time, meeting_url, meeting_room, is_online !== false ? 1 : 0]
    );
    return { schedule_id: result.insertId, ...data };
  },

  // Update schedule
  async update(id, data) {
    const { class_name, class_date, start_time, end_time, meeting_url, meeting_room, is_online } = data;
    await db.query(
      `UPDATE class_schedule 
       SET class_name = ?, class_date = ?, start_time = ?, end_time = ?, meeting_url = ?, meeting_room = ?, is_online = ?
       WHERE schedule_id = ?`,
      [class_name, class_date, start_time, end_time, meeting_url, meeting_room, is_online, id]
    );
    return this.getById(id);
  },

  // Enroll student in schedule
  async enrollStudent(scheduleId, userId) {
    await db.query(
      `INSERT IGNORE INTO class_students (schedule_id, user_id)
       VALUES (?, ?)`,
      [scheduleId, userId]
    );
    return true;
  },

  // Unenroll student from schedule
  async unenrollStudent(scheduleId, userId) {
    await db.query(
      `DELETE FROM class_students WHERE schedule_id = ? AND user_id = ?`,
      [scheduleId, userId]
    );
    return true;
  },

  // Update attendance
  async updateAttendance(scheduleId, userId, status) {
    await db.query(
      `UPDATE class_students SET attendance_status = ? 
       WHERE schedule_id = ? AND user_id = ?`,
      [status, scheduleId, userId]
    );
    return true;
  },

  // Delete schedule
  async delete(id) {
    await db.query("DELETE FROM class_schedule WHERE schedule_id = ?", [id]);
    return true;
  }
};
