import express from "express";
import {
  getQuestions,
  getQuestionById,
  getQuizQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from "../controllers/questionController.js";

const router = express.Router();

router.get("/", getQuestions);
router.get("/:id", getQuestionById);
router.get("/quiz/:quiz_id", getQuizQuestions);
router.post("/", createQuestion);
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

export default router;
