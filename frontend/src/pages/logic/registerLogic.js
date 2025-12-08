import { API_BASE } from "../../config/api.js";

export async function initRegister(container) {
  const html = await fetch("./src/pages/static/register.html").then(r => r.text());
  container.innerHTML = html;
  
  setupRegisterForm();
}

function setupRegisterForm() {
  const form = document.getElementById('register-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm-password');
  const roleSelect = document.getElementById('role');
  const submitBtn = document.getElementById('submit-btn');
  const errorEl = document.getElementById('error-message');
  const successEl = document.getElementById('success-message');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = nameInput?.value?.trim();
      const email = emailInput?.value?.trim();
      const password = passwordInput?.value?.trim();
      const confirm = confirmInput?.value?.trim();
      const role = roleSelect?.value || 'siswa';

      // Validation
      if (!name || !email || !password || !confirm) {
        if (errorEl) errorEl.textContent = 'Semua field harus diisi';
        return;
      }

      if (password.length < 6) {
        if (errorEl) errorEl.textContent = 'Password minimal 6 karakter';
        return;
      }

      if (password !== confirm) {
        if (errorEl) errorEl.textContent = 'Password tidak cocok';
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (errorEl) errorEl.textContent = 'Email tidak valid';
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (errorEl) errorEl.textContent = '';
      if (successEl) successEl.textContent = '';

      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name, 
            email, 
            password,
            role: role || 'siswa'
          })
        });

        const data = await res.json();

        if (res.ok) {
          if (successEl) {
            successEl.textContent = 'Pendaftaran berhasil! Silakan login dengan akun Anda.';
          }
          
          form.reset();
          
          setTimeout(() => {
            window.location.hash = '#/login';
          }, 2000);
        } else {
          if (errorEl) {
            errorEl.textContent = data.message || 'Pendaftaran gagal. Email mungkin sudah terdaftar.';
          }
        }
      } catch (err) {
        console.error('Register error:', err);
        if (errorEl) errorEl.textContent = 'Terjadi kesalahan. Silakan coba lagi.';
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
}
