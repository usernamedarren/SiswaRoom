import { db } from "../config/db.js";

export async function getMaterialById(id) {
  const [rows] = await db.query("SELECT * FROM materials WHERE id = ?", [id]);
  return rows[0] || null;
}

export async function getMaterialsByCourse(courseId) {
  const [rows] = await db.query("SELECT * FROM materials WHERE course_id = ? ORDER BY created_at DESC", [courseId]);
  return rows;
}

export async function createMaterial(courseId, title, shortDescription, fullDescription, videoUrl) {
  const [result] = await db.query(
    "INSERT INTO materials (course_id, title, short_description, full_description, video_url) VALUES (?, ?, ?, ?, ?)",
    [courseId, title, shortDescription, fullDescription, videoUrl]
  );
  return result.insertId;
}

export async function updateMaterial(id, title, shortDescription, fullDescription, videoUrl) {
  const [result] = await db.query(
    "UPDATE materials SET title = ?, short_description = ?, full_description = ?, video_url = ? WHERE id = ?",
    [title, shortDescription, fullDescription, videoUrl, id]
  );
  return result.affectedRows > 0;
}

export async function deleteMaterial(id) {
  const [result] = await db.query("DELETE FROM materials WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// Key points
export async function getKeyPointsByMaterial(materialId) {
  const [rows] = await db.query(
    "SELECT * FROM material_key_points WHERE material_id = ? ORDER BY sort_order ASC",
    [materialId]
  );
  return rows;
}
