import { db } from "../config/db.js";

export async function getAllUsers() {
  const [rows] = await db.query("SELECT id, email, full_name, role, created_at FROM users");
  return rows;
}

export async function getUserById(id) {
  const [rows] = await db.query("SELECT id, email, full_name, role, created_at FROM users WHERE id = ?", [id]);
  return rows[0] || null;
}

export async function getUserByEmail(email) {
  const [rows] = await db.query(
    "SELECT id, email, password, full_name, role, created_at FROM users WHERE email = ?", 
    [email]
  );
  return rows[0] || null;
}

export async function createUser(email, passwordHash, fullName, role) {
  const [result] = await db.query(
    "INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)",
    [email, passwordHash, fullName, role]
  );
  return result.insertId;
}

export async function updateUser(id, updates) {
  const fields = [];
  const values = [];
  
  if (updates.email) {
    fields.push("email = ?");
    values.push(updates.email);
  }
  if (updates.full_name) {
    fields.push("full_name = ?");
    values.push(updates.full_name);
  }
  
  values.push(id);
  
  const [result] = await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
  return result.affectedRows > 0;
}