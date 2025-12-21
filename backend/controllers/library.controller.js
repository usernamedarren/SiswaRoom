import * as LibraryService from "../services/library.service.js";

export async function getLibraryItems(req, res) {
  try {
    const { course_id } = req.query;

    const items = await LibraryService.fetchLibraryItems(course_id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch library items", error: err.message });
  }
}

export async function getLibraryItemById(req, res) {
  try {
    const { id } = req.params;
    const item = await LibraryService.fetchLibraryItemById(id);
    if (!item) {
      return res.status(404).json({ message: "Library item not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch library item", error: err.message });
  }
}

export async function createLibraryItem(req, res) {
  try {
    const { title, type, short_description, course_id, file_url } = req.body;

    if (!title || !type || !course_id || !file_url) {
      return res.status(400).json({ message: "title, type, course_id, and file_url are required" });
    }

    const itemId = await LibraryService.createNewLibraryItem(
      title,
      type,
      short_description,
      course_id,
      file_url
    );
    const item = await LibraryService.fetchLibraryItemById(itemId);

    res.status(201).json({
      message: "Library item created successfully",
      item
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create library item", error: err.message });
  }
}

export async function updateLibraryItem(req, res) {
  try {
    const { id } = req.params;
    const { title, type, short_description, file_url } = req.body;

    const success = await LibraryService.updateExistingLibraryItem(
      id,
      title,
      type,
      short_description,
      file_url
    );
    if (!success) {
      return res.status(404).json({ message: "Library item not found" });
    }

    const item = await LibraryService.fetchLibraryItemById(id);
    res.json({ message: "Library item updated successfully", item });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
}

export async function deleteLibraryItem(req, res) {
  try {
    const { id } = req.params;

    const success = await LibraryService.deleteExistingLibraryItem(id);
    if (!success) {
      return res.status(404).json({ message: "Library item not found" });
    }

    res.json({ message: "Library item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
}
