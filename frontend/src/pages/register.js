import { API_BASE } from "../config/api.js";
import { AuthService } from "../utils/auth.js";

export function RegisterPage() {
  setTimeout(() => loadRegisterPage(), 100);
  return `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div style="max-width: 480px; width: 90%; margin: 0 auto;">
        <div style="background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          <div style="text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 3.5rem; margin-bottom: 0.5rem;">📚</div>
            <h1 style="color: #7c3aed; font-size: 2rem; margin: 0 0 0.5rem 0; font-weight: 700;">SiswaRoom</h1>
            <p style="color: #64748b; font-size: 0.95rem; margin: 0;">Daftar untuk memulai belajar</p>
          </div>

          <form id="register-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div>
              <label style="display: block; color: #1e293b; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.95rem;">
                👤 Nama Lengkap
              </label>
              <input 
                type="text" 
                id="name" 
                placeholder="masukkan nama lengkap"
                required
                style="width: 100%; padding: 0.875rem 1rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; transition: all 0.3s; font-family: inherit;"
                onblur="this.style.borderColor = '#e2e8f0'"
                onfocus="this.style.borderColor = '#7c3aed'; this.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'"
              >
            </div>

            <div>
              <label style="display: block; color: #1e293b; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.95rem;">
                📧 Email
              </label>
              <input 
                type="email" 
                id="email" 
                placeholder="masukkan email anda"
                required
                style="width: 100%; padding: 0.875rem 1rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; transition: all 0.3s; font-family: inherit;"
                onblur="this.style.borderColor = '#e2e8f0'"
                onfocus="this.style.borderColor = '#7c3aed'; this.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'"
              >
            </div>

            <div>
              <label style="display: block; color: #1e293b; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.95rem;">
                👨‍🎓 Pilih Peran
              </label>
              <select 
                id="role" 
                required
                style="width: 100%; padding: 0.875rem 1rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; background: white; cursor: pointer; transition: all 0.3s; font-family: inherit;"
                onblur="this.style.borderColor = '#e2e8f0'"
                onfocus="this.style.borderColor = '#7c3aed'; this.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'"
              >
                <option value="">-- Pilih Peran Anda --</option>
                <option value="student">👨‍🎓 Siswa</option>
                <option value="teacher">👨‍🏫 Guru/Pengajar</option>
              </select>
            </div>

            <div>
              <label style="display: block; color: #1e293b; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.95rem;">
                🔐 Password (minimal 6 karakter)
              </label>
              <div style="position: relative;">
                <input 
                  type="password" 
                  id="password" 
                  placeholder="buat password yang kuat"
                  required
                  minlength="6"
                  style="width: 100%; padding: 0.875rem 1rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; transition: all 0.3s; font-family: inherit;"
                  onblur="this.style.borderColor = '#e2e8f0'"
                  onfocus="this.style.borderColor = '#7c3aed'; this.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'"
                >
                <button 
                  type="button" 
                  onclick="togglePasswordVisibilityField('password')"
                  style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.2rem; padding: 0;"
                >
                  👁️
                </button>
              </div>
            </div>

            <div>
              <label style="display: block; color: #1e293b; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.95rem;">
                🔐 Konfirmasi Password
              </label>
              <div style="position: relative;">
                <input 
                  type="password" 
                  id="confirm-password" 
                  placeholder="ulangi password"
                  required
                  minlength="6"
                  style="width: 100%; padding: 0.875rem 1rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; transition: all 0.3s; font-family: inherit;"
                  onblur="this.style.borderColor = '#e2e8f0'"
                  onfocus="this.style.borderColor = '#7c3aed'; this.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'"
                >
                <button 
                  type="button" 
                  onclick="togglePasswordVisibilityField('confirm-password')"
                  style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.2rem; padding: 0;"
                >
                  👁️
                </button>
              </div>
            </div>

            <div id="error-message" style="display: none; background: #fee2e2; color: #c2255c; padding: 0.875rem 1rem; border-radius: 10px; text-align: center; font-size: 0.9rem; font-weight: 500; border-left: 4px solid #c2255c;"></div>

            <button 
              type="submit"
              id="register-btn"
              style="background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); color: white; border: none; padding: 1rem; border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);"
              onmouseover="this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.4)';"
              onmouseout="this.style.transform = 'translateY(0)'; this.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';"
            >
              ✨ Daftar Sekarang
            </button>

            <div id="loading-state" style="display: none; text-align: center; color: #7c3aed; font-weight: 600;">
              Sedang membuat akun...
            </div>
          </form>

          <div style="text-align: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; margin: 0 0 0.5rem 0; font-size: 0.9rem;">Sudah punya akun?</p>
            <a href="#/login" style="color: #7c3aed; text-decoration: none; font-weight: 600; transition: all 0.3s; display: inline-block;"
               onmouseover="this.style.color = '#3b82f6'"
               onmouseout="this.style.color = '#7c3aed'">
              Masuk di sini →
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Define togglePasswordVisibilityField globally for onclick handler
window.togglePasswordVisibilityField = function(fieldId) {
  const passwordInput = document.getElementById(fieldId);
  const button = event.target;
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    button.textContent = "🙈";
  } else {
    passwordInput.type = "password";
    button.textContent = "👁️";
  }
};

function loadRegisterPage() {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const role = document.getElementById("role").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const errorMessage = document.getElementById("error-message");
    const registerBtn = document.getElementById("register-btn");
    const loadingState = document.getElementById("loading-state");

    // Validation
    if (!name) {
      errorMessage.textContent = "Nama tidak boleh kosong";
      errorMessage.style.display = "block";
      return;
    }

    if (!email) {
      errorMessage.textContent = "Email tidak boleh kosong";
      errorMessage.style.display = "block";
      return;
    }

    if (password !== confirmPassword) {
      errorMessage.textContent = "Password tidak cocok!";
      errorMessage.style.display = "block";
      return;
    }

    if (password.length < 6) {
      errorMessage.textContent = "Password minimal 6 karakter";
      errorMessage.style.display = "block";
      return;
    }

    if (!role) {
      errorMessage.textContent = "Pilih peran terlebih dahulu";
      errorMessage.style.display = "block";
      return;
    }

    errorMessage.style.display = "none";
    registerBtn.style.display = "none";
    loadingState.style.display = "block";

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, password })
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend tidak dapat diakses. Pastikan server backend berjalan di port 4000.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registrasi gagal");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.hash = "#/";
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        errorMsg = "Tidak dapat terhubung ke server. Pastikan backend berjalan.";
      }
      errorMessage.textContent = errorMsg;
      errorMessage.style.display = "block";
      registerBtn.style.display = "block";
      loadingState.style.display = "none";
    }
  });
}
