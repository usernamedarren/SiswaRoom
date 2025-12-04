// router.js
import { DashboardPage } from "./pages/dashboard.js";
import { SubjectsPage } from "./pages/subjects.js";
import { TopicsPage } from "./pages/topics.js";
import { TopicDetailPage } from "./pages/topicDetail.js";

export function router() {
  const app = document.getElementById("app");

  const hash = location.hash || "#/";
  const path = hash.replace(/^#\//, "");
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0) {
    app.innerHTML = DashboardPage();
    return;
  }

  const [root, subjectSlug, topicSlug] = segments;

  if (root === "materi") {
    // "#/materi"
    if (!subjectSlug) {
      app.innerHTML = SubjectsPage();
      return;
    }

    if (subjectSlug && !topicSlug) {
      app.innerHTML = TopicsPage(subjectSlug);
      return;
    }

    if (subjectSlug && topicSlug) {
      app.innerHTML = TopicDetailPage(subjectSlug, topicSlug);
      return;
    }
  }


  app.innerHTML = `
    <div class="container" style="padding:40px">
      <h2>Halaman tidak ditemukan</h2>
    </div>
  `;
}
