import express from "express";
import {
  getStudentsForIntegration,
  getCoursesForIntegration,
  getSchedulesForIntegration,
  getQuizzesForIntegration,
  syncGrades,
  integrationHealth
} from "../controllers/integrationController.js";

const router = express.Router();

/**
 * Middleware: Verify API Key for integration endpoints
 * Usage: Add header: X-API-Key: your-secret-key
 */
function verifyApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const validKeys = process.env.INTEGRATION_API_KEYS?.split(',') || ['demo-key-123'];

  if (!apiKey || !validKeys.includes(apiKey.trim())) {
    return res.status(401).json({
      success: false,
      error: "Invalid or missing API key",
      message: "Please provide valid X-API-Key header"
    });
  }

  console.log(`[INTEGRATION] Request from API key: ${apiKey.substring(0, 8)}...`);
  next();
}

// Public health check (no auth required)
router.get('/health', integrationHealth);

// Protected integration endpoints (require API key)
router.get('/students', verifyApiKey, getStudentsForIntegration);
router.get('/courses', verifyApiKey, getCoursesForIntegration);
router.get('/schedules', verifyApiKey, getSchedulesForIntegration);
router.get('/quizzes', verifyApiKey, getQuizzesForIntegration);
router.post('/sync-grades', verifyApiKey, syncGrades);

export default router;
