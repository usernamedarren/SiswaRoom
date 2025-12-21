export function initLibraryPublic(app) {
  app.innerHTML = `
    <div class="container subjects-page">
      <div class="page-header library-public__head">
        <h1>Library</h1>
        <p>
          Ruang kumpulan bahan belajar: rangkuman, buku, dan dokumen pendukung.
          Masuk untuk akses koleksi lengkap dan fitur pencarian.
        </p>

        <div class="library-public__cta">
          <a class="btn btn-primary" href="#/login">Mulai</a>
          <a class="btn btn-secondary" href="#/cara-kerja">Cara Kerja</a>
        </div>
      </div>

      <section class="library-public__grid">
        <div class="lp-card">
          <div class="lp-card__top">
            <span class="lp-pill">📚 Koleksi Terstruktur</span>
          </div>
          <h3>Materi rapi per kategori</h3>
          <p class="text-gray">
            Temukan rangkuman, modul, dan dokumen belajar yang dikelompokkan agar cepat dicari.
          </p>
        </div>

        <div class="lp-card">
          <div class="lp-card__top">
            <span class="lp-pill">🔎 Pencarian Cepat</span>
          </div>
          <h3>Cari topik dalam hitungan detik</h3>
          <p class="text-gray">
            Masuk untuk menggunakan pencarian, filter, dan rekomendasi materi sesuai kebutuhanmu.
          </p>
        </div>

        <div class="lp-card">
          <div class="lp-card__top">
            <span class="lp-pill">✅ Siap Dipakai</span>
          </div>
          <h3>Belajar lebih fokus</h3>
          <p class="text-gray">
            Gunakan library sebagai referensi saat mengerjakan latihan, kuis, atau memahami konsep.
          </p>
        </div>
      </section>

      <section class="library-public__ctaCard">
        <div>
          <h3>Siap akses koleksi lengkap?</h3>
          <p class="text-gray">
            Masuk untuk membuka library penuh, menyimpan favorit, dan melanjutkan belajar.
          </p>
        </div>
        <div class="library-public__ctaActions">
          <a class="btn btn-primary" href="#/login">Masuk & Mulai</a>
          <a class="btn btn-ghost" href="#/register">Daftar</a>
        </div>
      </section>
    </div>
  `;
}
