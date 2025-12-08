// main.js
import { Navbar } from "./components/navbar.js";
import { router } from "./router.js";
import { AuthService } from "./utils/auth.js";
import "./styles/global.css";

// Auto-login user from localStorage on page load
function initAuth() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  
  if (token && user) {
    // User is already logged in
    console.log("User authenticated:", JSON.parse(user).name);
  } else {
    // Check if trying to access protected route, redirect to login
    const hash = location.hash || "#/";
    const path = hash.replace(/^#\//, "");
    const root = path.split("/")[0] || "";
    
    const protectedRoutes = ["", "subjects", "materi", "jadwal", "kuis"];
    if (protectedRoutes.includes(root)) {
      window.location.hash = "#/login";
    }
  }
}

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
  updateActiveNav();
}

initAuth();
renderAll();
window.addEventListener("hashchange", renderAll);

document.addEventListener("click", (e) => {
  const card = e.target.closest(".subject-card");
  if (!card) return;
  const slug = card.dataset.slug;
  if (!slug) return;
  location.hash = `#/materi/${slug}`;
});
