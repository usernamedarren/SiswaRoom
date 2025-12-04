// src/pages/topics.js
import "../styles/subject.css";
import { allTopics } from "../data/allTopics.js";

export function TopicsPage(subjectSlug) {
  const topics = allTopics[subjectSlug];

  if (!topics) {
    return `
      <div class="back-container">
        <a href="#/materi" class="back-link">← Kembali ke Mata Pelajaran</a>
      </div>

      <div class="container subject-page">
        <p>Topik untuk mata pelajaran ini belum tersedia (${subjectSlug}).</p>
      </div>
    `;
  }

  return `
    <!-- BACK BUTTON: Tidak ikut center -->
    <div class="back-container">
      <a href="#/materi" class="back-link">
        ← Kembali ke Mata Pelajaran
      </a>
    </div>

    <!-- MAIN CONTENT -->
    <div class="container subject-page">

      <h3 class="subject-title">${formatTitle(subjectSlug)}</h3>
      <p class="subject-subtitle">Pilih topik yang ingin dipelajari</p>

      <div class="topic-container">
        ${topics
          .map(
            (t) => `
            <div class="topic-card">
              <div class="topic-icon">📘</div>
              <div class="topic-name">${t.title}</div>
              <p class="topic-desc">${t.subtitle}</p>

              <a href="#/materi/${subjectSlug}/${t.slug}" class="topic-btn">
                Mulai Belajar
              </a>
            </div>
          `
          )
          .join("")}
      </div>
    </div>
  `;
}

function formatTitle(slug) {
  if (slug === "bahasa-indonesia") return "Bahasa Indonesia";
  if (slug === "bahasa-inggris") return "Bahasa Inggris";
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
