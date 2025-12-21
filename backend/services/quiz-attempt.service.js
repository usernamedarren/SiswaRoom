import * as QuizAttemptModel from "../models/quiz-attempt.models.js";
import * as QuizModel from "../models/quiz.models.js";

export async function fetchAttemptById(id) {
  const attempt = await QuizAttemptModel.getAttemptById(id);
  if (!attempt) return null;

  const answers = await QuizAttemptModel.getAnswersByAttempt(id);
  return {
    ...attempt,
    answers
  };
}

export async function fetchAttemptsByQuiz(quizId) {
  return await QuizAttemptModel.getAttemptsByQuiz(quizId);
}

export async function fetchAttemptsByStudent(studentId) {
  return await QuizAttemptModel.getAttemptsByStudent(studentId);
}

export async function createNewAttempt(quizId, studentId) {
  return await QuizAttemptModel.createAttempt(quizId, studentId);
}

export async function submitAnswer(attemptId, questionId, selectedOptionId) {
  return await QuizAttemptModel.createAnswer(attemptId, questionId, selectedOptionId);
}

export async function finishAndCalculateScore(attemptId) {
  const attempt = await QuizAttemptModel.getAttemptById(attemptId);
  if (!attempt) throw new Error("Attempt not found");

  const quiz = await QuizModel.getQuizById(attempt.quiz_id);
  const questions = await QuizModel.getQuestionsByQuiz(attempt.quiz_id);
  const answers = await QuizAttemptModel.getAnswersByAttempt(attemptId);

  let correctCount = 0;
  for (const answer of answers) {
    const option = await QuizModel.getOptionById(answer.selected_option_id);
    if (option && option.is_correct) {
      correctCount++;
    }
  }

  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const passed = score >= (quiz.passing_score || 70);

  await QuizAttemptModel.finishAttempt(attemptId, score, passed);

  return { score, passed };
}
