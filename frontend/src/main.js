// main.js
import "./styles/global.css";
import { Navbar, initNavIndicator } from "./components/navbar.js";
import { router } from "./router.js";
import { AuthService } from "./utils/auth.js";
import { API_BASE } from "./utils/config.js";

/* ===============================
   AUTH INIT
================================ */
function initAuth() {
  const isAuth = AuthService.isAuthenticated();
  const hash = location.hash || "#/";
  const root = hash.replace(/^#\//, "").split("/")[0] || "";

  console.debug("[INIT] API_BASE", API_BASE);

  // If user is authenticated at boot, ensure they land on the dashboard instead
  // of the public homepage or auth pages.
  if (isAuth) {
    console.log("User authenticated:", AuthService.getUser()?.name);
    if (root === "" || root === "" || root === "#" || root === "login" || root === "register") {
      // Normalise to root so router will render the dashboard for authenticated users
      location.hash = "#/";
    }
    return;
  }

  // NOTE: Root ("#/") is public and renders the homepage when not authenticated.
  const protectedRoutes = ["courses", "materi", "jadwal", "kuis", "quiz", "course", "admin", "library", "profile"];

  if (protectedRoutes.includes(root)) {
    location.hash = "#/login";
  }
}

/* ===============================
   RENDER APP
================================ */
function renderAll() {
  const hash = location.hash || "#/";
  const root = hash.replace(/^#\//, "").split("/")[0] || "";

  const header = document.getElementById("header");

  // Sembunyikan navbar di login / register (lebih tahan banting)
  const isAuthPage = (root === "login" || root === "register");
  if (isAuthPage) {
    header.innerHTML = "";
    header.style.display = 'none';
    document.body.classList.add('page-auth');
  } else {
    header.style.display = '';
    header.innerHTML = Navbar();
    initNavIndicator();
    document.body.classList.remove('page-auth');
  }

  router();
}


/* ===============================
   BOOTSTRAP
================================ */
initAuth();
renderAll();

window.addEventListener("hashchange", renderAll);

/* ===============================
   GLOBAL LINK HANDLER
   - intercept internal anchor links (href="#/..."), navigate via router and
     dispatch hashchange when already on the same route so views re-render
================================ */
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#/"]');
  if (!a) return;
  e.preventDefault();
  const href = a.getAttribute('href');
  if (location.hash === href) {
    window.dispatchEvent(new Event('hashchange'));
  } else {
    location.hash = href;
  }
});

/* ===============================
   GLOBAL CARD CLICK (COURSES)
================================ */
document.addEventListener("click", (e) => {
  const card = e.target.closest(".course-card, .subject-card");
  if (!card) return;

  const courseId = card.dataset.courseId || card.dataset.slug;
  if (!courseId) return;

  location.hash = `#/course/${courseId}`;
});

/* ----------------------------
   GLOBAL MODAL HELPERS
   - use showModal(modal) to append + show and manage overlay
   - use closeModal(modal) to remove and clean overlay
   ---------------------------- */
window.showModal = (modal) => {
  if (!modal) return;
  document.body.appendChild(modal);
  // click on backdrop to close
  modal.addEventListener('click', (ev) => { if (ev.target === modal) window.closeModal(modal); });
  // show + enable dim overlay
  setTimeout(() => {
    modal.classList.add('show');
    document.body.classList.add('overlay-open');
  }, 10);
  return modal;
};

window.closeModal = (modal) => {
  if (!modal) return;
  try { if (modal.parentNode) modal.parentNode.removeChild(modal); } catch (e) {}
  // if other modals are still open or mobile menu is open, keep overlay
  const hasOpenModal = !!document.querySelector('.modal.show');
  const mobileOpen = !!document.getElementById('mobile-menu')?.classList.contains('show');
  if (!hasOpenModal && !mobileOpen) document.body.classList.remove('overlay-open');
};
