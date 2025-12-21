import { db } from "../config/db.js";

export async function getAttemptById(id) {
  const [rows] = await db.query("SELECT * FROM quiz_attempts WHERE id = ?", [id]);
  return rows[0] || null;
}

export async function getAttemptsByQuiz(quizId) {
  const [rows] = await db.query("SELECT * FROM quiz_attempts WHERE quiz_id = ? ORDER BY started_at DESC", [quizId]);
  return rows;
}

export async function getAttemptsByStudent(studentId) {
  const [rows] = await db.query("SELECT * FROM quiz_attempts WHERE student_id = ? ORDER BY started_at DESC", [studentId]);
  return rows;
}

export async function createAttempt(quizId, studentId) {
  const [result] = await db.query(
    "INSERT INTO quiz_attempts (quiz_id, student_id) VALUES (?, ?)",
    [quizId, studentId]
  );
  return result.insertId;
}

export async function finishAttempt(id, score, passed) {
  const [result] = await db.query(
    "UPDATE quiz_attempts SET score = ?, passed = ?, finished_at = NOW() WHERE id = ?",
    [score, passed, id]
  );
  return result.affectedRows > 0;
}

// Answers
export async function getAnswersByAttempt(attemptId) {
  const [rows] = await db.query("SELECT * FROM quiz_answers WHERE attempt_id = ?", [attemptId]);
  return rows;
}

export async function createAnswer(attemptId, questionId, selectedOptionId) {
  const [result] = await db.query(
    `INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE selected_option_id = VALUES(selected_option_id)`,
    [attemptId, questionId, selectedOptionId]
  );
  return result.insertId || result.insertId === 0 ? result.insertId : null;
}

export async function getStudentAnswerForQuestion(attemptId, questionId) {
  const [rows] = await db.query(
    "SELECT * FROM quiz_answers WHERE attempt_id = ? AND question_id = ?",
    [attemptId, questionId]
  );
  return rows[0] || null;
}
