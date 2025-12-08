import express from "express";
import {
  getQuestions,
  getQuestionById,
  getSubjectQuestions
} from "../controllers/questionController.js";

const router = express.Router();

router.get("/", getQuestions);
router.get("/:id", getQuestionById);
router.get("/subject/:subject_id", getSubjectQuestions);

export default router;
