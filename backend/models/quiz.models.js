import { db } from "../config/db.js";

export async function getAllQuizzes() {
  const [rows] = await db.query(
    `SELECT q.*, c.name AS course_name,
            (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS question_count
     FROM quizzes q
     LEFT JOIN courses c ON c.id = q.course_id
     ORDER BY q.created_at DESC`
  );
  return rows;
}

export async function getQuizById(id) {
  const [rows] = await db.query(
    `SELECT q.*, c.name AS course_name,
            (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS question_count
     FROM quizzes q
     LEFT JOIN courses c ON c.id = q.course_id
     WHERE q.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function getQuizzesByCourse(courseId) {
  const [rows] = await db.query(
    `SELECT q.*, c.name AS course_name,
            (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS question_count
     FROM quizzes q
     LEFT JOIN courses c ON c.id = q.course_id
     WHERE q.course_id = ?
     ORDER BY q.created_at DESC`,
    [courseId]
  );
  return rows;
}

export async function createQuiz(courseId, title, shortDescription, totalQuestions, durationMinutes, passingScore) {
  const [result] = await db.query(
    "INSERT INTO quizzes (course_id, title, short_description, total_questions, duration_minutes, passing_score) VALUES (?, ?, ?, ?, ?, ?)",
    [courseId, title, shortDescription, totalQuestions, durationMinutes, passingScore]
  );
  return result.insertId;
}

export async function updateQuiz(id, title, shortDescription, totalQuestions, durationMinutes, passingScore) {
  const [result] = await db.query(
    "UPDATE quizzes SET title = ?, short_description = ?, total_questions = ?, duration_minutes = ?, passing_score = ? WHERE id = ?",
    [title, shortDescription, totalQuestions, durationMinutes, passingScore, id]
  );
  return result.affectedRows > 0;
}

export async function deleteQuiz(id) {
  const [result] = await db.query("DELETE FROM quizzes WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// Insert helpers using provided connection (transaction)
export async function insertQuizTx(conn, courseId, title, shortDescription, totalQuestions, durationMinutes, passingScore) {
  const [result] = await conn.query(
    "INSERT INTO quizzes (course_id, title, short_description, total_questions, duration_minutes, passing_score) VALUES (?, ?, ?, ?, ?, ?)",
    [courseId, title, shortDescription, totalQuestions, durationMinutes, passingScore]
  );
  return result.insertId;
}

export async function insertQuestionTx(conn, quizId, questionText, explanation, sortOrder) {
  const [result] = await conn.query(
    "INSERT INTO quiz_questions (quiz_id, question_text, explanation, sort_order) VALUES (?, ?, ?, ?)",
    [quizId, questionText, explanation || "", sortOrder]
  );
  return result.insertId;
}

export async function insertOptionTx(conn, questionId, optionText, isCorrect, sortOrder) {
  const [result] = await conn.query(
    "INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES (?, ?, ?, ?)",
    [questionId, optionText, isCorrect ? 1 : 0, sortOrder]
  );
  return result.insertId;
}

// Questions
export async function getQuestionsByQuiz(quizId) {
  const [rows] = await db.query(
    "SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY sort_order ASC",
    [quizId]
  );
  return rows;
}

export async function getQuestionById(id) {
  const [rows] = await db.query("SELECT * FROM quiz_questions WHERE id = ?", [id]);
  return rows[0] || null;
}

// Options
export async function getOptionsByQuestion(questionId) {
  const [rows] = await db.query(
    "SELECT * FROM quiz_options WHERE question_id = ? ORDER BY sort_order ASC",
    [questionId]
  );
  return rows;
}

export async function getOptionById(id) {
  const [rows] = await db.query("SELECT * FROM quiz_options WHERE id = ?", [id]);
  return rows[0] || null;
}

// Update question
export async function updateQuestion(id, questionText, explanation, sortOrder) {
  const [result] = await db.query(
    "UPDATE quiz_questions SET question_text = ?, explanation = ?, sort_order = ? WHERE id = ?",
    [questionText, explanation || "", sortOrder, id]
  );
  return result.affectedRows > 0;
}

export async function updateQuestionTx(conn, id, questionText, explanation, sortOrder) {
  const [result] = await conn.query(
    "UPDATE quiz_questions SET question_text = ?, explanation = ?, sort_order = ? WHERE id = ?",
    [questionText, explanation || "", sortOrder, id]
  );
  return result.affectedRows > 0;
}

// Delete question (cascade deletes options)
export async function deleteQuestion(id) {
  await db.query("DELETE FROM quiz_options WHERE question_id = ?", [id]);
  const [result] = await db.query("DELETE FROM quiz_questions WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function deleteQuestionTx(conn, id) {
  await conn.query("DELETE FROM quiz_options WHERE question_id = ?", [id]);
  const [result] = await conn.query("DELETE FROM quiz_questions WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// Update option
export async function updateOption(id, optionText, isCorrect, sortOrder) {
  const [result] = await db.query(
    "UPDATE quiz_options SET option_text = ?, is_correct = ?, sort_order = ? WHERE id = ?",
    [optionText, isCorrect ? 1 : 0, sortOrder, id]
  );
  return result.affectedRows > 0;
}

export async function updateOptionTx(conn, id, optionText, isCorrect, sortOrder) {
  const [result] = await conn.query(
    "UPDATE quiz_options SET option_text = ?, is_correct = ?, sort_order = ? WHERE id = ?",
    [optionText, isCorrect ? 1 : 0, sortOrder, id]
  );
  return result.affectedRows > 0;
}

// Delete option
export async function deleteOption(id) {
  const [result] = await db.query("DELETE FROM quiz_options WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function deleteOptionTx(conn, id) {
  const [result] = await conn.query("DELETE FROM quiz_options WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
