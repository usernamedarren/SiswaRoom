export function SubjectProgress(subjects) {
  return `
    <div class="subject-progress">
      ${subjects
        .map(
          (s) => `
        <div class="subject-row">
          <div class="subject-label">
            <span>${s.name}</span>
            <span>${s.value}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${s.value}%;"></div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}
