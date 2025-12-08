import express from "express";
import {
  getTopicsBySubject,
  getTopic,
  getTopicBySlug,
  getTopicsByCategory,
  createTopic,
  updateTopic,
  deleteTopic
} from "../controllers/topicController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Public routes
router.get("/subject/:subjectId", getTopicsBySubject);
router.get("/category/:category", getTopicsByCategory);
router.get("/subject/:subjectId/slug/:slug", getTopicBySlug);
router.get("/:id", getTopic);

// Protected routes (teacher/admin only)
router.post("/", authMiddleware, roleMiddleware("teacher", "admin"), createTopic);
router.put("/:id", authMiddleware, roleMiddleware("teacher", "admin"), updateTopic);
router.delete("/:id", authMiddleware, roleMiddleware("teacher", "admin"), deleteTopic);

export default router;
