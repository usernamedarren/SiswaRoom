const envBase = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
  ? String(import.meta.env.VITE_API_URL)
  : "";

// Normalize base URL and ensure it does not end with a trailing slash
// FALLBACK: production domain (NEVER relative /api in production)
const normalizedBase = (envBase && envBase.trim()) ? envBase.replace(/\/$/, "") : "https://api.siswaroom.online/api";

export const API_BASE = normalizedBase;

// Expose globally so legacy modules using the global name keep working
if (typeof window !== "undefined") {
  window.API_BASE = API_BASE;
}
