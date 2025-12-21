import express from "express";
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz
} from "../controllers/quiz.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(authenticate);

/**
 * @swagger
 * /quizzes:
 *   get:
 *     summary: Get all quizzes (optionally filter by course)
 *     tags: [Quizzes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quiz'
 */
router.get("/", getQuizzes);

/**
 * @swagger
 * /quizzes:
 *   post:
 *     summary: Create new quiz
 *     tags: [Quizzes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [course_id, title]
 *             properties:
 *               course_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               short_description:
 *                 type: string
 *               total_questions:
 *                 type: integer
 *                 default: 0
 *               duration_minutes:
 *                 type: integer
 *                 default: 10
 *               passing_score:
 *                 type: integer
 *                 default: 70
 *     responses:
 *       201:
 *         description: Quiz created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 quiz:
 *                   $ref: '#/components/schemas/Quiz'
 */
router.post("/", createQuiz);

/**
 * @swagger
 * /quizzes/{id}:
 *   get:
 *     summary: Get quiz by ID with questions and options
 *     tags: [Quizzes]
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
 *         description: Quiz details with questions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       404:
 *         description: Quiz not found
 */
router.get("/:id", getQuizById);

/**
 * @swagger
 * /quizzes/{id}:
 *   put:
 *     summary: Update quiz
 *     tags: [Quizzes]
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
 *             properties:
 *               title:
 *                 type: string
 *               short_description:
 *                 type: string
 *               total_questions:
 *                 type: integer
 *               duration_minutes:
 *                 type: integer
 *               passing_score:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Quiz updated
 */
router.put("/:id", updateQuiz);

/**
 * @swagger
 * /quizzes/{id}:
 *   delete:
 *     summary: Delete quiz
 *     tags: [Quizzes]
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
 *         description: Quiz deleted
 */
router.delete("/:id", deleteQuiz);

export default router;
