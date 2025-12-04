// main.js
import { Navbar } from "./components/navbar.js";
import { router } from "./router.js";
import "./styles/global.css";

document.getElementById("header").innerHTML = Navbar();
router();
window.addEventListener("hashchange", () => {
  document.getElementById("header").innerHTML = Navbar();
  router();
});

function updateActiveNav() {
  const current = location.hash || "#/";
  const links = document.querySelectorAll(".nav-menu a");

  links.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === current) {
      link.classList.add("active");
    }
  });
}

function renderAll() {
  document.getElementById("header").innerHTML = Navbar();
  router();
  updateActiveNav(); // 🔥 tambahkan ini
}

renderAll();
window.addEventListener("hashchange", renderAll);

document.addEventListener("click", (e) => {
  const card = e.target.closest(".subject-card");
  if (!card) return;

  const slug = card.dataset.slug;
  if (!slug) return;

  location.hash = `#/materi/${slug}`;
});