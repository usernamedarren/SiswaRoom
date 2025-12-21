import crypto from 'crypto';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function migratePasswords() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    // Get all users
    const [users] = await connection.query('SELECT id, password_hash FROM users');
    
    for (const user of users) {
      // If password_hash is plain text (not hashed), hash it
      // Plain text "password" is typically short, hashed is 64 chars for SHA256
      if (user.password_hash && user.password_hash.length < 64) {
        const hashedPassword = hashPassword(user.password_hash);
        await connection.query('UPDATE users SET password_hash = ? WHERE id = ?', 
          [hashedPassword, user.id]);
        console.log(`Migrated user ${user.id}: ${user.password_hash} -> ${hashedPassword}`);
      }
    }
    
    console.log('✅ Password migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await connection.end();
  }
}

migratePasswords();
