import { AuthService } from "../utils/auth.js";

const getApiBase = () => {
  const host = window.location.hostname;

  // Local development
  if (host === "localhost" || host === "127.0.0.1") {
    return "http://localhost:4000/api";
  }

  // LAN access (http://192.168.x.x:8088) → backend in local IP
  const lan = /^192\.168\.\d+\.\d+$/;
  if (lan.test(host)) {
    return `http://${host}:4000/api`;
  }

  // Production (siswaroom.online via Cloudflare)
  // BACKEND MUST BE ACCESSED THROUGH HTTPS TUNNEL
  return "https://api.siswaroom.online/api";
};

export const API_BASE = getApiBase();

console.log("[API BASE]", API_BASE);

export function getApiUrl(endpoint) {
  return `${API_BASE}${endpoint}`;
}

export async function fetchFromApi(endpoint, options = {}) {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...AuthService.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(getApiUrl(endpoint), {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        AuthService.clearAuth();
        window.location.hash = "#/login";
      }

      const text = await response.text();
      throw new Error(text || "Unknown API Error");
    }

    return await response.json();
  } catch (err) {
    console.error("[API ERROR]", err.message);
    throw err;
  }
}
