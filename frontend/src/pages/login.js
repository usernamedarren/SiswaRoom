import { API_BASE } from "../config/api.js";
import { AuthService } from "../utils/auth.js";

export function LoginPage() {
  setTimeout(() => loadLoginPage(), 100);
  return `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div style="max-width: 420px; width: 90%; margin: 0 auto;">
        <div style="background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          <div style="text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 3.5rem; margin-bottom: 0.5rem;">📚</div>
            <h1 style="color: #7c3aed; font-size: 2rem; margin: 0 0 0.5rem 0; font-weight: 700;">SiswaRoom</h1>
            <p style="color: #64748b; font-size: 0.95rem; margin: 0;">Platform Pembelajaran SMP & SMA</p>
          </div>

          <form id="login-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
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
                🔐 Password
              </label>
              <div style="position: relative;">
                <input 
                  type="password" 
                  id="password" 
                  placeholder="masukkan password"
                  required
                  style="width: 100%; padding: 0.875rem 1rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; transition: all 0.3s; font-family: inherit;"
                  onblur="this.style.borderColor = '#e2e8f0'"
                  onfocus="this.style.borderColor = '#7c3aed'; this.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'"
                >
                <button 
                  type="button" 
                  onclick="togglePasswordVisibility()"
                  style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.2rem; padding: 0;"
                >
                  👁️
                </button>
              </div>
            </div>

            <div id="error-message" style="display: none; background: #fee2e2; color: #c2255c; padding: 0.875rem 1rem; border-radius: 10px; text-align: center; font-size: 0.9rem; font-weight: 500; border-left: 4px solid #c2255c;"></div>

            <button 
              type="submit"
              id="login-btn"
              style="background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); color: white; border: none; padding: 1rem; border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);"
              onmouseover="this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.4)';"
              onmouseout="this.style.transform = 'translateY(0)'; this.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';"
            >
              🚀 Masuk
            </button>

            <div id="loading-state" style="display: none; text-align: center; color: #7c3aed; font-weight: 600;">
              Sedang memproses...
            </div>
          </form>

          <div style="text-align: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; margin: 0 0 0.5rem 0; font-size: 0.9rem;">Belum punya akun?</p>
            <a href="#/register" style="color: #7c3aed; text-decoration: none; font-weight: 600; transition: all 0.3s; display: inline-block;"
               onmouseover="this.style.color = '#3b82f6'"
               onmouseout="this.style.color = '#7c3aed'">
              Daftar Sekarang →
            </a>
          </div>

          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #f3e5f5 100%); border-left: 4px solid #7c3aed; padding: 1rem; border-radius: 10px; margin-top: 1.5rem; font-size: 0.85rem;">
            <p style="color: #1e293b; font-weight: 600; margin: 0 0 0.5rem 0;">📝 Demo Login:</p>
            <div style="background: white; padding: 0.75rem; border-radius: 6px; margin-bottom: 0.5rem; font-family: 'Courier New', monospace; color: #333; font-size: 0.8rem;">
              <div>Email: admin@siswaroom.com</div>
              <div>Password: password123</div>
            </div>
            <p style="color: #64748b; margin: 0; font-size: 0.8rem;">Atau gunakan email lain dari user yang tersedia</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Define togglePasswordVisibility globally for onclick handler
window.togglePasswordVisibility = function() {
  const passwordInput = document.getElementById("password");
  const button = event.target;
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    button.textContent = "🙈";
  } else {
    passwordInput.type = "password";
    button.textContent = "👁️";
  }
};

function loadLoginPage() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");
    const loginBtn = document.getElementById("login-btn");
    const loadingState = document.getElementById("loading-state");

    errorMessage.style.display = "none";
    loginBtn.style.display = "none";
    loadingState.style.display = "block";

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend tidak dapat diakses. Pastikan server backend berjalan di port 4000.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login gagal");
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
      loginBtn.style.display = "block";
      loadingState.style.display = "none";
    }
  });
}
