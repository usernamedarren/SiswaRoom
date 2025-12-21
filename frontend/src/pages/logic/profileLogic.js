import { AuthService } from "../../utils/auth.js";

// If backend is not available, the page will automatically fall back to local/demo data.
const DUMMY_DATA = false;
const MOCK_PROFILE_STATS = {
  quizzes: 5,
  materials: 12,
};

export async function initProfile(container) {
  try {
    const html = await (await fetch(new URL("../static/profile.html", import.meta.url))).text();
    container.innerHTML = html;

    // Boot UI
    bindFormHandlers();
    bindPasswordHandlers();

    await loadProfile();
  } catch (e) {
    console.error("[PROFILE] Failed to load profile page:", e);
    container.innerHTML = `<div class="container"><div class="card"><h2>Gagal memuat profil</h2><p class="text-gray">Coba refresh halaman.</p></div></div>`;
  }
}

async function loadProfile() {
  const userLocal = AuthService.getUser();
  if (!userLocal) {
    window.location.hash = "#/login";
    return;
  }

  setIdentity(userLocal);

  // Try to refresh user from API if available
  const apiUser = await tryFetchMe();
  if (apiUser) {
    // Merge with local, keep role if missing
    const merged = { ...userLocal, ...apiUser };
    AuthService.setAuth(AuthService.getToken(), merged);
    setIdentity(merged);
    setForm(merged);
    showTip("✅ Profil berhasil dimuat dari server.");
  } else {
    setForm(userLocal);
    showTip("ℹ️ Mode demo: profil memakai data lokal browser.");
  }

  await loadStats();
}

function setIdentity(user) {
  const nameEl = document.getElementById("profile-name");
  const emailEl = document.getElementById("profile-email");
  const roleEl = document.getElementById("profile-role");
  const initialsEl = document.getElementById("profile-initials");
  const subEl = document.getElementById("profile-sub");

  if (nameEl) nameEl.textContent = user?.name || "(Tanpa nama)";
  if (emailEl) emailEl.textContent = user?.email || "—";
  if (roleEl) roleEl.textContent = AuthService.getRoleDisplay() || "User";
  if (initialsEl) initialsEl.textContent = getInitials(user?.name || user?.email || "SR");

  // a tiny friendly subtitle
  if (subEl) {
    const now = new Date();
    const hours = now.getHours();
    const greet =
      hours < 11 ? "Selamat pagi" : hours < 15 ? "Selamat siang" : hours < 19 ? "Selamat sore" : "Selamat malam";
    subEl.textContent = `${greet} — ayo lanjutkan progres belajarmu ✨`;
  }
}

function setForm(user) {
  const nameInput = document.getElementById("input-name");
  const emailInput = document.getElementById("input-email");
  if (nameInput) nameInput.value = user?.name || "";
  if (emailInput) emailInput.value = user?.email || "";
}

function bindFormHandlers() {
  const form = document.getElementById("profile-form");
  const resetBtn = document.getElementById("profile-reset");
  const refreshBtn = document.getElementById("profile-refresh");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await saveProfile();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const u = AuthService.getUser();
      setForm(u);
      showAlert("", "info", false);
      showTip("↩️ Form dikembalikan ke data terakhir.");
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      showTip("🔄 Memuat ulang profil...");
      await loadProfile();
    });
  }
}

