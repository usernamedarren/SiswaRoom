import { db } from "../config/db.js";

export async function getAllCourses() {
  const [rows] = await db.query("SELECT * FROM courses");
  return rows;
}

export async function getCourseById(id) {
  const [rows] = await db.query("SELECT * FROM courses WHERE id = ?", [id]);
  return rows[0] || null;
}

export async function getCoursesByTeacher(teacherId) {
  const [rows] = await db.query("SELECT * FROM courses WHERE teacher_id = ?", [teacherId]);
  return rows;
}

export async function createCourse(name, description, teacherId) {
  const [result] = await db.query(
    "INSERT INTO courses (name, description, teacher_id) VALUES (?, ?, ?)",
    [name, description, teacherId]
  );
  return result.insertId;
}

export async function updateCourse(id, name, description) {
  const [result] = await db.query(
    "UPDATE courses SET name = ?, description = ? WHERE id = ?",
    [name, description, id]
  );
  return result.affectedRows > 0;
}

export async function deleteCourse(id) {
  const [result] = await db.query("DELETE FROM courses WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
