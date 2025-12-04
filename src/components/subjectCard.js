export function SubjectCard(iconColor, name, topicCount, topics) {
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")      
    .replace(/[^a-z-]/g, "");  

  return `
    <div class="subject-card" data-slug="${slug}">
      <div class="subject-icon" style="background: ${iconColor}">
        📘
      </div>

      <div class="subject-name">${name}</div>

      <div class="subject-count">${topicCount} topik tersedia</div>

      <div class="subject-topics">
        ${topics
          .map(t => `<span class="topic-tag">${t}</span>`)
          .join("")}
      </div>
    </div>
  `;
}
