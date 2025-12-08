import { AuthService } from "../utils/auth.js";
import { API_BASE } from "../config/api.js";

export function Navbar() {
  const current = location.hash;
  const isAuth = AuthService.isAuthenticated();
  const user = AuthService.getUser();
  
  const isActive = (route) => {
    if (route === "#/subjects") {
      return current.startsWith("#/materi") || current === "#/subjects" ? "active" : "";
    }
    return current === route ? "active" : "";
  };

  const handleLogout = async () => {
    if (confirm("Anda yakin ingin logout?")) {
      try {
        const token = AuthService.getToken();
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        AuthService.clearAuth();
        window.location.hash = "#/login";
      }
    }
  };

  return `
    <header style="
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.25rem 2rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      position: sticky;
      top: 0;
      z-index: 100;
    ">
      <div style="max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
        
        <a href="#/" style="
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: white;
          font-weight: 700;
          font-size: 1.3rem;
          transition: all 0.3s;
        " onmouseover="this.style.transform = 'scale(1.05)'" onmouseout="this.style.transform = 'scale(1)'">
          <span style="font-size: 1.8rem;">📚</span>
          <span>SiswaRoom</span>
        </a>

        ${isAuth ? `
          <nav style="display: flex; gap: 0; align-items: center;">
            <a href="#/" style="
              padding: 0.75rem 1.25rem;
              color: white;
              text-decoration: none;
              font-weight: 600;
              font-size: 0.95rem;
              transition: all 0.3s;
              border-bottom: 3px solid transparent;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              ${current === '#/' ? 'border-bottom-color: white;' : ''}
            " onmouseover="this.style.backgroundColor = 'rgba(255,255,255,0.1)'" onmouseout="this.style.backgroundColor = 'transparent'">
              🏠 Dashboard
            </a>
            <a href="#/subjects" style="
              padding: 0.75rem 1.25rem;
              color: white;
              text-decoration: none;
              font-weight: 600;
              font-size: 0.95rem;
              transition: all 0.3s;
              border-bottom: 3px solid transparent;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              ${(current === '#/subjects' || current.startsWith('#/materi')) ? 'border-bottom-color: white;' : ''}
            " onmouseover="this.style.backgroundColor = 'rgba(255,255,255,0.1)'" onmouseout="this.style.backgroundColor = 'transparent'">
              📖 Mata Pelajaran
            </a>
            <a href="#/jadwal" style="
              padding: 0.75rem 1.25rem;
              color: white;
              text-decoration: none;
              font-weight: 600;
              font-size: 0.95rem;
              transition: all 0.3s;
              border-bottom: 3px solid transparent;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              ${current === '#/jadwal' ? 'border-bottom-color: white;' : ''}
            " onmouseover="this.style.backgroundColor = 'rgba(255,255,255,0.1)'" onmouseout="this.style.backgroundColor = 'transparent'">
              📅 Jadwal
            </a>
            <a href="#/kuis" style="
              padding: 0.75rem 1.25rem;
              color: white;
              text-decoration: none;
              font-weight: 600;
              font-size: 0.95rem;
              transition: all 0.3s;
              border-bottom: 3px solid transparent;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              ${current === '#/kuis' ? 'border-bottom-color: white;' : ''}
            " onmouseover="this.style.backgroundColor = 'rgba(255,255,255,0.1)'" onmouseout="this.style.backgroundColor = 'transparent'">
              🎯 Quiz
            </a>
            <a href="#/courses" style="
              padding: 0.75rem 1.25rem;
              color: white;
              text-decoration: none;
              font-weight: 600;
              font-size: 0.95rem;
              transition: all 0.3s;
              border-bottom: 3px solid transparent;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              ${current.startsWith('#/courses') ? 'border-bottom-color: white;' : ''}
            " onmouseover="this.style.backgroundColor = 'rgba(255,255,255,0.1)'" onmouseout="this.style.backgroundColor = 'transparent'">
              📚 Kursus Saya
            </a>
            ${user?.role === 'admin' ? `
            <a href="#/admin" style="
              padding: 0.75rem 1.25rem;
              color: white;
              text-decoration: none;
              font-weight: 600;
              font-size: 0.95rem;
              transition: all 0.3s;
              border-bottom: 3px solid transparent;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              background: rgba(255, 255, 255, 0.15);
              border-radius: 8px;
              ${current === '#/admin' ? 'border-bottom-color: white;' : ''}
            " onmouseover="this.style.backgroundColor = 'rgba(255,255,255,0.25)'" onmouseout="this.style.backgroundColor = 'rgba(255,255,255,0.15)'">
              🔐 Admin Panel
            </a>
            ` : ''}
          </nav>
        ` : ''}

        <div style="display: flex; align-items: center; gap: 1.5rem;">
          ${isAuth ? `
            <div style="
              display: flex;
              align-items: center;
              gap: 0.75rem;
              padding: 0.75rem 1rem;
              background: rgba(255,255,255,0.1);
              border-radius: 8px;
              border: 1px solid rgba(255,255,255,0.2);
            ">
              <div style="font-size: 1.3rem;">👤</div>
              <div style="font-size: 0.9rem;">
                <div style="font-weight: 700;">${user?.name || 'User'}</div>
                <div style="font-size: 0.8rem; opacity: 0.85;">${getRoleDisplay(user?.role)}</div>
              </div>
            </div>
            <button onclick="handleLogout()" style="
              padding: 0.75rem 1.25rem;
              background: rgba(255,255,255,0.2);
              border: 2px solid white;
              color: white;
              border-radius: 8px;
              font-weight: 700;
              font-size: 0.95rem;
              cursor: pointer;
              transition: all 0.3s;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            " onmouseover="this.style.background = 'white'; this.style.color = '#764ba2'" onmouseout="this.style.background = 'rgba(255,255,255,0.2)'; this.style.color = 'white'">
              🚪 Logout
            </button>
          ` : `
            <a href="#/login" style="
              padding: 0.75rem 1.25rem;
              background: white;
              color: #764ba2;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 700;
              font-size: 0.95rem;
              cursor: pointer;
              transition: all 0.3s;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            " onmouseover="this.style.transform = 'scale(1.05)'" onmouseout="this.style.transform = 'scale(1)'">
              🔑 Login
            </a>
          `}
        </div>
      </div>
    </header>
  `;
}

function getRoleDisplay(role) {
  const roles = {
    'student': '👨‍🎓 Siswa',
    'teacher': '👨‍🏫 Guru',
    'admin': '⚙️ Admin'
  };
  return roles[role] || role;
}

// Define handleLogout globally for onclick
window.handleLogout = async function() {
  if (confirm("Anda yakin ingin logout?")) {
    try {
      const token = AuthService.getToken();
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      AuthService.clearAuth();
      window.location.hash = "#/login";
    }
  }
};
