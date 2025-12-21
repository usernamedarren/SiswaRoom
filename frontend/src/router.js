import { initLogin } from "./pages/logic/loginLogic.js";
import { initRegister } from "./pages/logic/registerLogic.js";
import { initDashboard } from "./pages/logic/dashboardLogic.js";
import { initSubject } from "./pages/logic/subjectLogic.js";
import { initTopicDetail } from "./pages/logic/topicDetailLogic.js";
import { initQuizzes } from "./pages/logic/quizzesLogic.js";
import { initQuizDetailPage } from "./pages/logic/quizDetailLogic.js";
import { initAdmin } from "./pages/logic/adminLogic.js";
import { initCourses } from "./pages/logic/coursesLogic.js";
import { initCourse } from "./pages/logic/courseLogic.js";
import { AuthService } from "./utils/auth.js";
import { initDashboardShell } from "./pages/logic/dashboardShellLogic.js";
import { initLibrary } from "./pages/logic/libraryLogic.js";
import { initHome } from "./pages/logic/homeLogic.js";
import { initHowItWorks } from "./pages/logic/howItWorksLogic.js";
import { initSubjectsPublic } from "./pages/logic/subjectsPublicLogic.js";
import { initLibraryPublic } from "./pages/logic/libraryPublicLogic.js";
import { initQuizPublic } from "./pages/logic/quizPublicLogic.js";
import { initProfile } from "./pages/logic/profileLogic.js";
import { initTeacher } from "./pages/logic/teacherLogic.js";

// routes that require authentication
// NOTE: root ("") is now PUBLIC and renders the homepage when not authenticated.
const protectedRoutes = ["courses", "materi", "kuis", "course", "quiz", "admin", "library", "profile", "teacher"];
const authOnlyRoutes = ["login", "register"]; 
const adminOnlyRoutes = ["admin"];

export function router() {
  const app = document.getElementById("app");
  const hash = location.hash || "#/";

  // buang "#/" lalu buang query string (?tab=...)
  const pathWithQuery = hash.replace(/^#\//, "");
  const path = pathWithQuery.split("?")[0];  // <<< INI FIX UTAMA

  const segments = path.split("/").filter(Boolean);
  const root = segments[0] || "";

  const [, subjectId] = segments;

  const isAuth = AuthService.isAuthenticated();
  const user = AuthService.getUser();
  const isTeacherRole = ["teacher", "guru"].includes(user?.role);
  if (isTeacherRole) {
    if (location.hash === "#/" || location.hash === "#" || location.hash === "" || location.hash.startsWith("#/?")) {
      window.location.replace("#/teacher?tab=materi");
      return;
    }
  }
  
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
  if (isAuth && adminOnlyRoutes.includes(root) && user?.role !== "admin") {
    alert("Access denied. Admin only.");
    window.location.hash = "#/";
    return;
  }

  // login
  if (root === "login") {
    initLogin(app);
    return;
  }

  // register
  if (root === "register") {
    initRegister(app);
    return;
  }


  // root route
  if (segments.length === 0) {
    // If authenticated -> dashboard, else -> public homepage
    if (isAuth) initDashboardShell(app);
    else initHome(app);
    return;
  }

    // root route
  if (segments.length === 0) {
    if (isAuth) initDashboardShell(app);
    else initHome(app);
    return;
  }

  // ===== PUBLIC LANDING PAGES =====
  if (root === "cara-kerja") {
    initHowItWorks(app);
    return;
  }

  if (root === "mata-pelajaran") {
    initSubjectsPublic(app);
    return;
  }

  if (root === "librarypublic") {
    initLibraryPublic(app);
    return;
  }

  if (root === "quizpublic") {
    initQuizPublic(app);
    return;
  }

  // courses (pengganti subjects)
  if (root === "courses") {
    initCourses(app);
    return;
  }

  // materi / topic detail (materi/:subjectId)
  if (root === "materi") {
    if (!subjectId) {
      window.location.hash = "#/courses";
      return;
    }
    initTopicDetail(app, subjectId);
    return;
  }

  // kuis
  if (root === "kuis") {
    initQuizzes(app);
    return;
  }



  // library
  if (root === "library") {
    initLibrary(app);
    return;
  }

  // profile
  if (root === "profile") {
    initProfile(app);
    return;
  }

  // profile
  if (root === "profile") {
    initProfile(app);
    return;
  }

  // quiz detail (quiz/:id)
  if (root === "quiz") {
    const quizId = segments[1] || '';
    initQuizDetailPage(app, quizId);
    return;
  }

  // single course detail (course/:id)
  if (root === "course") {
    const courseId = segments[1] || "";
    initCourse(app, courseId);
    return;
  }

  // admin
  if (root === "admin") {
    initAdmin(app);
    return;
  }

  if (root === "teacher") return initTeacher(app);
  if (isAuth && root === "teacher" && !["teacher", "guru", "admin"].includes(user?.role)) {
  alert("Access denied. Guru/Admin only.");
  window.location.hash = "#/";
  return;
}


  // legacy redirect (kalau masih ada link lama)
  if (root === "subjects") {
    window.location.hash = "#/courses";
    return;
  }

  // 404 fallback
  app.innerHTML = `
    <div class="container fade-in-up">
      <a class="link" href="#/">← Kembali</a>

      <div class="card" style="margin-top: 1rem;">
        <h2>❌ 404 - Halaman Tidak Ditemukan</h2>
        <p class="text-gray">Route <code>${hash}</code> tidak tersedia.</p>

        <div style="margin-top: 1rem; display:flex; gap:.75rem; flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="window.location.hash='#/'">🏠 Dashboard</button>
          <button class="btn" onclick="window.location.hash='#/courses'">📚 Mata Pelajaran</button>
        </div>
      </div>
    </div>
  `;
}
