
import { AuthService } from "../../utils/auth.js";
import { API_BASE } from "../../utils/config.js";

const DUMMY_AUTH = false;

export async function initLogin(container) {
  try {
    const html = await (await fetch(new URL("../static/login.html", import.meta.url))).text();
    container.innerHTML = html;

    setupForm();
    setupQuickLogin();

  } catch {
    container.innerHTML = `<p class="center text-gray">Gagal memuat halaman login.</p>`;
  }
}

function setupQuickLogin() {
  document.getElementById("quick-siswa").onclick = () => quickLogin("siswa1@sekolah.id", "password");
  document.getElementById("quick-guru").onclick = () => quickLogin("guru1@sekolah.id", "password123");
}

async function quickLogin(email, password) {
  return submitLogin({ email, password });
}

function setupForm() {
  const form = document.getElementById("login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    submitLogin({ email, password });
  });
}

async function submitLogin({ email, password }) {
  const errorBox = document.getElementById("error-message");

  // DEV: use dummy auth if enabled
  if (DUMMY_AUTH) {
    const user = {
      name: email.split('@')[0],
      email,
      role: email.includes('admin') ? 'admin' : (email.includes('guru') || email.includes('teacher') ? 'teacher' : 'student'),
    };
    const token = 'dev-token-' + Math.random().toString(36).slice(2, 10);
    AuthService.setAuth(token, user);
    window.location.hash = "#/";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await res.json();

    if (!res.ok) {
      errorBox.style.display = "block";
      errorBox.textContent = result.message || "Login gagal.";
      return;
    }

    // Normalize user payload to ensure name/full_name are available
    const user = result.user || {};
    const normalizedUser = {
      ...user,
      full_name: user.full_name || user.name,
      name: user.name || user.full_name || user.email,
    };

    // Set auth with token and normalized user from API
    AuthService.setAuth(result.token, normalizedUser);
    // Navigate to dashboard/home and ensure route handlers run even if the hash is unchanged
    if (location.hash !== "#/") {
      window.location.hash = "#/";
    } else {
      window.dispatchEvent(new Event('hashchange'));
    }

  } catch (err) {
    errorBox.style.display = "block";
    errorBox.textContent = "Terjadi kesalahan server.";
  }
}
