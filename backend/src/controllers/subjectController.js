import db from "../config/db.js";
import { SubjectModel } from "../models/SubjectModel.js";
import { MaterialModel } from "../models/MaterialModel.js";

// GET /api/subjects - Get all subjects
export async function getSubjects(req, res, next) {
  try {
    const subjects = await SubjectModel.getAll();
    res.json({
      success: true,
      data: subjects
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/subjects/:id - Get single subject
export async function getSubjectDetail(req, res, next) {
  try {
    const { id } = req.params;
    const subject = await SubjectModel.getById(id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Kursus tidak ditemukan"
      });
    }

    res.json({
      success: true,
      data: subject
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/subjects/:id/materials - Get materials for subject
export async function getSubjectMaterials(req, res, next) {
  try {
    const { id } = req.params;
    const materials = await MaterialModel.getAll();
    res.json({
      success: true,
      data: materials
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/subjects - Get all subjects
export async function getSubjects(req, res, next) {
  try {
    const subjects = await SubjectModel.getAll();
    res.json({
      success: true,
      data: subjects
    });
  } catch (err) {
    next(err);
  }
}
export async function createSubject(req, res, next) {
  try {
    const { name, description } = req.body;
    const teacher_id = req.user.id;

    if (req.user.role === "student") {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk membuat mata pelajaran"
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Nama mata pelajaran wajib diisi"
      });
    }

    const [result] = await db.query(
      `INSERT INTO subjects (name, description, teacher_id)
       VALUES (?, ?, ?)`,
      [name, description || null, teacher_id]
    );

    res.status(201).json({
      success: true,
      message: "Mata pelajaran berhasil dibuat",
      data: { id: result.insertId, name, description, teacher_id }
    });
  } catch (err) {
    next(err);
  }
}

    const subject = await SubjectModel.create({
      name,
      description,
      category,
      level: level || "beginner",
      teacher_id,
      price: price || 0,
      max_students: max_students || 30
    });

    res.status(201).json({
      success: true,
      message: "Kursus berhasil dibuat",
      data: subject
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/subjects/:id (Teacher/Admin only)
export async function updateSubject(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, category, level, price, max_students } = req.body;

    const subject = await SubjectModel.getById(id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Kursus tidak ditemukan"
      });
    }

    // Hanya pemilik atau admin yang bisa update
    if (req.user.role === "student" || (req.user.role === "teacher" && subject.teacher_id !== req.user.user_id)) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk mengubah kursus ini"
      });
    }

    const updated = await SubjectModel.update(id, {
      name,
      description,
      category,
      level,
      price,
      max_students
    });

    res.json({
      success: true,
      message: "Kursus berhasil diperbarui",
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

