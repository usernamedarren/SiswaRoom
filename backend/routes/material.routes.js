import express from "express";
import {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial
} from "../controllers/material.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply authentication to all material routes
router.use(authenticate);

function ensureTeacher(req, res, next) {
  const role = (req.user?.role || "").toLowerCase();
  if (["teacher", "guru", "admin"].includes(role)) return next();
  return res.status(403).json({ message: "Forbidden: Teacher or admin role required" });
}

/**
 * @swagger
 * /materials:
 *   get:
 *     summary: Get materials by course
 *     tags: [Materials]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of materials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Material'
 */
router.get("/", getMaterials);

/**
 * @swagger
 * /materials:
 *   post:
 *     summary: Create new material
 *     tags: [Materials]
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
 *               full_description:
 *                 type: string
 *               video_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Material created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 material:
 *                   $ref: '#/components/schemas/Material'
 */
router.post("/", ensureTeacher, createMaterial);

/**
 * @swagger
 * /materials/{id}:
 *   get:
 *     summary: Get material by ID
 *     tags: [Materials]
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
 *         description: Material details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 */
router.get("/:id", getMaterialById);

/**
 * @swagger
 * /materials/{id}:
 *   put:
 *     summary: Update material
 *     tags: [Materials]
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
 *               full_description:
 *                 type: string
 *               video_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Material updated
 */
router.put("/:id", ensureTeacher, updateMaterial);

/**
 * @swagger
 * /materials/{id}:
 *   delete:
 *     summary: Delete material
 *     tags: [Materials]
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
 *         description: Material deleted
 */
router.delete("/:id", ensureTeacher, deleteMaterial);

export default router;
