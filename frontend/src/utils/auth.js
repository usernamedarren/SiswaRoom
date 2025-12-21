export const AuthService = {
  getToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  },

  setAuth(token, user) {
    if (token) localStorage.setItem("token", token);
    if (user) localStorage.setItem("user", JSON.stringify(user));
  },

  storeToken(token, remember) {
    if (remember) localStorage.setItem("token", token);
    else sessionStorage.setItem("token", token);
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  getUser() {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  },

  clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
  },

  getRoleDisplay() {
    const u = this.getUser();
    if (!u) return "";
    if (u.role === "guru") return "Guru";
    if (u.role === "siswa") return "Siswa";
    if (u.role === "admin") return "Admin";
    if (u.role === "teacher") return "Guru";
    if (u.role === "student") return "Siswa";
    return u.role || "";
  },

  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

// Make available globally for modules that reference `AuthService` without importing
window.AuthService = AuthService;
