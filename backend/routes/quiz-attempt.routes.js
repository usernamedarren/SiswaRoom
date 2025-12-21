import express from "express";
import {
  getQuizAttempts,
  getAttemptById,
  createAttempt,
  submitAnswer,
  finishAttempt
} from "../controllers/quiz-attempt.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(authenticate);

/**
 * @swagger
 * /quiz-attempts:
 *   get:
 *     summary: Get quiz attempts (filter by quiz_id or student_id)
 *     tags: [Quiz Attempts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: quiz_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of quiz attempts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuizAttempt'
 */
router.get("/", getQuizAttempts);

/**
 * @swagger
 * /quiz-attempts:
 *   post:
 *     summary: Create new quiz attempt
 *     tags: [Quiz Attempts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quiz_id, student_id]
 *             properties:
 *               quiz_id:
 *                 type: integer
 *               student_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Quiz attempt created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 attempt:
 *                   $ref: '#/components/schemas/QuizAttempt'
 */
router.post("/", createAttempt);

/**
 * @swagger
 * /quiz-attempts/{id}:
 *   get:
 *     summary: Get quiz attempt by ID
 *     tags: [Quiz Attempts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quiz attempt details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizAttempt'
 */
router.get("/:id", getAttemptById);

/**
 * @swagger
 * /quiz-attempts/{id}/answers:
 *   post:
 *     summary: Submit answer for a question
 *     tags: [Quiz Attempts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question_id, selected_option_id]
 *             properties:
 *               question_id:
 *                 type: integer
 *               selected_option_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Answer submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 answer_id:
 *                   type: integer
 */
router.post("/:id/answers", submitAnswer);

/**
 * @swagger
 * /quiz-attempts/{id}/finish:
 *   post:
 *     summary: Finish quiz attempt and calculate score
 *     tags: [Quiz Attempts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quiz completed with score
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 score:
 *                   type: integer
 *                 passed:
 *                   type: boolean
 */
router.post("/:id/finish", finishAttempt);

export default router;
