import * as MaterialService from "../services/material.service.js";

export async function getMaterials(req, res) {
  try {
    const { course_id } = req.query;

    if (!course_id) {
      return res.status(400).json({ message: "course_id is required" });
    }

    const normalizedId = String(course_id).startsWith("course-")
      ? String(course_id).replace("course-", "")
      : course_id;
    const materials = await MaterialService.fetchMaterialsByCourse(normalizedId);
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch materials", error: err.message });
  }
}

export async function getMaterialById(req, res) {
  try {
    const { id } = req.params;
    const material = await MaterialService.fetchMaterialById(id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }
    res.json(material);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch material", error: err.message });
  }
}

export async function createMaterial(req, res) {
  try {
    const { course_id, title, short_description, full_description, video_url } = req.body;

    if (!course_id || !title) {
      return res.status(400).json({ message: "course_id and title are required" });
    }

    const materialId = await MaterialService.createNewMaterial(
      course_id,
      title,
      short_description,
      full_description,
      video_url
    );
    const material = await MaterialService.fetchMaterialById(materialId);

    res.status(201).json({
      message: "Material created successfully",
      material
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create material", error: err.message });
  }
}

export async function updateMaterial(req, res) {
  try {
    const { id } = req.params;
    const { title, short_description, full_description, video_url } = req.body;

    const success = await MaterialService.updateExistingMaterial(
      id,
      title,
      short_description,
      full_description,
      video_url
    );
    if (!success) {
      return res.status(404).json({ message: "Material not found" });
    }

    const material = await MaterialService.fetchMaterialById(id);
    res.json({ message: "Material updated successfully", material });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
}

export async function deleteMaterial(req, res) {
  try {
    const { id } = req.params;

    const success = await MaterialService.deleteExistingMaterial(id);
    if (!success) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.json({ message: "Material deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
}