async function saveProfile() {
  const btn = document.getElementById("profile-save");
  const name = (document.getElementById("input-name")?.value || "").trim();
  const email = (document.getElementById("input-email")?.value || "").trim();

  if (!name) {
    showAlert("Nama tidak boleh kosong.", "error", true);
    return;
  }
  if (!email || !email.includes("@")) {
    showAlert("Email tidak valid.", "error", true);
    return;
  }

  setBusy(btn, true);
  showAlert("", "info", false);

  const current = AuthService.getUser() || {};
  const payload = { name, email };

  // Try save to API first (if available)
  const saved = await tryPatchMe(payload);
  if (saved) {
    const merged = { ...current, ...saved };
    AuthService.setAuth(AuthService.getToken(), merged);
    setIdentity(merged);
    setForm(merged);
    showAlert("✅ Perubahan tersimpan di server.", "success", true);
    showTip("Mantap! Profil kamu sudah diperbarui.");
    setBusy(btn, false);
    return;
  }

  // Fallback: local-only update
  const merged = { ...current, ...payload };
  AuthService.setAuth(AuthService.getToken(), merged);
  setIdentity(merged);
  showAlert("✅ Perubahan tersimpan (lokal).", "success", true);
  showTip("ℹ️ Server tidak terdeteksi, jadi perubahan disimpan di browser.");
  setBusy(btn, false);
}

async function loadStats() {
  const quizzesEl = document.getElementById("kpi-quizzes");
  const matsEl = document.getElementById("kpi-materials");

  // Defaults
  if (quizzesEl) quizzesEl.textContent = "-";
  if (matsEl) matsEl.textContent = "-";

  // Try API signals if present
  const data = await tryLoadProfileStats();
  const stats = data || MOCK_PROFILE_STATS;

  if (quizzesEl) quizzesEl.textContent = String(stats.quizzes ?? "-");
  if (matsEl) matsEl.textContent = String(stats.materials ?? "-");
}

async function tryLoadProfileStats() {
  // Only attempt if API_BASE exists and dummy flag disabled
  if (typeof API_BASE === "undefined" || DUMMY_DATA) return null;
  try {
    // best-effort, tolerate missing endpoints
    const headers = { ...AuthService.getAuthHeaders() };

    const statsRes = await fetch(`${API_BASE}/dashboard/stats`, { headers });

    let quizzes = null;
    let materials = null;
    if (statsRes.ok) {
      const s = await statsRes.json();
      quizzes = s?.quizzes ?? null;
      materials = s?.materials ?? null;
    }

    if (quizzes === null && materials === null) return null;
    return { quizzes: quizzes ?? "-", materials: materials ?? "-" };
  } catch {
    return null;
  }
}

