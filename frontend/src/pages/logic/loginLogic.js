import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

// Demo credentials
// Demo users match seeded credentials in database (see README)
const DEMO_USERS = {
  admin: { email: 'admin@siswaroom.com', password: 'password123', name: 'Admin SiswaRoom', role: 'admin' },
  siswa: { email: 'student1@siswaroom.com', password: 'password123', name: 'Ahmad Rasyid', role: 'student' },
  guru: { email: 'teacher1@siswaroom.com', password: 'password123', name: 'Ibu Siti Nurhaliza', role: 'teacher' }
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

  if (adminBtn) {
    adminBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log('[QUICK LOGIN] Admin clicked');
      await performLogin(DEMO_USERS.admin.email, DEMO_USERS.admin.password);
    });
  }

  if (siswaBtn) {
    siswaBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log('[QUICK LOGIN] Siswa clicked');
      await performLogin(DEMO_USERS.siswa.email, DEMO_USERS.siswa.password);
    });
  }

  if (guruBtn) {
    guruBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log('[QUICK LOGIN] Guru clicked');
      await performLogin(DEMO_USERS.guru.email, DEMO_USERS.guru.password);
    });
  }
}

async function performLogin(email, password) {
  const submitBtn = document.getElementById('submit-btn');
  const errorEl = document.getElementById('error-message');

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
    console.log('[LOGIN] Attempting login to:', `${API_BASE}/auth/login`);
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : { message: await res.text() };
    console.log('[LOGIN] Response:', res.status, data);

    if (res.ok && data.token) {
      // Save auth data
      const user = data.user || { email, name: 'User' };
      AuthService.setAuth(data.token, user);

      console.log('[LOGIN] Success! Redirecting to dashboard...');
      
      // Redirect to dashboard
      window.location.hash = '#/';
    } else {
      const errMsg = data.message || data.error || 'Login gagal';
      if (errorEl) {
        errorEl.textContent = errMsg;
        errorEl.style.display = 'block';
      }
      console.error('[LOGIN] Failed:', errMsg);
    }
  } catch (err) {
    console.error('[LOGIN] Network error:', err);
    if (errorEl) {
      errorEl.textContent = `Error: ${err.message}`;
      errorEl.style.display = 'block';
    }
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

function setupLoginForm() {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.getElementById('remember-me');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = emailInput?.value?.trim();
      const password = passwordInput?.value?.trim();

      // Save remember me preference
      if (rememberCheckbox?.checked) {
        localStorage.setItem('remembered-email', email);
      } else {
        localStorage.removeItem('remembered-email');
      }

      await performLogin(email, password);
    });

    // Load remembered email
    const remembered = localStorage.getItem('remembered-email');
    if (remembered && emailInput) {
      emailInput.value = remembered;
      if (rememberCheckbox) rememberCheckbox.checked = true;
    }
  }
}
