import express from "express";
import {
  listMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial
} from "../controllers/materialController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET all materials (optional filter by topic_id)
router.get("/", listMaterials);

// GET single material
router.get("/:id", getMaterial);

// POST create material
router.post("/", authMiddleware, createMaterial);

// PUT update material
router.put("/:id", authMiddleware, updateMaterial);

// DELETE material
router.delete("/:id", authMiddleware, deleteMaterial);

export default router;