async function tryFetchMe() {
  if (typeof API_BASE === "undefined") return null;
  try {
    const res = await fetch(`${API_BASE}/user/me`, { headers: AuthService.getAuthHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function tryPatchMe(payload) {
  if (typeof API_BASE === "undefined") return null;
  try {
    const res = await fetch(`${API_BASE}/user/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...AuthService.getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function bindPasswordHandlers() {
  const form = document.getElementById("password-form");
  const resetBtn = document.getElementById("password-reset");
  const currentEl = document.getElementById("input-current-password");
  const newEl = document.getElementById("input-new-password");
  const confirmEl = document.getElementById("input-confirm-password");

  const updateHint = () => {
    const pwd = (newEl?.value || "").trim();
    const hintEl = document.getElementById("password-hint");
    if (!hintEl) return;
    if (!pwd) {
      hintEl.textContent = "—";
      return;
    }
    const { label, advice } = getPasswordStrength(pwd);
    hintEl.textContent = `${label}${advice ? ` • ${advice}` : ""}`;
  };

  newEl?.addEventListener("input", updateHint);
  confirmEl?.addEventListener("input", updateHint);

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await changePassword();
  });

  resetBtn?.addEventListener("click", () => {
    if (currentEl) currentEl.value = "";
    if (newEl) newEl.value = "";
    if (confirmEl) confirmEl.value = "";
    showPasswordAlert("", "info", false);
    const hintEl = document.getElementById("password-hint");
    if (hintEl) hintEl.textContent = "—";
    showTip("↩️ Form password di-reset.");
  });
}

async function changePassword() {
  const btn = document.getElementById("password-save");
  const current = (document.getElementById("input-current-password")?.value || "").trim();
  const next = (document.getElementById("input-new-password")?.value || "").trim();
  const confirm = (document.getElementById("input-confirm-password")?.value || "").trim();

  if (!current) return showPasswordAlert("Password saat ini wajib diisi.", "error", true);
  if (!next || next.length < 8) return showPasswordAlert("Password baru minimal 8 karakter.", "error", true);
  if (next !== confirm) return showPasswordAlert("Konfirmasi password tidak sama.", "error", true);

  setBusy(btn, true);
  showPasswordAlert("", "info", false);

  const ok = await tryChangePassword({ currentPassword: current, newPassword: next });
  if (ok) {
    // clear
    const currentEl = document.getElementById("input-current-password");
    const newEl = document.getElementById("input-new-password");
    const confirmEl = document.getElementById("input-confirm-password");
    if (currentEl) currentEl.value = "";
    if (newEl) newEl.value = "";
    if (confirmEl) confirmEl.value = "";
    const hintEl = document.getElementById("password-hint");
    if (hintEl) hintEl.textContent = "—";
    showPasswordAlert("✅ Password berhasil diubah.", "success", true);
    showTip("🔒 Password kamu sudah diperbarui.");
    setBusy(btn, false);
    return;
  }

  // fallback info
  if (typeof API_BASE === "undefined" || DUMMY_DATA) {
    showPasswordAlert("ℹ️ Backend belum terhubung, jadi ubah password belum bisa diproses.", "info", true);
  } else {
    showPasswordAlert("❌ Gagal mengubah password. Pastikan password saat ini benar.", "error", true);
  }
  setBusy(btn, false);
}

async function tryChangePassword(payload) {
  if (typeof API_BASE === "undefined" || DUMMY_DATA) return false;
  const headers = { "Content-Type": "application/json", ...AuthService.getAuthHeaders() };

  // Coba beberapa endpoint yang umum dipakai.
  const candidates = [
    { url: `${API_BASE}/user/change-password`, method: "POST" },
    { url: `${API_BASE}/user/password`, method: "PATCH" },
    { url: `${API_BASE}/auth/change-password`, method: "POST" },
    { url: `${API_BASE}/auth/password`, method: "PATCH" },
  ];

  for (const c of candidates) {
    try {
      const res = await fetch(c.url, { method: c.method, headers, body: JSON.stringify(payload) });
      if (!res.ok) continue;
      return true;
    } catch {
      // try next
    }
  }
  return false;
}

function showPasswordAlert(message, type = "info", show = true) {
  const el = document.getElementById("password-alert");
  if (!el) return;
  if (!show || !message) {
    el.style.display = "none";
    el.textContent = "";
    el.className = "alert";
    return;
  }
  el.style.display = "block";
  el.textContent = message;
  el.className = `alert alert-${type}`;
}

function getPasswordStrength(password) {
  const pwd = String(password || "");
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNum = /\d/.test(pwd);
  const hasSym = /[^A-Za-z0-9]/.test(pwd);
  const len = pwd.length;

  let score = 0;
  if (len >= 8) score++;
  if (len >= 12) score++;
  if (hasLower && hasUpper) score++;
  if (hasNum) score++;
  if (hasSym) score++;

  if (score <= 2) return { label: "Lemah", advice: "Tambahkan panjang & variasi karakter" };
  if (score === 3) return { label: "Cukup", advice: "Tambah angka/simbol agar lebih kuat" };
  if (score === 4) return { label: "Kuat", advice: "Bagus" };
  return { label: "Sangat kuat", advice: "Mantap" };
}

function getInitials(text) {
  const t = String(text || "").trim();
  if (!t) return "SR";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function showAlert(message, type = "info", show = true) {
  const el = document.getElementById("profile-alert");
  if (!el) return;
  if (!show || !message) {
    el.style.display = "none";
    el.textContent = "";
    el.className = "alert";
    return;
  }
  el.style.display = "block";
  el.textContent = message;
  el.className = `alert alert-${type}`;
}

function showTip(text) {
  const el = document.getElementById("profile-tip");
  if (!el) return;
  el.textContent = text || "";
}

function setBusy(btn, busy) {
  if (!btn) return;
  btn.disabled = !!busy;
  btn.classList.toggle("disabled", !!busy);
}
