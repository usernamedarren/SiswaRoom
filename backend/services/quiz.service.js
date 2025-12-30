import * as QuizModel from "../models/quiz.models.js";
import { db } from "../config/db.js";

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

export async function createQuizWithQuestions(payload) {
  const { course_id, title, short_description, total_questions, duration_minutes, passing_score, questions } = payload;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const quizId = await QuizModel.insertQuizTx(
      conn,
      course_id,
      title,
      short_description,
      total_questions,
      duration_minutes,
      passing_score
    );

    if (Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const qId = await QuizModel.insertQuestionTx(
          conn,
          quizId,
          q.question_text,
          q.explanation || "",
          q.sort_order || i + 1
        );

        if (Array.isArray(q.options)) {
          for (let j = 0; j < q.options.length; j++) {
            const o = q.options[j];
            await QuizModel.insertOptionTx(
              conn,
              qId,
              o.option_text,
              !!o.is_correct,
              o.sort_order || j + 1
            );
          }
        }
      }
    }

    // sync total_questions to actual count
    await conn.query("UPDATE quizzes SET total_questions = ? WHERE id = ?", [questions?.length || total_questions || 0, quizId]);

    await conn.commit();
    return quizId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateExistingQuiz(id, title, shortDescription, totalQuestions, durationMinutes, passingScore) {
  return await QuizModel.updateQuiz(id, title, shortDescription, totalQuestions, durationMinutes, passingScore);
}

export async function deleteExistingQuiz(id) {
  return await QuizModel.deleteQuiz(id);
}
