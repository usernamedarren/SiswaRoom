import express from "express";
import {
  getUsers,
  getUserById,
  updateUser
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { db } from "../config/db.js";

const router = express.Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await db.getConnection();
    
    const [users] = await connection.query(
      "SELECT id, email, full_name, role, created_at FROM users WHERE id = ?",
      [userId]
    );
    
    connection.release();
    
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const user = users[0];
    res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      created_at: user.created_at
    });
  } catch (err) {
    console.error("[USERS/ME] error:", err);
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
});

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current authenticated user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "Updated Name"
 *               email:
 *                 type: string
 *                 example: "newemail@sekolah.id"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.patch("/me", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, email } = req.body;
    const connection = await db.getConnection();
    
    // Update user
    if (full_name || email) {
      const updates = [];
      const values = [];
      
      if (full_name) {
        updates.push("full_name = ?");
        values.push(full_name);
      }
      if (email) {
        updates.push("email = ?");
        values.push(email);
      }
      
      values.push(userId);
      
      await connection.query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        values
      );
    }
    
    // Get updated user
    const [users] = await connection.query(
      "SELECT id, email, full_name, role, created_at FROM users WHERE id = ?",
      [userId]
    );
    
    connection.release();
    
    const user = users[0];
    res.json({
      message: "User updated successfully",
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error("[USERS/ME PATCH] error:", err);
    res.status(500).json({ message: "Failed to update user", error: err.message });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get("/:id", getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@sekolah.id"
 *               full_name:
 *                 type: string
 *                 example: "Updated Name"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.put("/:id", updateUser);

export default router;
