import { DashboardPage } from "./pages/dashboard.js";
import { SubjectsPage } from "./pages/subjects.js";
import { TopicsPage } from "./pages/topics.js";
import { TopicDetailPage } from "./pages/topicDetail.js";
import { LoginPage } from "./pages/login.js";
import { RegisterPage } from "./pages/register.js";
import { SchedulesPage } from "./pages/schedules.js";
import { QuizzesPage, QuizTakePage, QuizResultsPage } from "./pages/quizzes.js";
import { CoursesPage, CourseDetailPage } from "./pages/courses.js";
import { AuthService } from "./utils/auth.js";

// routes that require authentication
const protectedRoutes = ["", "subjects", "materi", "jadwal", "kuis", "courses", "quiz"];
const authOnlyRoutes = ["login", "register"];

export function router() {
  const app = document.getElementById("app");
  const hash = location.hash || "#/";
  const path = hash.replace(/^#\//, "");
  const segments = path.split("/").filter(Boolean);
  const root = segments[0] || "";
  const [, subjectId, materialId] = segments;

  const isAuth = AuthService.isAuthenticated();

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

  // login page
  if (root === "login") {
    app.innerHTML = LoginPage();
    return;
  }

  // register page
  if (root === "register") {
    app.innerHTML = RegisterPage();
    return;
  }

  // dashboard
  if (segments.length === 0) {
    app.innerHTML = DashboardPage();
    return;
  }

  // subjects
  if (root === "subjects") {
    app.innerHTML = SubjectsPage();
    return;
  }

  // materi routing
  if (root === "materi") {
    if (!subjectId) {
      window.location.hash = "#/subjects";
      return;
    }
    if (!materialId) {
      app.innerHTML = TopicsPage(subjectId);
      return;
    }
    app.innerHTML = TopicDetailPage(subjectId, materialId);
    return;
  }

  // jadwal/schedules
  if (root === "jadwal") {
    app.innerHTML = SchedulesPage();
    return;
  }

  // kuis/quizzes
  if (root === "kuis") {
    app.innerHTML = QuizzesPage();
    return;
  }

  // Quiz taking
  if (root === "quiz") {
    if (!subjectId) {
      window.location.hash = "#/kuis";
      return;
    }
    app.innerHTML = QuizTakePage(subjectId);
    return;
  }

  // Quiz results
  if (root === "quiz-results") {
    if (!subjectId) {
      window.location.hash = "#/kuis";
      return;
    }
    app.innerHTML = QuizResultsPage(subjectId);
    return;
  }

  // Courses
  if (root === "courses") {
    if (!subjectId) {
      app.innerHTML = CoursesPage();
      return;
    }
    app.innerHTML = CourseDetailPage(subjectId);
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
