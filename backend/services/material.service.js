import * as MaterialModel from "../models/material.models.js";

export async function fetchMaterialById(id) {
  const material = await MaterialModel.getMaterialById(id);
  if (!material) return null;

  const keyPoints = await MaterialModel.getKeyPointsByMaterial(id);
  return {
    ...material,
    key_points: keyPoints
  };
}

export async function fetchMaterialsByCourse(courseId) {
  return await MaterialModel.getMaterialsByCourse(courseId);
}

export async function createNewMaterial(courseId, title, shortDescription, fullDescription, videoUrl) {
  return await MaterialModel.createMaterial(courseId, title, shortDescription, fullDescription, videoUrl);
}

export async function updateExistingMaterial(id, title, shortDescription, fullDescription, videoUrl) {
  return await MaterialModel.updateMaterial(id, title, shortDescription, fullDescription, videoUrl);
}

export async function deleteExistingMaterial(id) {
  return await MaterialModel.deleteMaterial(id);
}
