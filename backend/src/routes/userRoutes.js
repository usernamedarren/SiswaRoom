import express from "express";
import { 
  getUsers, 
  getUserById,
  getUsersByRole,
  updateUser,
  deleteUser
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// All user routes require authentication and admin role
router.get("/", protect, requireRole("admin"), getUsers);
router.get("/:userId", protect, getUserById);
router.get("/role/:role", protect, requireRole("admin"), getUsersByRole);
router.put("/:userId", protect, requireRole("admin"), updateUser);
router.delete("/:userId", protect, requireRole("admin"), deleteUser);

export default router;
