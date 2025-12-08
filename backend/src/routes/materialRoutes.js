import express from "express";
import {
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial
} from "../controllers/materialController.js";

const router = express.Router();

// GET single material
router.get("/:id", getMaterial);

export default router;
