export function initHowItWorks(app) {
  app.innerHTML = `
    <div class="container subjects-page">
      <div class="page-header">
        <h1>Cara Kerja</h1>
        <p>Alur singkat biar kamu kebayang: mulai materi → latihan → progres.</p>
      </div>

      <div class="home-steps">
        <div class="card">
          <div class="home-step">
            <div class="home-step__num">1</div>
            <div>
              <h3>Pilih Mata Pelajaran</h3>
              <p class="text-gray">Masuk ke pelajaran, lalu pilih topik yang ingin kamu pelajari.</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="home-step">
            <div class="home-step__num">2</div>
            <div>
              <h3>Belajar Materi</h3>
              <p class="text-gray">Materi tersusun rapi per bab—jadi belajarnya lebih cepat.</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="home-step">
            <div class="home-step__num">3</div>
            <div>
              <h3>Kerjakan Quiz</h3>
              <p class="text-gray">Cek pemahaman dengan kuis singkat sebelum lanjut ke topik berikutnya.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card home-cta-card" style="margin-top:1rem;">
        <div>
          <h3>Siap mulai?</h3>
          <p class="text-gray">Masuk untuk mengakses materi lengkap, library, dan quiz.</p>
        </div>
        <div class="home-cta-card__actions">
          <a class="btn btn-secondary" href="#/">Kembali</a>
          <a class="btn btn-primary" href="#/login">Masuk</a>
        </div>
      </div>
    </div>
  `;
}
