import db from "../config/db.js";

export const MaterialModel = {
  // Get all materials
  async getAll() {
    const [rows] = await db.query(`
      SELECT 
        m.*
      FROM materials m
      ORDER BY m.created_at DESC
    `);
    return rows;
  },

  // Get materials by course
  async getByCourse(courseId) {
    const [rows] = await db.query(`
      SELECT *
      FROM materials
      WHERE course_id = ?
      ORDER BY created_at DESC
    `, [courseId]);
    return rows;
  },

  // Get single material
  async getById(id) {
    const [rows] = await db.query(`
      SELECT *
      FROM materials
      WHERE id = ?
    `, [id]);
    return rows[0] || null;
  },

  // Create material
  async create(data) {
    const { course_id, title, description, file_url, file_type } = data;
    const [result] = await db.query(
      `INSERT INTO materials 
       (course_id, title, description, file_url, file_type)
       VALUES (?, ?, ?, ?, ?)`,
      [course_id, title, description || null, file_url || null, file_type || null]
    );
    return { id: result.insertId, ...data };
  },

  // Update material
  async update(id, data) {
    const { title, description, file_url, file_type } = data;
    await db.query(
      `UPDATE materials 
       SET title = ?, description = ?, file_url = ?, file_type = ?
       WHERE id = ?`,
      [title, description, file_url, file_type, id]
    );
    return this.getById(id);
  },

  // Delete material
  async delete(id) {
    await db.query("DELETE FROM materials WHERE id = ?", [id]);
    return true;
  }
};
