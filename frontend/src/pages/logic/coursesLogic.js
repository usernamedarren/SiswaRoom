import { AuthService } from "../../utils/auth.js";
import { API_BASE } from "../../utils/config.js";

const DUMMY_DATA = false;

// ID video untuk kartu "Lain-lain" (bisa override lewat VITE_OTHER_VIDEO_ID)
const OTHER_VIDEO_ID = (typeof import.meta !== "undefined" && import.meta.env?.VITE_OTHER_VIDEO_ID)
  ? String(import.meta.env.VITE_OTHER_VIDEO_ID)
  : "lain101";

let ALL_COURSES = []; // ⬅️ sumber kebenaran tunggal

function debounce(fn, wait = 180) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

export async function initCourses(container) {
  try {
    // 1️⃣ Load HTML
    const response = await fetch(
      new URL("../static/courses.html", import.meta.url).href
    );
    if (!response.ok) throw new Error(`Failed to load HTML`);

    container.innerHTML = await response.text();

    // 2️⃣ Setup search (debounced) + clear button
    const searchInput = document.getElementById("search-courses");
    const clearBtn = document.getElementById("clear-search");

    const onSearch = debounce((e) => {
      const keyword = e.target.value.trim().toLowerCase();
      const filtered = filterCourses(keyword);
      renderCourses(filtered);
    }, 200);

    searchInput?.addEventListener("input", onSearch);

    clearBtn?.addEventListener("click", () => {
      if (!searchInput) return;
      searchInput.value = "";
      renderCourses(ALL_COURSES);
      searchInput.focus();
    });

    // 3️⃣ Load data dari backend
    await loadCourses();

  } catch (err) {
    console.error("[COURSES] Init failed:", err);
    container.innerHTML = `
      <p class="center text-gray">
        Gagal memuat halaman courses.
      </p>
    `;
  }
}

/* ===============================
   FETCH COURSES (ONCE)
================================ */
async function loadCourses() {
  const container = document.getElementById("courses-container");
  const empty = document.getElementById("no-courses");

  try {
    const res = await fetch(`${API_BASE}/courses`, {
      headers: AuthService.getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed fetching courses");

    const payload = await res.json();
    const data = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);

    ALL_COURSES = data.map(normalizeCourse);

    if (ALL_COURSES.length === 0) {
      if (container) container.innerHTML = "";
      if (empty) empty.style.display = "block";
      return;
    }

    if (empty) empty.style.display = "none";
    renderCourses(ALL_COURSES);

  } catch (err) {
    console.error("[COURSES] Load error:", err);
    if (container) container.innerHTML = `
      <p class="center text-gray">Gagal memuat data courses.</p>
    `;
    if (empty) empty.style.display = "none";
  }
}

/* ===============================
   FRONTEND SEARCH
================================ */
function filterCourses(keyword) {
  if (!keyword) return ALL_COURSES;

  return ALL_COURSES.filter((course) => {
    const title = (course.course_name || course.title || "").toLowerCase();
    const desc = (course.description || "").toLowerCase();
    return title.includes(keyword) || desc.includes(keyword);
  });
}

function normalizeCourse(course) {
  return {
    ...course,
    course_id: course.course_id ?? course.id ?? course.slug ?? "",
    course_name: course.course_name ?? course.name ?? course.title ?? "Course",
    description: course.description ?? course.short_description ?? "",
    instructor: course.instructor || course.teacher_name || (course.teacher_id ? `Guru #${course.teacher_id}` : "-"),
    duration: course.duration || course.duration_minutes || course.duration_hours || null,
  };
}

/* ===============================
   RENDER
================================ */
function renderCourses(courses) {
  const container = document.getElementById("courses-container");
  const empty = document.getElementById("no-courses");

  if (!container) return;

  if (!Array.isArray(courses) || courses.length === 0) {
    container.innerHTML = "";
    if (empty) empty.style.display = "block";
    return;
  }

  if (empty) empty.style.display = "none";

  const MAIN_KEYS = new Set(["math", "eng", "sci", "soc", "cs", "id"]);
  const main = [];
  const other = [];

  courses.forEach((c) => {
    const key = getSubjectKey(c);
    if (MAIN_KEYS.has(key)) main.push(c);
    else other.push(c);
  });

  const renderGrid = (arr, gridClass = "subjects-grid") => `
    <div class="${gridClass}">
      ${arr.map(renderCourseCard).join("")}
    </div>
  `;

  const otherSafe = other.length
    ? other
    : [{
        course_id: OTHER_VIDEO_ID,
        course_name: "Lain-Lain",
        description: "Pelajaran tambahan & pendukung.",
      }];

  container.innerHTML = `
    <section class="subjects-section">
      <div class="subjects-section__head">
        <h2>Pelajaran Utama</h2>
        <p class="text-gray">Materi inti untuk SMP/SMA.</p>
      </div>
      ${renderGrid(main)}
    </section>

    <div class="subjects-divider"></div>

    <section class="subjects-section">
      <div class="subjects-section__head">
        <h2>Lain-lain</h2>
        <p class="text-gray">Pelajaran tambahan & pendukung.</p>
      </div>
      ${renderGrid(otherSafe, "subjects-grid subjects-grid--fixed")}
    </section>
  `;

  container.querySelectorAll(".course-card").forEach(card => {
    card.onclick = () => {
      const id = card.dataset.courseId;
      if (id) location.hash = `#/course/${id}`;
    };
  });

  container.querySelectorAll(".view-course-btn").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.courseId;
      if (id) location.hash = `#/course/${id}`;
    };
  });
}


function getSubjectKey(course) {
  const title = (course.course_name || course.title || "").toLowerCase();
  const id = (course.course_id || course.id || "").toLowerCase();

  if (title.includes("matemat") || id.includes("math")) return "math";
  if (title.includes("inggris") || id.includes("eng")) return "eng";

  if (
    title.includes("biologi") || title.includes("kimia") || title.includes("fisika") ||
    id.includes("bio") || id.includes("chem") || id.includes("phys") ||
    title.includes("ipa") || id.includes("sci")
  ) return "sci";

  if (title.includes("sejarah") || title.includes("ips") || id.includes("soc")) return "soc";
  if (title.includes("informatika") || title.includes("pemrogram") || title.includes("program") || id.includes("cs")) return "cs";
  if (title.includes("bahasa indonesia") || id.includes("id")) return "id";

  if (title.includes("lain")) return "lain";
  return "math";
}



function renderCourseCard(course) {
  const title = course.course_name || course.title || "Course";
  const desc = course.description || "Deskripsi tidak tersedia";
  const instructor = course.instructor || course.teacher_name || "-";
  const duration = course.duration || "-";
  const key = getSubjectKey(course);
  const cid = course.course_id || course.id || "";

  return `
    <div class="subject-card subject-card--thumb course-card fade-in-up"
         data-course-id="${cid}">

      <div class="subject-thumb subject-thumb--${key}"></div>

      <div class="subject-body">
        <h3>${title}</h3>
        <p class="text-gray">${desc}</p>

        <div class="home-cta" style="margin-top:.8rem;">
          <button class="btn btn-secondary btn-sm view-course-btn" data-course-id="${cid}">Lihat Topik</button>
          <button class="btn btn-primary btn-sm view-course-btn" data-course-id="${cid}">Mulai Belajar</button>
        </div>
      </div>

    </div>
  `;
}
