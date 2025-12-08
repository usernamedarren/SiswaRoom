import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Determine correct MySQL host
let dbHost = process.env.DB_HOST || "192.168.4.247";

// If running in Docker and host is localhost, use host.docker.internal or gateway
if (dbHost === "localhost" || dbHost === "127.0.0.1") {
  dbHost = "host.docker.internal"; // macOS/Windows Docker Desktop
}

// Log connection details
console.log("[DB] Connecting to MySQL with config:");
console.log("   Host:", dbHost);
console.log("   Port:", process.env.DB_PORT);
console.log("   User:", process.env.DB_USER);
console.log("   Database:", process.env.DB_NAME);

const pool = mysql.createPool({
  host: dbHost,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  connectTimeout: 15000
});

// Test connection on startup with retry
let retryCount = 0;
const maxRetries = 8;

function testConnection() {
  pool.getConnection((err, conn) => {
    if (err) {
      retryCount++;
      console.error(`❌ MySQL connection error (Attempt ${retryCount}/${maxRetries}): ${err.code}`);
      console.error("   Message:", err.message);
      
      if (retryCount < maxRetries) {
        console.log(`   Retrying in 3 seconds...`);
        setTimeout(testConnection, 3000);
      } else {
        console.error("❌ Failed to connect after", maxRetries, "attempts");
        console.error("   Possible solutions:");
        console.error("   1. Check MySQL is running: docker ps | grep mysql");
        console.error("   2. Check port 13306 is accessible");
        console.error("   3. Verify DB_HOST is correct (check: echo $DB_HOST)");
        console.error("   4. Check aPanel MySQL 'Allow external access' is YES");
      }
    } else {
      console.log("✅ MySQL connected successfully as id", conn.threadId);
      conn.release();
    }
  });
}

// Wait 2 seconds before attempting connection
setTimeout(testConnection, 2000);

// Handle pool errors
pool.on("error", (err) => {
  console.error("❌ MySQL pool error:", err.message);
});

export default pool.promise();
