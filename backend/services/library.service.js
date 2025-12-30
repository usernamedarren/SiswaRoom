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

// === EduToon integration helpers ===
const EDU_BASE = process.env.EDUTOON_BASE_URL || process.env.VITE_EDUTOON_BASE_URL || "https://stb.edutoon.space";
const EDU_EMAIL = process.env.EDUTOON_SERVICE_EMAIL || process.env.VITE_EDUTOON_SERVICE_EMAIL;
const EDU_PASSWORD = process.env.EDUTOON_SERVICE_PASSWORD || process.env.VITE_EDUTOON_SERVICE_PASSWORD;
const EDU_TOKEN = process.env.EDUTOON_API_TOKEN || process.env.EDUTOON_TOKEN || process.env.VITE_EDUTOON_TOKEN;

async function getEduToken() {
  if (EDU_TOKEN) return EDU_TOKEN;
  if (!EDU_EMAIL || !EDU_PASSWORD) return null;

  const res = await fetch(`${EDU_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EDU_EMAIL, password: EDU_PASSWORD })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`EduToon login failed (${res.status}): ${body}`);
  }

  const payload = await res.json();
  return payload?.token || payload?.access_token || payload?.data?.token || null;
}

export async function fetchEduToonBooks() {
  const token = await getEduToken();
  const headers = { accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${EDU_BASE}/api/books`, { headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to fetch EduToon books (${res.status}): ${body}`);
  }

  const books = await res.json();
  return Array.isArray(books) ? books : (Array.isArray(books?.data) ? books.data : []);
}
