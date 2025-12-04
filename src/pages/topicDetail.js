// src/pages/topicDetail.js
import "../styles/topicDetail.css";
import { allTopics } from "../data/allTopics.js";

export function TopicDetailPage(subject, topic) {
  const topics = allTopics[subject];

  // kalau subject tidak ada di allTopics, jangan lanjut .find()
  if (!topics) {
    return `<div class="container"><p>Mata pelajaran tidak ditemukan (${subject}).</p></div>`;
  }

  const data = topics.find((t) => t.slug === topic);

  if (!data) {
    return `<div class="container"><p>Topik tidak ditemukan.</p></div>`;
  }

  return `
    <div class="container detail-container">

      <!-- BACK BUTTON -->
      <div class="back-row">
        <a href="#/materi/${subject}" class="back-link">
          <span class="arrow">←</span>
          Kembali ke Topik
        </a>
      </div>

      <!-- MAIN CARD -->
      <div class="detail-card">

        <h2 class="detail-title">${data.title}</h2>
        <p class="detail-sub">${data.subtitle}</p>

        <div class="detail-section">
          <h3>Deskripsi</h3>
          <p>${data.description}</p>
        </div>

        <div class="detail-section">
          <h3>Poin-poin Penting</h3>
          <ul class="detail-points">
            ${data.points
              .map(
                (p, i) => `
                  <li>
                    <span class="number">${i + 1}</span>
                    ${p}
                  </li>
                `
              )
              .join("")}
          </ul>
        </div>

        <button class="finish-btn">Tandai Selesai</button>

      </div>

    </div>
  `;
}
