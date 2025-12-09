import express from "express";
import {
  getSubjects,
  getSubjectDetail,
  getSubjectMaterials,
  createSubject,
  updateSubject,
  deleteSubject
} from "../controllers/subjectController.js";

import { protect, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getSubjects);
router.get("/:id", getSubjectDetail);
router.get("/:id/materials", getSubjectMaterials);

// Protected routes (teacher/admin only)
router.post("/", protect, requireRole("teacher", "admin"), createSubject);
router.put("/:id", protect, requireRole("teacher", "admin"), updateSubject);
router.delete("/:id", protect, requireRole("teacher", "admin"), deleteSubject);

export default router;
