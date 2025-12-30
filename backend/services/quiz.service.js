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

export async function updateQuizWithQuestions(id, payload) {
  const { title, short_description, duration_minutes, passing_score, questions } = payload;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Update basic quiz info
    await conn.query(
      "UPDATE quizzes SET title = ?, short_description = ?, duration_minutes = ?, passing_score = ? WHERE id = ?",
      [title, short_description || "", duration_minutes, passing_score, id]
    );

    if (Array.isArray(questions)) {
      // Get existing questions
      const [existingQuestions] = await conn.query(
        "SELECT id FROM quiz_questions WHERE quiz_id = ? ORDER BY sort_order ASC",
        [id]
      );

      // Update or delete existing questions
      for (let i = 0; i < existingQuestions.length; i++) {
        if (i < questions.length) {
          const q = questions[i];
          await QuizModel.updateQuestionTx(
            conn,
            existingQuestions[i].id,
            q.question_text,
            q.explanation || "",
            q.sort_order || i + 1
          );

          // Update options for this question
          const [existingOptions] = await conn.query(
            "SELECT id FROM quiz_options WHERE question_id = ? ORDER BY sort_order ASC",
            [existingQuestions[i].id]
          );

          const opts = Array.isArray(q.options) ? q.options : [];
          for (let j = 0; j < existingOptions.length; j++) {
            if (j < opts.length) {
              const o = opts[j];
              await QuizModel.updateOptionTx(
                conn,
                existingOptions[j].id,
                o.option_text,
                !!o.is_correct,
                o.sort_order || j + 1
              );
            } else {
              // Delete excess options
              await QuizModel.deleteOptionTx(conn, existingOptions[j].id);
            }
          }

          // Add new options if needed
          for (let j = existingOptions.length; j < opts.length; j++) {
            const o = opts[j];
            await QuizModel.insertOptionTx(
              conn,
              existingQuestions[i].id,
              o.option_text,
              !!o.is_correct,
              o.sort_order || j + 1
            );
          }
        } else {
          // Delete excess questions
          await QuizModel.deleteQuestionTx(conn, existingQuestions[i].id);
        }
      }

      // Add new questions if needed
      for (let i = existingQuestions.length; i < questions.length; i++) {
        const q = questions[i];
        const qId = await QuizModel.insertQuestionTx(
          conn,
          id,
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
    await conn.query(
      "UPDATE quizzes SET total_questions = (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = ?) WHERE id = ?",
      [id, id]
    );

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function deleteExistingQuiz(id) {
  return await QuizModel.deleteQuiz(id);
}
