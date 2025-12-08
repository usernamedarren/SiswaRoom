import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

// Demo credentials
const DEMO_USERS = {
  admin: { email: 'admin@siswaroom.com', password: 'admin123', name: 'Admin SiswaRoom', role: 'admin' },
  siswa: { email: 'siswa@siswaroom.com', password: 'siswa123', name: 'Siswa Demo', role: 'student' },
  guru: { email: 'guru@siswaroom.com', password: 'guru123', name: 'Guru Demo', role: 'teacher' }
};

export async function initLogin(container) {
  try {
    // Fetch static HTML - path works in both dev and production
    const response = await fetch(new URL('../static/login.html', import.meta.url).href);
    if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
    const html = await response.text();
    container.innerHTML = html;
    
    setupLoginForm();
    setupQuickLoginButtons();
  } catch (err) {
    console.error('[LOGIN] Failed to load HTML:', err);
    container.innerHTML = '<p>Error loading login page. Please refresh.</p>';
  }
}

function setupQuickLoginButtons() {
  const adminBtn = document.getElementById('quick-admin');
  const siswaBtn = document.getElementById('quick-siswa');
  const guruBtn = document.getElementById('quick-guru');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      emailInput.value = DEMO_USERS.admin.email;
      passwordInput.value = DEMO_USERS.admin.password;
      document.getElementById('login-form')?.dispatchEvent(new Event('submit'));
    });
  }

  if (siswaBtn) {
    siswaBtn.addEventListener('click', () => {
      emailInput.value = DEMO_USERS.siswa.email;
      passwordInput.value = DEMO_USERS.siswa.password;
      document.getElementById('login-form')?.dispatchEvent(new Event('submit'));
    });
  }

  if (guruBtn) {
    guruBtn.addEventListener('click', () => {
      emailInput.value = DEMO_USERS.guru.email;
      passwordInput.value = DEMO_USERS.guru.password;
      document.getElementById('login-form')?.dispatchEvent(new Event('submit'));
    });
  }
}

function setupLoginForm() {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.getElementById('remember-me');
  const submitBtn = document.getElementById('submit-btn');
  const errorEl = document.getElementById('error-message');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = emailInput?.value?.trim();
      const password = passwordInput?.value?.trim();

      if (!email || !password) {
        if (errorEl) {
          errorEl.textContent = 'Email dan password harus diisi';
          errorEl.style.display = 'block';
        }
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
      }

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok && data.token) {
          // Save auth data
          const user = data.user || { email, name: 'User' };
          AuthService.setAuth(data.token, user);
          
          if (rememberCheckbox?.checked) {
            localStorage.setItem('remembered-email', email);
          } else {
            localStorage.removeItem('remembered-email');
          }

          // Redirect to dashboard
          setTimeout(() => {
            window.location.hash = '#/dashboard';
          }, 500);
        } else {
          if (errorEl) {
            errorEl.textContent = data.message || 'Login gagal. Periksa email dan password Anda.';
            errorEl.style.display = 'block';
          }
        }
      } catch (err) {
        console.error('Login error:', err);
        if (errorEl) {
          errorEl.textContent = 'Terjadi kesalahan. Silakan coba lagi.';
          errorEl.style.display = 'block';
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    // Load remembered email
    const remembered = localStorage.getItem('remembered-email');
    if (remembered && emailInput) {
      emailInput.value = remembered;
      if (rememberCheckbox) rememberCheckbox.checked = true;
    }
  }
}
