import { MaterialModel } from "../models/MaterialModel.js";
import db from "../config/db.js";

// GET /api/materials - List all materials
export async function listMaterials(req, res, next) {
  try {
    const materials = await MaterialModel.getAll();
    res.json({ success: true, data: materials });
  } catch (err) {
    next(err);
  }
}

// GET /api/materials/:id - Get single material
export async function getMaterial(req, res, next) {
  try {
    const { id } = req.params;
    const material = await MaterialModel.getById(id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Materi tidak ditemukan"
      });
    }

    res.json({
      success: true,
      data: material
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/materials - Create material
export async function createMaterial(req, res, next) {
  try {
    const { title, description, content, content_type, order } = req.body;

    if (!title || !content_type) {
      return res.status(400).json({
        success: false,
        message: "title dan content_type wajib diisi"
      });
    }

    const material = await MaterialModel.create({
      title,
      description,
      content,
      content_type,
      order: order || 1,
      created_by: req.user.user_id
    });

    res.status(201).json({
      success: true,
      message: "Materi berhasil dibuat",
      data: material
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/materials/:id - Update material
export async function updateMaterial(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, content, content_type, order } = req.body;

    const material = await MaterialModel.getById(id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Materi tidak ditemukan"
      });
    }

    const updated = await MaterialModel.update(id, {
      title,
      description,
      content,
      content_type,
      order
    });

    res.json({
      success: true,
      message: "Materi berhasil diperbarui",
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/materials/:id - Delete material
export async function deleteMaterial(req, res, next) {
  try {
    const { id } = req.params;
    const material = await MaterialModel.getById(id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Materi tidak ditemukan"
      });
    }

    await MaterialModel.delete(id);

    res.json({
      success: true,
      message: "Materi berhasil dihapus"
    });
  } catch (err) {
    next(err);
  }
}
