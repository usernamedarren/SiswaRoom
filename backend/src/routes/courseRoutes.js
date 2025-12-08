import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getUserCourses,
  getAvailableCourses,
  enrollCourse,
  unenrollCourse,
  getCourseDetail,
  getCourseSchedules
} from "../controllers/courseController.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Get user's enrolled courses
router.get("/", getUserCourses);

// Get available courses for enrollment
router.get("/available/list", getAvailableCourses);

// Get specific course details
router.get("/:id", getCourseDetail);

// Get course schedules
router.get("/:id/schedules", getCourseSchedules);

// Enroll in course
router.post("/:id/enroll", enrollCourse);

// Unenroll from course
router.delete("/:id/unenroll", unenrollCourse);

export default router;
