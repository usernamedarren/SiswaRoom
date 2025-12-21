import bcrypt from 'bcryptjs';

// Generate bcrypt hash for password "password"
async function generateHash() {
  const password = "password";
  const hash = await bcrypt.hash(password, 10);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  console.log(`\nUse this hash in your SQL dump for all users.`);
}

generateHash().catch(err => console.error(err));
