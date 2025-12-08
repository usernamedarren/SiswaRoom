import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Log connection details
console.log("[DB] Connecting to MySQL with config:");
console.log("   Host:", process.env.DB_HOST);
console.log("   Port:", process.env.DB_PORT);
console.log("   User:", process.env.DB_USER);
console.log("   Database:", process.env.DB_NAME);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  connectTimeout: 10000,
  waitForConnectionsMillis: 5000
});

// Test connection on startup with retry
let retryCount = 0;
const maxRetries = 5;

function testConnection() {
  pool.getConnection((err, conn) => {
    if (err) {
      retryCount++;
      console.error(`❌ MySQL connection error (Attempt ${retryCount}/${maxRetries}):`, err.code);
      console.error("   Message:", err.message);
      console.error("   Host:", process.env.DB_HOST);
      console.error("   Port:", process.env.DB_PORT);
      console.error("   User:", process.env.DB_USER);
      console.error("   Database:", process.env.DB_NAME);
      
      if (retryCount < maxRetries) {
        console.log(`   Retrying in 3 seconds...`);
        setTimeout(testConnection, 3000);
      } else {
        console.error("❌ Failed to connect after", maxRetries, "attempts");
      }
    } else {
      console.log("✅ MySQL connected successfully as id", conn.threadId);
      conn.release();
    }
  });
}

// Wait 2 seconds before attempting connection (give MySQL time to start)
setTimeout(testConnection, 2000);

// Handle pool errors
pool.on("error", (err) => {
  console.error("❌ MySQL pool error:", err);
});

export default pool.promise();
