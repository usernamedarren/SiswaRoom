// Auth State Management Utility
export const AuthService = {
  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token;
  },

  // Get stored token
  getToken() {
    return localStorage.getItem("token");
  },

  // Get stored user info
  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Get auth headers for API calls
  getAuthHeaders() {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    };
  },

  // Set token and user (called after login/register)
  setAuth(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  // Clear auth (called on logout)
  clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Check if user has specific role
  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  },

  // Get user display name
  getUserName() {
    const user = this.getUser();
    return user ? user.name : "Guest";
  },

  // Get user role display
  getRoleDisplay() {
    const user = this.getUser();
    if (!user) return "Guest";
    const roleMap = {
      student: "👨‍🎓 Siswa",
      teacher: "👨‍🏫 Guru",
      admin: "🔐 Admin"
    };
    return roleMap[user.role] || user.role;
  }
};
