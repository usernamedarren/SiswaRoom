import db from "../config/db.js";

export const MaterialModel = {
  // Get all materials
  async getAll() {
    const [rows] = await db.query(`
      SELECT 
        m.*,
        u.name as created_by_name
      FROM materials m
      LEFT JOIN users u ON m.created_by = u.user_id
      ORDER BY m.created_at DESC
    `);
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
    const { title, description, content, content_type, order, created_by } = data;
    const [result] = await db.query(
      `INSERT INTO materials 
       (title, description, content, content_type, \`order\`, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, content, content_type, order || 1, created_by]
    );
    return { material_id: result.insertId, ...data };
  },

  // Update material
  async update(id, data) {
    const { title, description, content, content_type, order } = data;
    await db.query(
      `UPDATE materials 
       SET title = ?, description = ?, content = ?, content_type = ?, \`order\` = ?
       WHERE material_id = ?`,
      [title, description, content, content_type, order, id]
    );
    return this.getById(id);
  },

  // Delete material
  async delete(id) {
    await db.query("DELETE FROM materials WHERE material_id = ?", [id]);
    return true;
  }
};
