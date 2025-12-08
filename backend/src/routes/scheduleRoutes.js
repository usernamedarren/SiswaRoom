import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getSchedules,
  getUpcomingSchedules,
  getScheduleDetail,
  getCalendar
} from "../controllers/scheduleController.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/", getSchedules);
router.get("/upcoming", getUpcomingSchedules);
router.get("/calendar", getCalendar);
router.get("/:id", getScheduleDetail);

export default router;
