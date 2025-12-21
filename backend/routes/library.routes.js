import express from "express";
import {
  getLibraryItems,
  getLibraryItemById,
  createLibraryItem,
  updateLibraryItem,
  deleteLibraryItem
} from "../controllers/library.controller.js";

const router = express.Router();

/**
 * @swagger
 * /library:
 *   get:
 *     summary: Get library items by course
 *     tags: [Library]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course_id
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of library items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LibraryItem'
 */
router.get("/", getLibraryItems);

/**
 * @swagger
 * /library:
 *   post:
 *     summary: Create new library item
 *     tags: [Library]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, type, course_id, file_url]
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [ebook, catatan, bank_soal]
 *               short_description:
 *                 type: string
 *               course_id:
 *                 type: integer
 *               file_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Library item created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 item:
 *                   $ref: '#/components/schemas/LibraryItem'
 */
router.post("/", createLibraryItem);

/**
 * @swagger
 * /library/{id}:
 *   get:
 *     summary: Get library item by ID
 *     tags: [Library]
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
 *         description: Library item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LibraryItem'
 */
router.get("/:id", getLibraryItemById);

/**
 * @swagger
 * /library/{id}:
 *   put:
 *     summary: Update library item
 *     tags: [Library]
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
 *               type:
 *                 type: string
 *                 enum: [ebook, catatan, bank_soal]
 *               short_description:
 *                 type: string
 *               file_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Library item updated
 */
router.put("/:id", updateLibraryItem);

/**
 * @swagger
 * /library/{id}:
 *   delete:
 *     summary: Delete library item
 *     tags: [Library]
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
 *         description: Library item deleted
 */
router.delete("/:id", deleteLibraryItem);

export default router;
