import express from "express";
import { login, register, me, logout } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", protect, me);
router.post("/logout", protect, logout);

export default router;
