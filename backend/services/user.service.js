import * as UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

export async function fetchUsers() {
  return await UserModel.getAllUsers();
}

export async function fetchUserById(id) {
  return await UserModel.getUserById(id);
}

export async function fetchUserByEmail(email) {
  return await UserModel.getUserByEmail(email);
}

export async function createNewUser(email, password, fullName, role) {
  const passwordHash = await hashPassword(password);
  return await UserModel.createUser(email, passwordHash, fullName, role);
}

export async function authenticateUser(email, password) {
  const user = await UserModel.getUserByEmail(email);
  if (!user) return null;

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.full_name,
    full_name: user.full_name,
    role: user.role
  };
}

export async function updateUserProfile(id, updates) {
  return await UserModel.updateUser(id, updates);
}

export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, SECRET_KEY, { expiresIn: JWT_EXPIRE });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch {
    return null;
  }
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}