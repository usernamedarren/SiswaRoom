import * as LibraryService from "../services/library.service.js";
import { db } from "../config/db.js";

function roleIsAdmin(req) {
  return (req.user?.role || "").toLowerCase() === "admin";
}

async function ensureTeacherOwnsCourse(req, courseId) {
  if (!req.user?.id) return false;
  const [rows] = await db.query(
    "SELECT id FROM courses WHERE id = ? AND teacher_id = ?",
    [courseId, req.user.id]
  );
  return rows.length > 0;
}

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

    const allowedTypes = ["ebook", "catatan", "bank_soal"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid type. Use ebook, catatan, or bank_soal" });
    }

    const courseId = Number(course_id);
    if (!courseId || Number.isNaN(courseId)) {
      return res.status(400).json({ message: "course_id must be a valid number" });
    }

    const role = (req.user?.role || "").toLowerCase();
    if (req.user && !roleIsAdmin(req)) {
      const ok = await ensureTeacherOwnsCourse(req, courseId);
      if (!ok) return res.status(403).json({ message: "Forbidden: Course is not yours" });
    }

    const itemId = await LibraryService.createNewLibraryItem(
      title,
      type,
      short_description,
      courseId,
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

    const allowedTypes = ["ebook", "catatan", "bank_soal"];
    if (type && !allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid type. Use ebook, catatan, or bank_soal" });
    }

    const existing = await LibraryService.fetchLibraryItemById(id);
    if (!existing) {
      return res.status(404).json({ message: "Library item not found" });
    }

    if (req.user && !roleIsAdmin(req)) {
      const ok = await ensureTeacherOwnsCourse(req, existing.course_id);
      if (!ok) return res.status(403).json({ message: "Forbidden: Course is not yours" });
    }

    const success = await LibraryService.updateExistingLibraryItem(
      id,
      title,
      type,
      short_description,
      file_url
    );
    const item = await LibraryService.fetchLibraryItemById(id);
    res.json({ message: "Library item updated successfully", item });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
}

export async function deleteLibraryItem(req, res) {
  try {
    const { id } = req.params;

    const existing = await LibraryService.fetchLibraryItemById(id);
    if (!existing) return res.status(404).json({ message: "Library item not found" });

    if (req.user && !roleIsAdmin(req)) {
      const ok = await ensureTeacherOwnsCourse(req, existing.course_id);
      if (!ok) return res.status(403).json({ message: "Forbidden: Course is not yours" });
    }

    const success = await LibraryService.deleteExistingLibraryItem(id);
    if (!success) return res.status(404).json({ message: "Library item not found" });

    res.json({ message: "Library item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
}

/**
 * GET /library/edutoon/children
 * Return EduToon books targeted for children (category/tags/age filters)
 */
export async function getEduToonChildrenBooks(req, res) {
  try {
    const maxAge = Number(req.query.maxAge || req.query.max_age || 12);
    const books = await LibraryService.fetchEduToonBooks();

    const childKeywords = ['anak','anak-anak','children','kids','kid','balita'];
    const filtered = (Array.isArray(books) ? books : []).filter(b => {
      const cat = String(b.category || '').toLowerCase();
      const title = String(b.title || b.name || '').toLowerCase();
      const desc = String(b.short_description || b.description || '').toLowerCase();
      const tagsStr = Array.isArray(b.tags) ? b.tags.join(' ').toLowerCase() : String(b.tags||'').toLowerCase();
      const min_age = Number(b.min_age || b.minAge || 0);
      const max_age = Number(b.max_age || b.maxAge || 0);

      const keywordMatch = childKeywords.some(k => cat.includes(k) || title.includes(k) || desc.includes(k) || tagsStr.includes(k));
      const ageMatch = (max_age && max_age <= maxAge) || (min_age && min_age <= maxAge) || (min_age === 0 && max_age === 0 && keywordMatch);

      return keywordMatch || ageMatch;
    });

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch EduToon children's books", error: err.message });
  }
}
