import * as UserService from "../services/user.service.js";
import { verifyToken } from "../services/user.service.js";

export async function getUsers(req, res) {
  try {
    const users = await UserService.fetchUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await UserService.fetchUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
}

export async function register(req, res) {
  try {
    const { email, password, full_name, role = "siswa" } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ message: "Email, password, and full_name are required" });
    }

    const existingUser = await UserService.fetchUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const userId = await UserService.createNewUser(email, password, full_name, role);
    const user = await UserService.fetchUserById(userId);
    const token = UserService.generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await UserService.authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = UserService.generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const success = await UserService.updateUserProfile(id, updates);
    if (!success) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await UserService.fetchUserById(id);
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
}

export async function me(req, res) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = verifyToken(token);
    if (!payload?.id) return res.status(401).json({ message: "Invalid token" });

    const user = await UserService.fetchUserById(payload.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ id: user.id, email: user.email, full_name: user.full_name, name: user.full_name, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
}