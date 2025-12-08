import express from "express";
import {
  getSubjects,
  getSubjectDetail,
  getSubjectMaterials,
  getSubjectsByCategory,
  getCategories,
  createSubject,
  updateSubject
} from "../controllers/subjectController.js";

import { protect, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getSubjects);
router.get("/categories/list", getCategories);
router.get("/category/:category", getSubjectsByCategory);
router.get("/:id", getSubjectDetail);
router.get("/:id/materials", getSubjectMaterials);

// Protected routes (teacher/admin only)
router.post("/", protect, requireRole("teacher", "admin"), createSubject);
router.put("/:id", protect, requireRole("teacher", "admin"), updateSubject);

export default router;
