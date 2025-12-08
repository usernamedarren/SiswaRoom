import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getQuizzes,
  getQuizDetail,
  startQuiz,
  submitQuiz,
  getUserQuizResults,
  getQuizResult
} from "../controllers/quizController.js";

const router = express.Router();

// Public routes
router.get("/", getQuizzes);
router.get("/:id", getQuizDetail);

// Protected routes
router.post("/:id/start", protect, startQuiz);
router.post("/results/:result_id/submit", protect, submitQuiz);
router.get("/results/me", protect, getUserQuizResults);
router.get("/results/:result_id", protect, getQuizResult);

export default router;
