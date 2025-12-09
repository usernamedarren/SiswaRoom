import { UserModel } from "../models/UserModel.js";

// Get all users (admin only)
export async function getUsers(req, res, next) {
  try {
    const users = await UserModel.getAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

// Get user by ID
export async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const user = await UserModel.getById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// Get users by role
export async function getUsersByRole(req, res, next) {
  try {
    const { role } = req.params;
    const [users] = await db.query(
      "SELECT * FROM users WHERE role = ? ORDER BY name ASC",
      [role]
    );
    res.json(users);
  } catch (err) {
    next(err);
  }
}

// Update user
export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    const result = await UserModel.update(id, { name, email, role });
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    
    res.json({ message: "User berhasil diperbarui" });
  } catch (err) {
    next(err);
  }
}

// Delete user
export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    
    const result = await UserModel.delete(id);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    
    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    next(err);
  }
}
