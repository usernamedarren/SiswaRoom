import db from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateJWT.js";

// Register - Create new user
export async function register(req, res, next) {
  try {
    const { name, email, password, role = "student" } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Nama, email, dan password harus diisi" 
      });
    }

    // Check if email already exists
    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        message: "Email sudah terdaftar" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    const user = {
      user_id: result.insertId,
      name,
      email,
      role
    };

    const token = generateToken(user);

    res.status(201).json({
      message: "Registrasi berhasil",
      token,
      user
    });
  } catch (err) {
    next(err);
  }
}

// Login - Authenticate user
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email dan password harus diisi" 
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: "Email / password salah" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Email / password salah" });
    }

    const token = generateToken(user);
    res.json({
      message: "Login berhasil",
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

// Get current user profile
export async function me(req, res, next) {
  try {
    const [rows] = await db.query(
      "SELECT user_id, name, email, role, created_at FROM users WHERE user_id = ?",
      [req.user.user_id]
    );
    
    if (!rows[0]) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// Logout (token invalidation - implementasi di frontend)
export async function logout(req, res, next) {
  try {
    // Token invalidation bisa dihandle di frontend dengan menghapus token
    res.json({ message: "Logout berhasil" });
  } catch (err) {
    next(err);
  }
}
