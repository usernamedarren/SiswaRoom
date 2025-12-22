
import { AuthService } from "../../utils/auth.js";
import { API_BASE } from "../../utils/config.js";

const DUMMY_AUTH = false;

export async function initLogin(container) {
  try {
    const html = await (await fetch(new URL("../static/login.html", import.meta.url))).text();
    container.innerHTML = html;

    setupForm();
    setupQuickLogin();
    setupEduToonLogin();

  } catch {
    container.innerHTML = `<p class="center text-gray">Gagal memuat halaman login.</p>`;
  }
}

function setupQuickLogin() {
  document.getElementById("quick-siswa").onclick = () => quickLogin("siswa1@sekolah.id", "password");
  document.getElementById("quick-guru").onclick = () => quickLogin("guru1@sekolah.id", "password");
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

// EduToon client-side login flow: call EduToon API directly using frontend config, then send user to backend to create/get local user
import { EDUTOON_BASE, EDUTOON_TOKEN } from "../../utils/config.js";

function setupEduToonLogin() {
  const btn = document.getElementById('edutoon-login');
  if (!btn) return;

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("error-message");
    errorBox.style.display = 'none';

    if (!EDUTOON_BASE) {
      errorBox.style.display = 'block';
      errorBox.textContent = 'EduToon base URL not configured.';
      return;
    }

    try {
      const resp = await fetch(`${EDUTOON_BASE}/api/auth/me`, {
        headers: EDUTOON_TOKEN ? { Authorization: `Bearer ${EDUTOON_TOKEN}` } : {}
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => null);
        errorBox.style.display = 'block';
        errorBox.textContent = `EduToon request failed (${resp.status})` + (txt ? `: ${txt}` : '');
        return;
      }

      const ed = await resp.json();
      const email = ed.email || ed.data?.email || ed.user?.email;
      const full_name = ed.full_name || ed.name || ed.data?.full_name || ed.user?.full_name || ed.fullname || ed.username || email;

      if (!email) {
        errorBox.style.display = 'block';
        errorBox.textContent = 'EduToon response did not include an email.';
        return;
      }

      // Send to backend to create/find local user and get local token
      const loginRes = await fetch(`${API_BASE}/auth/edutoon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name })
      });

      const loginJson = await loginRes.json().catch(() => ({}));
      if (!loginRes.ok) {
        errorBox.style.display = 'block';
        errorBox.textContent = loginJson.message || `Login failed (${loginRes.status})`;
        return;
      }

      // Use returned token and user to set auth
      const user = loginJson.user || {};
      const normalizedUser = {
        ...user,
        full_name: user.full_name || user.name,
        name: user.name || user.full_name || user.email,
      };

      AuthService.setAuth(loginJson.token, normalizedUser);
      if (location.hash !== "#/") {
        window.location.hash = "#/";
      } else {
        window.dispatchEvent(new Event('hashchange'));
      }

    } catch (err) {
      errorBox.style.display = 'block';
      errorBox.textContent = err.message || 'Network error.';
    }
  });
}
