import { db } from "../config/db.js";

export async function getLibraryItemById(id) {
  const [rows] = await db.query(
    `SELECT li.*, c.name AS course_name
     FROM library_items li
     LEFT JOIN courses c ON c.id = li.course_id
     WHERE li.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function getLibraryItems(courseId) {
  let query =
    `SELECT li.*, c.name AS course_name
     FROM library_items li
     LEFT JOIN courses c ON c.id = li.course_id`;
  const params = [];

  if (courseId) {
    query += " WHERE li.course_id = ?";
    params.push(courseId);
  }

  query += " ORDER BY li.created_at DESC";

  const [rows] = await db.query(query, params);
  return rows;
}

export async function createLibraryItem(title, type, shortDescription, courseId, fileUrl) {
  const [result] = await db.query(
    "INSERT INTO library_items (title, type, short_description, course_id, file_url) VALUES (?, ?, ?, ?, ?)",
    [title, type, shortDescription, courseId, fileUrl]
  );
  return result.insertId;
}

export async function updateLibraryItem(id, title, type, shortDescription, fileUrl) {
  const [result] = await db.query(
    "UPDATE library_items SET title = ?, type = ?, short_description = ?, file_url = ? WHERE id = ?",
    [title, type, shortDescription, fileUrl, id]
  );
  return result.affectedRows > 0;
}

export async function deleteLibraryItem(id) {
  const [result] = await db.query("DELETE FROM library_items WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
