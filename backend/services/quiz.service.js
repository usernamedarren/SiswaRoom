import * as QuizModel from "../models/quiz.models.js";

export async function fetchAllQuizzes() {
  return await QuizModel.getAllQuizzes();
}

export async function fetchQuizById(id) {
  const quiz = await QuizModel.getQuizById(id);
  if (!quiz) return null;

  const questions = await QuizModel.getQuestionsByQuiz(id);
  const questionsWithOptions = await Promise.all(
    questions.map(async (q) => ({
      ...q,
      options: await QuizModel.getOptionsByQuestion(q.id)
    }))
  );

  return {
    ...quiz,
    total_questions: questions.length || quiz.total_questions || 0,
    questions: questionsWithOptions
  };
}

export async function fetchQuizzesByCourse(courseId) {
  return await QuizModel.getQuizzesByCourse(courseId);
}

export async function createNewQuiz(courseId, title, shortDescription, totalQuestions, durationMinutes, passingScore) {
  return await QuizModel.createQuiz(courseId, title, shortDescription, totalQuestions, durationMinutes, passingScore);
}

export async function updateExistingQuiz(id, title, shortDescription, totalQuestions, durationMinutes, passingScore) {
  return await QuizModel.updateQuiz(id, title, shortDescription, totalQuestions, durationMinutes, passingScore);
}

export async function deleteExistingQuiz(id) {
  return await QuizModel.deleteQuiz(id);
}
