import * as LibraryModel from "../models/library.models.js";

export async function fetchLibraryItemById(id) {
  return await LibraryModel.getLibraryItemById(id);
}

export async function fetchLibraryItems(courseId) {
  return await LibraryModel.getLibraryItems(courseId);
}

export async function createNewLibraryItem(title, type, shortDescription, courseId, fileUrl) {
  return await LibraryModel.createLibraryItem(title, type, shortDescription, courseId, fileUrl);
}

export async function updateExistingLibraryItem(id, title, type, shortDescription, fileUrl) {
  return await LibraryModel.updateLibraryItem(id, title, type, shortDescription, fileUrl);
}

export async function deleteExistingLibraryItem(id) {
  return await LibraryModel.deleteLibraryItem(id);
}
