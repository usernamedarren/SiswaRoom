import express from 'express';
import { sendMessage, getTopicHelp, explainConcept, checkHealth } from '../controllers/chatbot.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/chatbot/message:
 *   post:
 *     summary: Kirim pesan ke AI chatbot
 *     tags: [Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Jelaskan cara menyelesaikan persamaan kuadrat"
 *               conversationHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sender:
 *                       type: string
 *                       enum: [user, bot]
 *                     message:
 *                       type: string
 *     responses:
 *       200:
 *         description: Respons berhasil diperoleh
 *       400:
 *         description: Pesan tidak valid
 *       500:
 *         description: Server error
 */
router.post('/message', sendMessage);

/**
 * @swagger
 * /api/chatbot/topic-help:
 *   post:
 *     summary: Dapatkan bantuan untuk topik pembelajaran spesifik
 *     tags: [Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [topic]
 *             properties:
 *               topic:
 *                 type: string
 *                 example: "Matematika"
 *               subtopic:
 *                 type: string
 *                 example: "Persamaan Kuadrat"
 *     responses:
 *       200:
 *         description: Penjelasan topik berhasil diperoleh
 *       400:
 *         description: Parameter tidak valid
 *       500:
 *         description: Server error
 */
router.post('/topic-help', getTopicHelp);

/**
 * @swagger
 * /api/chatbot/explain:
 *   post:
 *     summary: Dapatkan penjelasan konsep pembelajaran
 *     tags: [Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [concept]
 *             properties:
 *               concept:
 *                 type: string
 *                 example: "Fotosintesis"
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 default: intermediate
 *     responses:
 *       200:
 *         description: Penjelasan konsep berhasil diperoleh
 *       400:
 *         description: Parameter tidak valid
 *       500:
 *         description: Server error
 */
router.post('/explain', explainConcept);

/**
 * @swagger
 * /api/chatbot/health:
 *   get:
 *     summary: Check status chatbot service
 *     tags: [Chatbot]
 *     responses:
 *       200:
 *         description: Service status
 */
router.get('/health', checkHealth);

export default router;
