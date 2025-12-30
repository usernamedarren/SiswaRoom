import * as QuizService from "../services/quiz.service.js";
import { db } from "../config/db.js";

function roleIsAdmin(req) {
  return (req.user?.role || "").toLowerCase() === "admin";
}

async function ensureTeacherOwnsCourse(req, courseId) {
  if (!req.user?.id) return false;
  const [rows] = await db.query(
    "SELECT id FROM courses WHERE id = ? AND teacher_id = ?",
    [courseId, req.user.id]
  );
  return rows.length > 0;
}

export async function getQuizzes(req, res) {
  try {
    const { course_id } = req.query;

    let quizzes;
    if (course_id) {
      const normalizedId = String(course_id).startsWith("course-")
        ? String(course_id).replace("course-", "")
        : course_id;
      quizzes = await QuizService.fetchQuizzesByCourse(normalizedId);
    } else {
      quizzes = await QuizService.fetchAllQuizzes();
    }

    const normalized = quizzes.map((q) => ({
      ...q,
      total_questions: q.question_count ?? q.total_questions ?? 0
    }));

    res.json(normalized);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch quizzes", error: err.message });
  }
}

export async function getQuizById(req, res) {
  try {
    const { id } = req.params;
    const quiz = await QuizService.fetchQuizById(id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch quiz", error: err.message });
  }
}

export async function createQuiz(req, res) {
  try {
    const { course_id, title, short_description, total_questions, duration_minutes, passing_score } = req.body;

    if (!course_id || !title) {
      return res.status(400).json({ message: "course_id and title are required" });
    }

    const courseId = Number(course_id);
    if (!courseId || Number.isNaN(courseId)) {
      return res.status(400).json({ message: "course_id must be a valid number" });
    }

    if (req.user && !roleIsAdmin(req)) {
      const ok = await ensureTeacherOwnsCourse(req, courseId);
      if (!ok) return res.status(403).json({ message: "Forbidden: Course is not yours" });
    }

    const quizId = await QuizService.createNewQuiz(
      courseId,
      title,
      short_description,
      total_questions || 0,
      duration_minutes || 10,
      passing_score || 70
    );
    const quiz = await QuizService.fetchQuizById(quizId);

    res.status(201).json({
      message: "Quiz created successfully",
      quiz
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create quiz", error: err.message });
  }
}

export async function updateQuiz(req, res) {
  try {
    const { id } = req.params;
    const { title, short_description, total_questions, duration_minutes, passing_score } = req.body;

    const existing = await QuizService.fetchQuizById(id);
    if (!existing) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (req.user && !roleIsAdmin(req)) {
      const ok = await ensureTeacherOwnsCourse(req, existing.course_id);
      if (!ok) return res.status(403).json({ message: "Forbidden: Course is not yours" });
    }

    const success = await QuizService.updateExistingQuiz(
      id,
      title,
      short_description,
      total_questions,
      duration_minutes,
      passing_score
    );
    const quiz = await QuizService.fetchQuizById(id);
    res.json({ message: "Quiz updated successfully", quiz });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
}

export async function deleteQuiz(req, res) {
  try {
    const { id } = req.params;

    const existing = await QuizService.fetchQuizById(id);
    if (!existing) return res.status(404).json({ message: "Quiz not found" });

    if (req.user && !roleIsAdmin(req)) {
      const ok = await ensureTeacherOwnsCourse(req, existing.course_id);
      if (!ok) return res.status(403).json({ message: "Forbidden: Course is not yours" });
    }

    const success = await QuizService.deleteExistingQuiz(id);
    if (!success) return res.status(404).json({ message: "Quiz not found" });

    res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
}
