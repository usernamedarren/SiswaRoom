export function initQuizPublic(app) {
  app.innerHTML = `
    <div class="container subjects-page">
      <div class="page-header quiz-public__head">
        <h1>Quiz</h1>
        <p>
          Kuis singkat untuk mengukur pemahamanmu. Kerjakan per bab, dapatkan skor,
          dan pantau progres belajar. Masuk untuk mulai mengerjakan.
        </p>

        <div class="quiz-public__cta">
          <a class="btn btn-primary" href="#/login">Mulai</a>
          <a class="btn btn-secondary" href="#/cara-kerja">Cara Kerja</a>
        </div>
      </div>

      <section class="quiz-public__grid">
        <div class="qp-card">
          <div class="qp-card__top">
            <span class="qp-pill">⚡ Cepat</span>
          </div>
          <h3>5–10 menit per kuis</h3>
          <p class="text-gray">
            Cocok untuk pemanasan sebelum belajar atau latihan singkat setelah membaca materi.
          </p>
        </div>

        <div class="qp-card">
          <div class="qp-card__top">
            <span class="qp-pill">🎯 Terarah</span>
          </div>
          <h3>Per bab & topik</h3>
          <p class="text-gray">
            Soal dibuat per topik supaya kamu tahu bagian mana yang perlu diulang.
          </p>
        </div>

        <div class="qp-card">
          <div class="qp-card__top">
            <span class="qp-pill">📈 Progres</span>
          </div>
          <h3>Skor & evaluasi</h3>
          <p class="text-gray">
            Masuk untuk melihat hasil, riwayat kuis, dan rekomendasi latihan berikutnya.
          </p>
        </div>
      </section>

      <section class="quiz-public__ctaCard">
        <div>
          <h3>Siap uji pemahamanmu?</h3>
          <p class="text-gray">
            Masuk untuk membuka paket kuis lengkap dan mulai mengerjakan.
          </p>
        </div>

        <div class="quiz-public__ctaActions">
          <a class="btn btn-primary" href="#/login">Masuk & Mulai</a>
          <a class="btn btn-ghost" href="#/register">Daftar</a>
        </div>
      </section>
    </div>
  `;

  // apply progress color tiers to any rendered progress bars (static samples)
  function applyProgressTiers() {
    const bars = app.querySelectorAll('.quiz-progress-bar');
    bars.forEach(bar => {
      const w = bar.style.width || getComputedStyle(bar).width;
      // extract percentage if available (e.g., '35%')
      const match = bar.style.width.match(/(\d+)%/);
      let percent = null;
      if (match) percent = parseInt(match[1], 10);
      else {
        // try to compute percent relative to parent
        const parent = bar.parentElement;
        if (parent) {
          const parentWidth = parseFloat(getComputedStyle(parent).width);
          const barWidth = parseFloat(getComputedStyle(bar).width);
          if (parentWidth && !isNaN(parentWidth)) {
            percent = Math.round((barWidth / parentWidth) * 100);
          }
        }
      }

      if (percent === null || isNaN(percent)) return;
      bar.classList.remove('progress-low','progress-mid','progress-high');
      if (percent <= 50) bar.classList.add('progress-low');
      else if (percent <= 75) bar.classList.add('progress-mid');
      else bar.classList.add('progress-high');
    });
  }

  // run after DOM inserted
  requestAnimationFrame(applyProgressTiers);
}
