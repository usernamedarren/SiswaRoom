import { AuthService } from "../utils/auth.js";
import logoSiswaRoom from "../assets/logosiswaroom.jpg";
import navbarPublicTpl from "./templates/navbar-public.html?raw";
import navbarTeacherTpl from "./templates/navbar-teacher.html?raw";
import navbarDefaultTpl from "./templates/navbar-default.html?raw";

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fill(template, map) {
  let html = template;
  Object.entries(map || {}).forEach(([k, v]) => {
    html = html.replaceAll(k, v ?? "");
  });
  return html;
}

export function Navbar() {
  const user = AuthService.getUser();
  const role = (user?.role || "").toLowerCase();
  const isAdmin = role === "admin";
  const isTeacher = role === "teacher" || role === "guru";

  // Public navbar (before login)
  if (!user) {
    return fill(navbarPublicTpl, { "__LOGO__": logoSiswaRoom });
  }

  // ============================
  // TEACHER NAVBAR (MINIMAL)
  // cuma Guru Panel + userBox + Keluar
  // ============================
  if (isTeacher) {
    return fill(navbarTeacherTpl, {
      "__LOGO__": logoSiswaRoom,
      "__USER_BOX__": userBox(user),
      "__LOGOUT__": logoutButton(),
      "__LOGOUT_MOBILE__": logoutButton(true)
    });
  }

  // ============================
  // NON-TEACHER NAVBAR (student/admin)
  // ============================
  return fill(navbarDefaultTpl, {
    "__LOGO__": logoSiswaRoom,
    "__USER_BOX__": userBox(user),
    "__LOGOUT__": logoutButton(),
    "__LOGOUT_MOBILE__": logoutButton(true),
    "__ADMIN_ITEM__": isAdmin ? navItem("#/admin", "Admin Panel") : "",
    "__ADMIN_MOBILE__": isAdmin ? mobileItem("#/admin", "Admin Panel") : ""
  });
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
  const displayName = escapeHtml(user.name || user.full_name || user.email);
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
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `
    <button type="button" class="mobile-item btn" data-nav="${safeHref}" onclick="window.__suppressIndicatorAnim=true; setTimeout(()=>{window.__suppressIndicatorAnim=false},220); location.hash='${safeHref}'; closeMobileMenu();">${safeLabel}</button>
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
