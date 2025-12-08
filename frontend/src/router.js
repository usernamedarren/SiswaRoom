import { initLogin } from "./pages/logic/loginLogic.js";
import { initRegister } from "./pages/logic/registerLogic.js";
import { initDashboard } from "./pages/logic/dashboardLogic.js";
import { initSubjects } from "./pages/logic/subjectsLogic.js";
import { initSubject } from "./pages/logic/subjectLogic.js";
import { initTopicDetail } from "./pages/logic/topicDetailLogic.js";
import { initSchedules } from "./pages/logic/schedulesLogic.js";
import { initQuizzes } from "./pages/logic/quizzesLogic.js";
import { initAdmin } from "./pages/logic/adminLogic.js";
import { initCourses } from "./pages/logic/coursesLogic.js";
import { AuthService } from "./utils/auth.js";

// routes that require authentication
const protectedRoutes = ["", "subjects", "materi", "jadwal", "kuis", "courses", "quiz", "admin"];
const authOnlyRoutes = ["login", "register"];
const adminOnlyRoutes = ["admin"];

export function router() {
  const app = document.getElementById("app");
  const hash = location.hash || "#/";
  const path = hash.replace(/^#\//, "");
  const segments = path.split("/").filter(Boolean);
  const root = segments[0] || "";
  const [, subjectId, materialId] = segments;

  const isAuth = AuthService.isAuthenticated();
  const user = AuthService.getUser();

  // redirect logged-in users from login/register
  if (isAuth && authOnlyRoutes.includes(root)) {
    window.location.hash = "#/";
    return;
  }

  // require login for protected routes
  if (!isAuth && protectedRoutes.includes(root)) {
    window.location.hash = "#/login";
    return;
  }

  // require admin role for admin routes
  if (isAuth && adminOnlyRoutes.includes(root) && user?.role !== 'admin') {
    alert('Access denied. Admin only.');
    window.location.hash = "#/";
    return;
  }

  // login page
  if (root === "login") {
    initLogin(app);
    return;
  }

  // register page
  if (root === "register") {
    initRegister(app);
    return;
  }

  // dashboard
  if (segments.length === 0) {
    initDashboard(app);
    return;
  }

  // subjects
  if (root === "subjects") {
    if (!subjectId) {
      initSubjects(app);
      return;
    }
    // Single subject view
    initSubject(app, subjectId);
    return;
  }

  // materi routing
  if (root === "materi") {
    if (!subjectId) {
      window.location.hash = "#/subjects";
      return;
    }
    initTopicDetail(app, subjectId);
    return;
  }

  // jadwal/schedules
  if (root === "jadwal") {
    initSchedules(app);
    return;
  }

  // kuis/quizzes
  if (root === "kuis") {
    initQuizzes(app);
    return;
  }

  // Courses
  if (root === "courses") {
    initCourses(app);
    return;
  }

  // Admin panel
  if (root === "admin") {
    initAdmin(app);
    return;
  }

  // 404 fallback
  app.innerHTML = `
    <div class="container">
      <div class="card">
        <h2>❌ 404 - Halaman Tidak Ditemukan</h2>
        <button onclick="window.location.hash='#/'">🏠 Dashboard</button>
      </div>
    </div>
  `;
}
