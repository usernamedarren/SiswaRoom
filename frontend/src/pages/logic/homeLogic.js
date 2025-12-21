export async function initHome(container) {
  try {
    const html = await (await fetch(new URL("../static/home.html", import.meta.url))).text();
    container.innerHTML = html;

    // Smooth scroll helpers (used by public navbar or buttons)
    window.scrollToHomeTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollToFeatures = () => {
      const el = document.getElementById("home-features");
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.scrollToHowItWorks = () => {
      const el = document.getElementById("home-how");
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // Wire homepage action buttons (buttons are injected as HTML; attach handlers here)
    const btnLogin = container.querySelector('#home-login-btn');
    if (btnLogin) {
      btnLogin.addEventListener('click', function () {
        if (location.hash === '#/login') {
          window.dispatchEvent(new Event('hashchange'));
        } else {
          location.hash = '#/login';
        }
      });
    }

    const btnCara = container.querySelector('#home-cara-btn');
    if (btnCara) {
      btnCara.addEventListener('click', function () {
        if (location.hash === '#/cara-kerja') {
          window.dispatchEvent(new Event('hashchange'));
        } else {
          location.hash = '#/cara-kerja';
        }
      });
    }

    const btnTry = container.querySelector('#home-try-btn');
    if (btnTry) {
      btnTry.addEventListener('click', function () {
        if (location.hash === '#/login') {
          window.dispatchEvent(new Event('hashchange'));
        } else {
          location.hash = '#/login';
        }
      });
    }
  } catch (e) {
    container.innerHTML = `
      <div class="container">
        <div class="card">
          <h2>Gagal memuat homepage.</h2>
          <p class="text-gray" style="margin-top:.5rem;">Silakan refresh halaman atau coba lagi.</p>
          <div style="margin-top:1rem; display:flex; gap:.75rem; flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="location.hash='#/login'">Masuk</button>
            <button class="btn btn-secondary" onclick="location.hash='#/register'">Daftar</button>
          </div>
        </div>
      </div>
    `;
  }
}
