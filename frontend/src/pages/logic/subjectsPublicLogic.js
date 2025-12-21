export function initSubjectsPublic(app) {
  const mainSubjects = [
    { name: "Matematika", key: "math" },
    { name: "Bahasa Inggris", key: "eng" },
    { name: "IPA", key: "sci" },
    { name: "IPS", key: "soc" },
    { name: "Informatika", key: "cs" },
    { name: "Bahasa Indonesia", key: "id" },
  ];

  // ✅ Section baru: "Lain-lain"
  const otherSubjects = [
    { name: "Lain-Lain", key: "lain" },
  ];

const renderGrid = (arr, gridClass = "subjects-grid") => `
  <div class="${gridClass}">
    ${arr
      .map(
        (s) => `
        <div class="subject-card subject-card--thumb">
          <div class="subject-thumb subject-thumb--${s.key}"></div>

          <div class="subject-body">
            <h3>${s.name}</h3>
            <p class="text-gray">Materi ringkas + latihan singkat untuk bantu kamu fokus.</p>

            <div class="home-cta" style="margin-top:.8rem;">
              <a class="btn btn-secondary btn-sm" href="#/cara-kerja">Cara Kerja</a>
              <a class="btn btn-primary btn-sm" href="#/login">Mulai</a>
            </div>
          </div>
        </div>
      `
      )
      .join("")}
  </div>
`;


  app.innerHTML = `
    <div class="container subjects-page">
      <div class="page-header">
        <h1>Mata Pelajaran</h1>
        <p>Pilih pelajaran, lanjut ke topik, dan mulai belajar secara step-by-step.</p>
      </div>

      <!-- Section 1 -->
      <section class="subjects-section">
        <div class="subjects-section__head">
          <h2>Pelajaran Utama</h2>
          <p class="text-gray">Materi inti untuk SMP/SMA.</p>
        </div>
        ${renderGrid(mainSubjects)}
      </section>

      <div class="subjects-divider"></div>

      <!-- Section 2 -->
      <section class="subjects-section">
        <div class="subjects-section__head">
          <h2>Lain-lain</h2>
          <p class="text-gray">Pelajaran tambahan & pendukung.</p>
        </div>
        ${renderGrid(otherSubjects, "subjects-grid subjects-grid--fixed")}
      </section>
    </div>
  `;
}
