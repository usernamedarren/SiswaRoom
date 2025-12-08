import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`\n✅ SiswaRoom API running on port ${PORT}`);
  console.log(`📍 Endpoint: http://localhost:${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api\n`);
});

// Handle server errors
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Error: Port ${PORT} already in use`);
    console.error("   Try killing the process: lsof -i :4000");
  } else {
    console.error("❌ Server error:", err.message);
  }
  process.exit(1);
});

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});
