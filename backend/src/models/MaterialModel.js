import db from "../config/db.js";

export const MaterialModel = {
  // Get all materials for a subject
  async getBySubject(subjectId) {
    const [rows] = await db.query(`
      SELECT 
        m.material_id,
        m.subject_id,
        m.title,
        m.description,
        m.content_type,
        m.file_url,
        m.video_url,
        m.\`order\`,
        m.created_at,
        u.name as created_by_name
      FROM materials m
      LEFT JOIN users u ON m.created_by = u.user_id
      WHERE m.subject_id = ?
      ORDER BY m.\`order\` ASC
    `, [subjectId]);
    return rows;
  },

  // Get single material
  async getById(id) {
    const [rows] = await db.query(`
      SELECT 
        m.*,
        u.name as created_by_name
      FROM materials m
      LEFT JOIN users u ON m.created_by = u.user_id
      WHERE m.material_id = ?
    `, [id]);
    return rows[0] || null;
  },

  // Create material
  async create(data) {
    const { subject_id, title, description, content, content_type, file_url, video_url, order, created_by } = data;
    const [result] = await db.query(
      `INSERT INTO materials 
       (subject_id, title, description, content, content_type, file_url, video_url, \`order\`, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [subject_id, title, description, content, content_type, file_url, video_url, order || 1, created_by]
    );
    return { material_id: result.insertId, ...data };
  },

  // Update material
  async update(id, data) {
    const { title, description, content, content_type, file_url, video_url, order } = data;
    await db.query(
      `UPDATE materials 
       SET title = ?, description = ?, content = ?, content_type = ?, file_url = ?, video_url = ?, \`order\` = ?
       WHERE material_id = ?`,
      [title, description, content, content_type, file_url, video_url, order, id]
    );
    return this.getById(id);
  },

  // Delete material
  async delete(id) {
    await db.query("DELETE FROM materials WHERE material_id = ?", [id]);
    return true;
  }
};
