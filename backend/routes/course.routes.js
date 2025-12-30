import express from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
} from "../controllers/course.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { db } from "../config/db.js";

const router = express.Router();

function ensureTeacherOrAdmin(req, res, next) {
  const role = req.user?.role?.toLowerCase() || "";
  if (!["admin", "teacher", "guru"].includes(role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

/**
 * @swagger
 * /courses/mine:
 *   get:
 *     summary: Get courses for current user
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized
 */
router.get("/mine", authenticate, async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    // Get all courses with teacher info
    const [courses] = await connection.query(
      `SELECT c.id, c.name, c.description, c.teacher_id, u.full_name as teacher_name
       FROM courses c
       LEFT JOIN users u ON c.teacher_id = u.id
       ORDER BY c.name`
    );
    
    connection.release();
    
    // Add course_id and course_name for frontend compatibility
    const formattedCourses = courses.map(course => ({
      course_id: `course-${course.id}`,
      course_name: course.name,
      id: course.id,
      name: course.name,
      teacher_id: course.teacher_id,
      teacher_name: course.teacher_name || "Guru",
      description: course.description || ""
    }));
    
    res.json(formattedCourses);
  } catch (err) {
    console.error("[COURSES/MINE] error:", err);
    res.status(500).json({ message: "Failed to fetch courses", error: err.message });
  }
});

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 */
router.get("/", getCourses);

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create new course
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, teacher_id]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               teacher_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Course created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 */
router.post("/", authenticate, ensureTeacherOrAdmin, createCourse);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
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
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
router.get("/:id", getCourseById);

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update course
 *     tags: [Courses]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course updated
 */
router.put("/:id", authenticate, ensureTeacherOrAdmin, updateCourse);

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete course
 *     tags: [Courses]
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
 *         description: Course deleted
 */
router.delete("/:id", authenticate, ensureTeacherOrAdmin, deleteCourse);

export default router;
