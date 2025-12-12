import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

export async function initSubject(container, subjectId) {
  try {
    const res = await fetch(new URL('../static/subject.html', import.meta.url).href);
    container.innerHTML = await res.text();
    loadSubject(subjectId);

  } catch (err) {
    container.innerHTML = "<p class='text-gray center'>Gagal memuat halaman.</p>";
  }
}

async function loadSubject(subjectId) {
  try {
    // get subject info
    const subRes = await fetch(`${API_BASE}/subjects/${subjectId}`, {
      headers: AuthService.getAuthHeaders()
    });
    const subject = await subRes.json();

    document.getElementById("subject-title").textContent =
      subject.subject_name || subject.name;

    document.getElementById("subject-description").textContent =
      subject.description || "Tidak ada deskripsi";

    // get topics
    const topicsRes = await fetch(`${API_BASE}/topics?subject_id=${subjectId}`, {
      headers: AuthService.getAuthHeaders()
    });
    const topics = await topicsRes.json();

    const container = document.getElementById("topics-container");
    const noTopics = document.getElementById("no-topics");

    if (!topics || topics.length === 0) {
      container.innerHTML = "";
      noTopics.style.display = "block";
      return;
    }

    noTopics.style.display = "none";

    container.innerHTML = topics.map(renderTopicCard).join("");

    container.querySelectorAll(".topic-card").forEach(card => {
      card.addEventListener("click", () => {
        window.location.hash = `#/materi/${subjectId}/${card.dataset.topicId}`;
      });
    });

  } catch (err) {
    console.error("Error loading subject:", err);
  }
}

function renderTopicCard(topic) {
  return `
    <div class="topic-card fade-in-up" data-topic-id="${topic.topic_id}">
      <h3>📘 ${topic.title}</h3>
      <p>${topic.description || "Tidak ada deskripsi"}</p>
    </div>
  `;
}
