import express from "express";
import authRoutes from "./authRoutes.js";
import subjectRoutes from "./subjectRoutes.js";
import materialRoutes from "./materialRoutes.js";
import questionRoutes from "./questionRoutes.js";
import quizRoutes from "./quizRoutes.js";
import scheduleRoutes from "./scheduleRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import courseRoutes from "./courseRoutes.js";
import topicRoutes from "./topicRoutes.js";
import userRoutes from "./userRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/subjects", subjectRoutes);
router.use("/materials", materialRoutes);
router.use("/questions", questionRoutes);
router.use("/quizzes", quizRoutes);
router.use("/schedules", scheduleRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/courses", courseRoutes);
router.use("/topics", topicRoutes);
router.use("/users", userRoutes);

export default router;
