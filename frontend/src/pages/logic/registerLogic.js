

export async function initRegister(container) {
  try {
    const html = await (await fetch(new URL("../static/register.html", import.meta.url))).text();
    container.innerHTML = html;

    setupRegisterForm();

  } catch {
    container.innerHTML = `<p class="center text-gray">Gagal memuat halaman pendaftaran.</p>`;
  }
}

import { AuthService } from "../../utils/auth.js";
import { API_BASE } from "../../utils/config.js";

const DUMMY_AUTH = false;

function setupRegisterForm() {
  const form = document.getElementById("register-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const full_name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm-password").value;
    const role = document.getElementById("role").value;

    const errorBox = document.getElementById("error-message");
    const successBox = document.getElementById("success-message");

    errorBox.style.display = "none";
    successBox.style.display = "none";

    if (!full_name || !email || !password) {
      errorBox.textContent = "Semua field wajib diisi.";
      errorBox.style.display = "block";
      return;
    }

    if (password !== confirm) {
      errorBox.textContent = "Password tidak sama.";
      errorBox.style.display = "block";
      return;
    }

    // DEV: create dummy user locally and auto-login
    if (DUMMY_AUTH) {
      const user = { name: full_name, full_name, email, role };
      const token = 'dev-token-' + Math.random().toString(36).slice(2, 10);
      AuthService.setAuth(token, user);
      window.location.hash = '#/';
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Backend expects: email, password, full_name, role ('guru'|'siswa'|'admin')
        body: JSON.stringify({ email, password, full_name, role }),
      });

      const result = await res.json();

      if (!res.ok) {
        errorBox.style.display = "block";
        errorBox.textContent = result.message || "Gagal mendaftar.";
        return;
      }

      // If backend returns token + user, auto-login; else show success message
      if (result?.token && result?.user) {
        const user = {
          ...result.user,
          full_name: result.user.full_name || full_name,
          name: result.user.name || result.user.full_name || full_name || result.user.email,
        };
        AuthService.setAuth(result.token, user);
        window.location.hash = '#/';
      } else {
        successBox.style.display = "block";
        successBox.textContent = "Registrasi berhasil! Anda dapat login sekarang.";
        setTimeout(() => (window.location.hash = "#/login"), 1500);
      }

    } catch {
      errorBox.textContent = "Kesalahan server.";
      errorBox.style.display = "block";
    }
  });
}
