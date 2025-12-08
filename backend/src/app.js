import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Default allowed origins
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:4000",
      "http://siswaroom.online",
      "https://siswaroom.online",
      "http://api.siswaroom.online",
      "https://api.siswaroom.online",
      "http://192.168.4.247:8088",
      "http://192.168.4.247:4000"
    ];
    
    // Allow requests with no origin (like mobile apps, curl, or direct API calls)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"]
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "🚀 SiswaRoom API running",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    success: true,
    message: "✅ Server is healthy",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use("/api", apiRoutes);

// Error handlers - must be last
app.use(notFound);
app.use(errorHandler);

export default app;
