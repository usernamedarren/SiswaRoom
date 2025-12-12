import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

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
  document.getElementById("quick-admin").onclick = () => quickLogin("admin@mail.com", "admin123");
  document.getElementById("quick-siswa").onclick = () => quickLogin("siswa@mail.com", "siswa123");
  document.getElementById("quick-guru").onclick = () => quickLogin("guru@mail.com", "guru123");
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

    AuthService.storeToken(result.token, document.getElementById("remember-me").checked);
    window.location.hash = "#/";

  } catch (err) {
    errorBox.style.display = "block";
    errorBox.textContent = "Terjadi kesalahan server.";
  }
}
