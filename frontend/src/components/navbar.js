import { AuthService } from "../utils/auth.js";

export function Navbar() {
  const user = AuthService.getUser();

  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";

  // Public navbar (before login)
  if (!user) {
    return `
<header class="navbar">
  <div class="navbar-inner">
    <a href="#/" class="logo logo-wrap" onclick="goHomeAndScroll('top')">
      <img class="logo-img" src="/src/assets/logosiswaroom.jpg" alt="SiswaRoom Logo" />
      <span class="logo-text">SiswaRoom</span>
    </a>

    <nav class="nav-center" id="nav-center">
      <a href="#/" class="nav-item" onclick="goHomeAndScroll('top')">Home</a>
      <a href="#/cara-kerja" class="nav-item" onclick="goHomeAndScroll('features')">Cara Kerja</a>
      <a href="#/mata-pelajaran" class="nav-item" onclick="goHomeAndScroll('how')">Mata Pelajaran</a>
      <a href="#/librarypublic" class="nav-item" onclick="goHomeAndScroll('how')">Library</a>
      <a href="#/quizpublic" class="nav-item" onclick="goHomeAndScroll('how')">Quiz</a>
      <span class="nav-indicator" id="nav-indicator"></span>
    </nav>

    <div class="nav-right">
      <a href="#/login" class="btn btn-secondary" style="text-decoration:none; display:inline-flex; align-items:center;">Masuk</a>
      <a href="#/register" class="btn btn-primary" style="text-decoration:none; display:inline-flex; align-items:center;">Daftar</a>
    </div>

    <button class="mobile-toggle"
      onmouseenter="openMobileMenu()"
      onclick="openMobileMenu()">☰</button>
  </div>

  <div class="mobile-menu" id="mobile-menu" onmouseleave="closeMobileMenu()">
    <button type="button" class="mobile-item btn" onclick="goHomeAndScroll('top'); closeMobileMenu();">Beranda</button>
    <button type="button" class="mobile-item btn" onclick="goHomeAndScroll('features'); closeMobileMenu();">Fitur</button>
    <button type="button" class="mobile-item btn" onclick="goHomeAndScroll('how'); closeMobileMenu();">Cara Kerja</button>
    <button type="button" class="mobile-item btn" onclick="location.hash='#/login'; closeMobileMenu();">Masuk</button>
    <button type="button" class="mobile-item btn" onclick="location.hash='#/register'; closeMobileMenu();">Daftar</button>
  </div>
</header>
`;
  }

  // ============================
  // TEACHER NAVBAR (MINIMAL)
  // cuma Guru Panel + userBox + Keluar
  // ============================
  if (isTeacher) {
  return `
<header class="navbar">
  <div class="navbar-inner">
    <a href="#/teacher?tab=materi" class="logo">SiswaRoom</a>

    <nav class="nav-center" id="nav-center">
      ${navItem("#/teacher?tab=materi", "Materi")}
      ${navItem("#/teacher?tab=video", "Video")}
      ${navItem("#/teacher?tab=kuis", "Kuis")}
      <span class="nav-indicator" id="nav-indicator"></span>
    </nav>

    <div class="nav-right">
      ${userBox(user)}
      ${logoutButton()}
    </div>

    <button class="mobile-toggle"
      onmouseenter="openMobileMenu()"
      onclick="openMobileMenu()">☰</button>
  </div>

  <div class="mobile-menu" id="mobile-menu"
       onmouseleave="closeMobileMenu()">
    ${mobileItem("#/teacher?tab=materi", "Materi")}
    ${mobileItem("#/teacher?tab=video", "Video")}
    ${mobileItem("#/teacher?tab=kuis", "Kuis")}
    ${userBox(user)}
    ${logoutButton(true)}
  </div>
</header>
`;
}


  // ============================
  // NON-TEACHER NAVBAR (student/admin)
  // tetap kayak punyamu, cuma admin panel pakai isAdmin
  // ============================
  return `
<header class="navbar">
  <div class="navbar-inner">
    <a href="#/" class="logo">SiswaRoom</a>

    <nav class="nav-center" id="nav-center">
      ${navItem("#/", "Dashboard")}
      ${navItem("#/courses", "Mata Pelajaran")}
      ${navItem("#/library", "Library")}
      ${navItem("#/kuis", "Quiz")}
      ${isAdmin ? navItem("#/admin", "Admin Panel") : ""}
      <span class="nav-indicator" id="nav-indicator"></span>
    </nav>

    <div class="nav-right">
      ${userBox(user)}
      ${logoutButton()}
    </div>

    <button class="mobile-toggle"
      onmouseenter="openMobileMenu()"
      onclick="openMobileMenu()">☰</button>
  </div>

  <div class="mobile-menu" id="mobile-menu"
       onmouseleave="closeMobileMenu()">
    ${mobileItem("#/", "Dashboard")}
    ${mobileItem("#/profile", "Profil")}
    ${mobileItem("#/library", "Library")}
    ${mobileItem("#/courses", "Mata Pelajaran")}
    ${mobileItem("#/jadwal", "Jadwal")}
    ${mobileItem("#/kuis", "Quiz")}
    ${isAdmin ? mobileItem("#/admin", "Admin Panel") : ""}
    ${userBox(user)}
    ${logoutButton(true)}
  </div>
</header>
`;
}

