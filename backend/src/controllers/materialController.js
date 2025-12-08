import { MaterialModel } from "../models/MaterialModel.js";

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

// POST /api/subjects/:subjectId/materials - Create material
export async function createMaterial(req, res, next) {
  try {
    const { subjectId } = req.params;
    const { title, description, content, content_type, file_url, video_url, order } = req.body;

    if (!title || !content_type) {
      return res.status(400).json({
        success: false,
        message: "Judul dan tipe konten wajib diisi"
      });
    }

    const material = await MaterialModel.create({
      subject_id: subjectId,
      title,
      description,
      content,
      content_type,
      file_url,
      video_url,
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
    const { title, description, content, content_type, file_url, video_url, order } = req.body;

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
      file_url,
      video_url,
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
