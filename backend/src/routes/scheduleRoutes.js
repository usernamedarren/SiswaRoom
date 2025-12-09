import express from "express";
import { protect, requireRole } from "../middlewares/authMiddleware.js";
import {
  getSchedules,
  getScheduleDetail,
  createSchedule,
  updateSchedule,
  deleteSchedule
} from "../controllers/scheduleController.js";

const router = express.Router();

// Public routes
router.get("/", getSchedules);
router.get("/:id", getScheduleDetail);

// Protected routes (admin/teacher only)
router.post("/", protect, requireRole("admin", "teacher"), createSchedule);
router.put("/:id", protect, requireRole("admin", "teacher"), updateSchedule);
router.delete("/:id", protect, requireRole("admin", "teacher"), deleteSchedule);

export default router;