export function initNavIndicator() {
  const nav = document.getElementById("nav-center");
  const indicator = document.getElementById("nav-indicator");
  if (!nav || !indicator) return;

  const items = [...nav.querySelectorAll(".nav-item")];

  let activeItem = items.find(i => i.getAttribute("href") === location.hash);

  if (!window.__lastActiveNav) {
    try { window.__lastActiveNav = mapHashToNav(location.hash); } catch (e) { window.__lastActiveNav = '#/'; }
  }

  if (!activeItem) {
    const current = location.hash || '#/';
    let mapped = current;
    if (current.startsWith('#/course') || current.startsWith('#/materi') || current.startsWith('#/subjects')) {
      mapped = '#/courses';
    } else if (current.startsWith('#/quiz') || current.startsWith('#/kuis')) {
      mapped = '#/kuis';
    } else if (current.startsWith('#/schedule') || current.startsWith('#/jadwal')) {
      mapped = '#/jadwal';
    } else if (current.startsWith('#/teacher')) {
      mapped = '#/teacher';
    }

    let bestMatch = null;
    let bestLen = -1;
    items.forEach(i => {
      const href = i.getAttribute('href') || '';
      if (href === mapped) {
        bestMatch = i;
        bestLen = href.length;
      } else if (mapped.startsWith(href) && href.length > bestLen) {
        bestMatch = i;
        bestLen = href.length;
      }
    });

    activeItem = bestMatch || items.find(i => i.getAttribute('href') === window.__lastActiveNav) || items[0];
  }

  const moveIndicator = (el) => {
    try { indicator.style.opacity = '0'; } catch(e) {}
    indicator.style.width = el.offsetWidth + "px";
    indicator.style.transform = `translateX(${el.offsetLeft}px)`;
    requestAnimationFrame(() => {
      indicator.style.opacity = '1';
    });
  };

  const mappedCurrent = mapHashToNav(location.hash);
  const now = Date.now();
  if ((window.__suppressIndicatorUntil && now < window.__suppressIndicatorUntil) || window.__suppressIndicatorAnim) {
    const originalTransition = indicator.style.transition;
    indicator.style.transition = 'none';
    moveIndicator(activeItem);
    void indicator.offsetWidth;
    indicator.style.transition = originalTransition || '';
    try { window.__lastActiveNav = activeItem.getAttribute('href'); window.__lastIndicatorMapped = mappedCurrent; } catch (e) {}
    try { items.forEach(i => i.classList.toggle('active', i === activeItem)); } catch (e) {}
    try { window.__suppressIndicatorAnim = false; delete window.__suppressIndicatorUntil; } catch (e) {}
    return;
  }

  if (window.__lastIndicatorMapped && window.__lastIndicatorMapped === mappedCurrent) {
    moveIndicator(activeItem);
    try { window.__lastActiveNav = activeItem.getAttribute('href'); } catch (e) {}
    try { items.forEach(i => i.classList.toggle('active', i === activeItem)); } catch (e) {}
    return;
  }

  const prevHref = window.__lastActiveNav || mappedCurrent;
  let prevItem = items.find(i => i.getAttribute('href') === prevHref);

  if (!prevItem || prevItem === activeItem) {
    moveIndicator(activeItem);
  } else {
    const originalTransition = indicator.style.transition;
    indicator.style.transition = 'none';
    moveIndicator(prevItem);
    void indicator.offsetWidth;
    indicator.style.transition = originalTransition || '';
    moveIndicator(activeItem);
  }

  try { window.__lastActiveNav = activeItem.getAttribute('href'); window.__lastIndicatorMapped = mappedCurrent; } catch (e) {};
  items.forEach(i => i.classList.toggle('active', i === activeItem));

  items.forEach(item => {
    item.onmouseenter = () => moveIndicator(item);
    item.onclick = () => {
      activeItem = item;
      items.forEach(i => i.classList.toggle('active', i === activeItem));
      try { window.__suppressIndicatorAnim = true; window.__suppressIndicatorUntil = Date.now() + 600; } catch (e) {}
      moveIndicator(activeItem);
      try { window.__lastActiveNav = activeItem.getAttribute('href'); } catch (e) {}
    };
    item.onmouseleave = () => moveIndicator(activeItem);
  });
}

