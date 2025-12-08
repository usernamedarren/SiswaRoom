import db from "../config/db.js";

export const TopicModel = {
  // Get all topics for a subject
  async getBySubject(subjectId) {
    const [rows] = await db.query(`
      SELECT 
        topic_id,
        subject_id,
        slug,
        title,
        subtitle,
        description,
        JSON_EXTRACT(points, '$') as points,
        created_at,
        updated_at
      FROM topics
      WHERE subject_id = ?
      ORDER BY topic_id ASC
    `, [subjectId]);
    return rows;
  },

  // Get single topic by ID
  async getById(id) {
    const [rows] = await db.query(`
      SELECT 
        topic_id,
        subject_id,
        slug,
        title,
        subtitle,
        description,
        JSON_EXTRACT(points, '$') as points,
        created_at,
        updated_at
      FROM topics
      WHERE topic_id = ?
    `, [id]);
    return rows[0] || null;
  },

  // Get topic by slug and subject
  async getBySlug(subjectId, slug) {
    const [rows] = await db.query(`
      SELECT 
        topic_id,
        subject_id,
        slug,
        title,
        subtitle,
        description,
        JSON_EXTRACT(points, '$') as points,
        created_at,
        updated_at
      FROM topics
      WHERE subject_id = ? AND slug = ?
    `, [subjectId, slug]);
    return rows[0] || null;
  },

  // Get topics by category (subject category)
  async getByCategory(category) {
    const [rows] = await db.query(`
      SELECT 
        t.topic_id,
        t.subject_id,
        t.slug,
        t.title,
        t.subtitle,
        t.description,
        JSON_EXTRACT(t.points, '$') as points,
        t.created_at,
        s.name as subject_name,
        s.category
      FROM topics t
      LEFT JOIN subjects s ON t.subject_id = s.subject_id
      WHERE s.category = ?
      ORDER BY t.subject_id, t.topic_id ASC
    `, [category]);
    return rows;
  },

  // Create topic
  async create(data) {
    const { subject_id, slug, title, subtitle, description, points } = data;
    const pointsJson = typeof points === 'string' ? points : JSON.stringify(points);
    
    const [result] = await db.query(`
      INSERT INTO topics (subject_id, slug, title, subtitle, description, points)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [subject_id, slug, title, subtitle, description, pointsJson]);
    
    return this.getById(result.insertId);
  },

  // Update topic
  async update(id, data) {
    const { title, subtitle, description, points } = data;
    const pointsJson = typeof points === 'string' ? points : JSON.stringify(points);
    
    await db.query(`
      UPDATE topics
      SET title = ?, subtitle = ?, description = ?, points = ?, updated_at = CURRENT_TIMESTAMP
      WHERE topic_id = ?
    `, [title, subtitle, description, pointsJson, id]);
    
    return this.getById(id);
  },

  // Delete topic
  async delete(id) {
    await db.query("DELETE FROM topics WHERE topic_id = ?", [id]);
    return true;
  },

  // Get all categories
  async getCategories() {
    const [rows] = await db.query(`
      SELECT DISTINCT category
      FROM subjects
      WHERE category IS NOT NULL
      ORDER BY category ASC
    `);
    return rows.map(row => row.category);
  }
};
