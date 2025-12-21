import * as QuizAttemptService from "../services/quiz-attempt.service.js";

export async function getQuizAttempts(req, res) {
  try {
    const { quiz_id, student_id } = req.query;
    const currentUserId = req.user?.id;

    // If student_id provided in query, use that (for admin/teacher), otherwise use current user
    const targetStudentId = student_id || currentUserId;

    if (!quiz_id && !targetStudentId) {
      return res.status(400).json({ message: "Provide quiz_id or student_id" });
    }

    let attempts;
    if (quiz_id && targetStudentId) {
      // Filter by both quiz and student
      const allAttempts = await QuizAttemptService.fetchAttemptsByQuiz(quiz_id);
      attempts = allAttempts.filter(a => String(a.student_id) === String(targetStudentId));
    } else if (quiz_id) {
      attempts = await QuizAttemptService.fetchAttemptsByQuiz(quiz_id);
    } else {
      attempts = await QuizAttemptService.fetchAttemptsByStudent(targetStudentId);
    }

    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attempts", error: err.message });
  }
}

export async function getAttemptById(req, res) {
  try {
    const { id } = req.params;
    const attempt = await QuizAttemptService.fetchAttemptById(id);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    if (attempt.student_id !== req.user?.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(attempt);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attempt", error: err.message });
  }
}

export async function createAttempt(req, res) {
  try {
    const { quiz_id } = req.body;
    const studentId = req.user?.id;

    if (!quiz_id || !studentId) {
      return res.status(400).json({ message: "quiz_id is required" });
    }

    const attemptId = await QuizAttemptService.createNewAttempt(quiz_id, studentId);
    const attempt = await QuizAttemptService.fetchAttemptById(attemptId);

    res.status(201).json({
      message: "Attempt created successfully",
      attempt
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create attempt", error: err.message });
  }
}

export async function submitAnswer(req, res) {
  try {
    const { id } = req.params;
    const { question_id, selected_option_id } = req.body;

    if (!question_id || !selected_option_id) {
      return res.status(400).json({ message: "question_id and selected_option_id are required" });
    }

    const attempt = await QuizAttemptService.fetchAttemptById(id);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });
    if (attempt.student_id !== req.user?.id) return res.status(403).json({ message: "Forbidden" });

    const answerId = await QuizAttemptService.submitAnswer(id, question_id, selected_option_id);
    res.status(201).json({
      message: "Answer submitted successfully",
      answer_id: answerId
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit answer", error: err.message });
  }
}

export async function finishAttempt(req, res) {
  try {
    const { id } = req.params;

    const attempt = await QuizAttemptService.fetchAttemptById(id);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });
    if (attempt.student_id !== req.user?.id) return res.status(403).json({ message: "Forbidden" });

    const result = await QuizAttemptService.finishAndCalculateScore(id);
    res.json({
      message: "Quiz completed",
      score: result.score,
      passed: result.passed
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to finish attempt", error: err.message });
  }
}
