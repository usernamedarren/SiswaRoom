const envBase = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
  ? String(import.meta.env.VITE_API_URL)
  : "";

// Normalize base URL and ensure it does not end with a trailing slash
// FALLBACK: production domain (NEVER relative /api in production)
const normalizedBase = (envBase && envBase.trim()) ? envBase.replace(/\/$/, "") : "https://api.siswaroom.online/api";

export const API_BASE = normalizedBase;

// EduToon integration config (for client-side flow)
const edBase = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_EDUTOON_BASE_URL)
  ? String(import.meta.env.VITE_EDUTOON_BASE_URL)
  : "";
export const EDUTOON_BASE = edBase ? edBase.replace(/\/$/, "") : "";

// Token is optional; if set it will be sent from the client to the EduToon API
export const EDUTOON_TOKEN = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_EDUTOON_TOKEN)
  ? String(import.meta.env.VITE_EDUTOON_TOKEN)
  : "";

// Expose globally so legacy modules using the global names keep working
if (typeof window !== "undefined") {
  window.API_BASE = API_BASE;
  window.EDUTOON_BASE = EDUTOON_BASE;
  window.EDUTOON_TOKEN = EDUTOON_TOKEN;
}
