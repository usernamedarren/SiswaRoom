import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getDashboardSummary,
  getUserStats,
  getUpcomingClasses,
  getLatestQuizResults,
  getProgress
} from "../controllers/dashboardController.js";

const router = express.Router();

// Public routes
router.get("/summary", getDashboardSummary);

// Protected routes
router.use(protect);
router.get("/user-stats", getUserStats);
router.get("/classes", getUpcomingClasses);
router.get("/quiz-results", getLatestQuizResults);
router.get("/progress", getProgress);

export default router;
