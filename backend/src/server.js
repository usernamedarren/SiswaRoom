import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;

// Start server immediately (DB retry happens in db.js)
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n✅ SiswaRoom API running on port ${PORT}`);
  console.log(`📍 Docker internal: http://localhost:${PORT}`);
  console.log(`🔗 Nginx proxy: http://backend:${PORT}\n`);
});

// Handle server errors
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Error: Port ${PORT} already in use`);
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