function navItem(href, label) {
  return `
    <a href="${href}" class="nav-item" data-nav="${href}">
      ${label}
    </a>
  `;
}

function mapHashToNav(hash) {
  const raw = hash || location.hash || '#/';
  const h = raw.split('?')[0]; // buang query ?tab=...
  if (h.startsWith('#/course') || h.startsWith('#/materi') || h.startsWith('#/subjects')) return '#/courses';
  if (h.startsWith('#/quiz') || h.startsWith('#/kuis')) return '#/kuis';
  if (h.startsWith('#/schedule') || h.startsWith('#/jadwal')) return '#/jadwal';
  if (h.startsWith('#/admin')) return '#/admin';
  if (h.startsWith('#/teacher')) {
    // biar indikator tetap bisa match item yang punya query:
    // fallback: match berdasarkan raw hash kalau ada exact link
    return raw;
  }
  if (h === '#/' || h === '#') return '#/';
  return h.split('/')[0] ? '#/' + h.replace('#/','').split('/')[0] : '#/';
}


function storePrevNav(e) {
  try {
    const oldHash = new URL(e.oldURL).hash || '#/';
    window.__lastActiveNav = mapHashToNav(oldHash);
  } catch (err) {}
}

window.addEventListener("load", initNavIndicator);
window.addEventListener("hashchange", storePrevNav);
window.addEventListener("hashchange", initNavIndicator);

window.openMobileMenu = () => {
  document.getElementById("mobile-menu")?.classList.add("show");
  document.body.classList.add('overlay-open');
};

window.closeMobileMenu = () => {
  document.getElementById("mobile-menu")?.classList.remove("show");
  document.body.classList.remove('overlay-open');
};

window.goHomeAndScroll = (target = 'top') => {
  const go = () => {
    if (target === 'features' && typeof window.scrollToFeatures === 'function') return window.scrollToFeatures();
    if (target === 'how' && typeof window.scrollToHowItWorks === 'function') return window.scrollToHowItWorks();
    if (typeof window.scrollToHomeTop === 'function') return window.scrollToHomeTop();
    return window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if ((location.hash || '#/') === '#/' || (location.hash || '#/') === '#') {
    setTimeout(go, 0);
    return;
  }

  location.hash = '#/';
  setTimeout(go, 80);
};

function userBox(user) {
  if (!user) return `<a href="#/login" class="btn btn-login">Masuk</a>`;
  const displayName = user.name || user.full_name || user.email;
  return `
    <a class="nav-user" id="nav-user" href="#/profile" title="Lihat profil">
      <span class="user-avatar">👤</span>
      <div class="user-info">
        <strong>${displayName}</strong>
        <small>${AuthService.getRoleDisplay()}</small>
      </div>
    </a>
  `;
}

function logoutButton(isMobile = false) {
  const user = AuthService.getUser();
  if (!user) return "";
  const id = isMobile ? "mobile-logout" : "logout-btn";
  return `
    <button id="${id}" class="btn btn-logout" onclick="handleLogout()">Keluar</button>
  `;
}

function mobileItem(href, label) {
  return `
    <button type="button" class="mobile-item btn" data-nav="${href}" onclick="window.__suppressIndicatorAnim=true; setTimeout(()=>{window.__suppressIndicatorAnim=false},220); location.hash='${href}'; closeMobileMenu();">${label}</button>
  `;
}

window.handleLogout = () => {
  // show modal confirmation instead of native confirm()
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Keluar</h3>
      <p class="text-gray">Anda yakin ingin logout?</p>
      <div class="modal-actions" style="margin-top:.8rem; display:flex; gap:.5rem; justify-content:flex-end;">
        <button class="btn" onclick="closeModal(this.closest('.modal'))">Batal</button>
        <button class="btn btn-primary" id="confirm-logout-btn">Keluar</button>
      </div>
    </div>
  `;
  window.showModal(modal);

  modal.querySelector('#confirm-logout-btn').addEventListener('click', () => {
    window.closeModal(modal);
    AuthService.clearAuth();
      if (location.hash !== "#/") {
      window.location.hash = "#/";
    } else {
        window.dispatchEvent(new Event('hashchange'));
    }
  });
};
