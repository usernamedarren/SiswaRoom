import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true
});

// Test connection on startup
pool.getConnection((err, conn) => {
  if (err) {
    console.error("❌ MySQL connection error:", err.message);
    console.error("   Code:", err.code);
    console.error("   Host:", process.env.DB_HOST);
    console.error("   Port:", process.env.DB_PORT);
    console.error("   User:", process.env.DB_USER);
    console.error("   Database:", process.env.DB_NAME);
    console.error("   Full error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed.");
    }
    if (err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR") {
      console.error("Database had a fatal error.");
    }
    if (err.code === "PROTOCOL_ENQUEUE_AFTER_CLOSE") {
      console.error("Database connection unexpectedly closed.");
    }
  } else {
    console.log("✅ MySQL connected successfully as id", conn.threadId);
    conn.release();
  }
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("❌ MySQL pool error:", err);
});

export default pool.promise();
