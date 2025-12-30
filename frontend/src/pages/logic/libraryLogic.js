// src/pages/logic/libraryLogic.js
import { AuthService } from "../../utils/auth.js";
import { API_BASE } from "../../utils/config.js";

const DUMMY_DATA = false;

const MOCK_LIBRARY = [
  {
    id: "lib-001",
    title: "Aljabar Linear Dasar",
    type: "ebook",
    subject: "Matematika",
    author: "Tim Akademik",
    year: 2024,
    description: "Ringkasan konsep vektor, matriks, dan transformasi linear.",
    url: "/library/aljebar-linear.pdf",
    tags: ["matematika", "aljabar", "ebook"]
  },
  {
    id: "lib-002",
    title: "Pengantar Biologi Sel",
    type: "pdf",
    subject: "Biologi",
    author: "Laboratorium Hayati",
    year: 2023,
    description: "Struktur sel, organel, pembelahan, dan dasar genetika.",
    url: "/library/pengantarbiologi.pdf",
    tags: ["biologi", "sel", "pdf"]
  },
  {
    id: "lib-003",
    title: "Kumpulan Soal Kimia Dasar",
    type: "bank-soal",
    subject: "Kimia",
    author: "Departemen Kimia",
    year: 2025,
    description: "Latihan stoikiometri, kesetimbangan, dan kinetika.",
    url: "/library/banksoalkimia.pdf",
    tags: ["kimia", "latihan", "bank soal"]
  },
  {
    id: "lib-004",
    title: "Grammar Cheatsheet",
    type: "note",
    subject: "Bahasa Inggris",
    author: "English Club",
    year: 2025,
    description: "Tenses, parts of speech, sentence structure, dan contoh.",
    url: "/library/englishgrammar.pdf",
    tags: ["english", "grammar", "note"]
  }
];

let LIBRARY = [];

export function initLibrary() {
  const isAuth = AuthService.isAuthenticated();
  if (!isAuth) {
    window.location.hash = "#/login";
    return;
  }

  const app = document.getElementById("app");
  app.innerHTML = renderLibraryShell();
  bindLibraryInteractions();
  loadLibrary();
}

async function loadLibrary() {
  const grid = document.getElementById("library-grid");
  try {
    const res = await fetch(`${API_BASE}/library`, {
      headers: AuthService.getAuthHeaders(),
    });

    if (!res.ok) throw new Error(`Failed to fetch library (${res.status})`);

    const payload = await res.json();
    const data = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);

    LIBRARY = data.map(normalizeLibraryItem);

    // Fetch EduToon children's books and merge (dedupe by url/title)
    try {
      const childRes = await fetch(`${API_BASE}/library/edutoon/children`);
      if (childRes.ok) {
        const childBooks = await childRes.json();
        if (Array.isArray(childBooks) && childBooks.length) {
          const normalizedEduChildren = childBooks.map(b => {
            const nb = normalizeEduToonBook(b);
            nb.tags = [...new Set([...(nb.tags||[]), 'Anak'])];
            nb.source = 'EduToon';
            return nb;
          });
          // dedupe: prefer existing local items, otherwise append
          for (const eb of normalizedEduChildren) {
            const exists = LIBRARY.find(l => (l.url && l.url === eb.url) || (l.title && l.title === eb.title));
            if (!exists) LIBRARY.push(eb);
          }
        }
      }
    } catch (e) {
      console.warn('[LIBRARY] Failed to fetch EduToon children books', e.message);
    }
  } catch (err) {
    console.error("[LIBRARY] load error", err);
    if (DUMMY_DATA && !LIBRARY.length) {
      LIBRARY = MOCK_LIBRARY;
    }
    if (!LIBRARY.length) {
      if (grid) grid.innerHTML = `<p class="text-gray">Gagal memuat library.</p>`;
      return;
    }
  }

  renderLibraryList(LIBRARY);
}

function renderLibraryShell() {
  return `
    <div class="container">
      <div class="page-header">
        <div class="page-title">
          <h1>Library</h1>
          <p class="text-gray">Koleksi e-book, catatan, dan bank soal. Cari & unduh materi buat belajar santai.</p>
        </div>
      </div>

      <div class="card" style="margin-bottom:1rem;">
        <div style="display:flex; gap:.5rem; align-items:center; flex-wrap:wrap;">
          <input id="search-input" class="input" placeholder="Cari judul, mata pelajaran, atau tag..." />
          <div class="toolbar-grid">
            <select id="filter-subject" class="select">
              <option value="">Semua Mapel</option>
              <option>Matematika</option>
              <option>Biologi</option>
              <option>Kimia</option>
              <option>Bahasa Inggris</option>
            </select>
            <select id="filter-type" class="select">
              <option value="">Semua Tipe</option>
              <option value="ebook">E-book</option>
              <option value="pdf">PDF</option>
              <option value="bank-soal">Bank Soal</option>
              <option value="note">Catatan</option>
            </select>
            <select id="sort-by" class="select">
              <option value="recent">Terbaru</option>
              <option value="az">A–Z</option>
              <option value="za">Z–A</option>
            </select>
          </div>
        </div>
      </div>

      <div id="library-grid" class="grid grid-3" style="margin-top:1rem;"></div>
    </div>
  `;
}

function bindLibraryInteractions() {
  const search = document.getElementById("search-input");
  const filterSubject = document.getElementById("filter-subject");
  const filterType = document.getElementById("filter-type");
  const sortBy = document.getElementById("sort-by");

  function apply() {
    const q = (search.value || "").toLowerCase();
    const fs = filterSubject.value;
    const ft = filterType.value;
    const sort = sortBy.value;

    let items = LIBRARY.filter(item => {
      const matchQ =
        item.title.toLowerCase().includes(q) ||
        (item.subject || "").toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q));
      const matchSubject = !fs || item.subject === fs;
      const matchType = !ft || item.type === ft;
      return matchQ && matchSubject && matchType;
    });

    if (sort === "az") items.sort((a,b)=>a.title.localeCompare(b.title));
    if (sort === "za") items.sort((a,b)=>b.title.localeCompare(a.title));
    if (sort === "recent") items.sort((a,b)=> (b.year||0) - (a.year||0));

    renderLibraryList(items);
  }

  search.addEventListener("input", apply);
  filterSubject.addEventListener("change", apply);
  filterType.addEventListener("change", apply);
  sortBy.addEventListener("change", apply);
}

function renderLibraryList(items) {
  const grid = document.getElementById("library-grid");
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = `<p class="text-gray">Nggak ketemu apa-apa. Coba ubah kata kunci atau filter ya.</p>`;
    return;
  }
  grid.innerHTML = items.map(renderLibraryCard).join("");
  bindCardActions();
}

function normalizeLibraryItem(item) {
  const tags = [];
  if (item.course_name) tags.push(item.course_name);
  if (item.type) tags.push(item.type);

  return {
    id: item.id || item.library_id || `lib-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title: item.title || "Library Item",
    type: item.type || "pdf",
    subject: item.subject || item.course_name || "Umum",
    author: item.author || item.uploader || "-",
    year: item.year || new Date(item.created_at || Date.now()).getFullYear(),
    description: item.short_description || item.description || "",
    url: item.file_url || item.url || "#",
    tags: item.tags || tags,
  };
}

function normalizeEduToonBook(b) {
  const title = b.title || b.name || 'EduToon Book';
  const url = b.file_url || b.download_url || b.url || '';
  const type = (String(b.type || 'ebook').toLowerCase().includes('ebook')) ? 'ebook' : (b.type || 'pdf');
  const tags = ['EduToon', ...(b.category ? [b.category] : []), ...(Array.isArray(b.tags) ? b.tags : [])];
  return {
    id: `edutoon-${b.id || Math.random().toString(16).slice(2,8)}`,
    title,
    type,
    subject: b.category || 'Umum',
    author: b.author || b.uploader || 'EduToon',
    year: b.year || new Date().getFullYear(),
    description: b.short_description || b.description || '',
    url: url || '#',
    tags,
    source: 'EduToon'
  };
}

function renderLibraryCard(item) {
  return `
    <div class="card library-card fade-in-up" data-tags="${item.tags.join(' ')}">
      <div class="card-head">
        <span class="badge">${badgeIcon(item.type)} ${capitalize(item.type)}</span>
        <span class="muted">${item.year || "-"}</span>
        ${item.source === 'EduToon' ? `<span class="tag" style="margin-left:.6rem;background:#eef">Sumber: EduToon</span>` : ''}
        ${item.tags && item.tags.some(t=>String(t).toLowerCase() === 'anak') ? `<span class="tag" style="margin-left:.4rem;background:#ffd">Buku Anak</span>` : ''}
      </div>
      <h3>${item.title}</h3>
      <p class="text-gray">${item.description}</p>
      <div class="tags" aria-hidden="true">${item.tags.map(t=>`<span class="tag">#${t}</span>`).join(" ")}</div>
      <div class="card-actions">
        <button class="btn outline preview-btn" data-id="${item.id}">Preview</button>
        <button class="btn btn-primary download-btn" data-id="${item.id}">⬇ Unduh</button>
      </div>
    </div>
  `;
}

function bindCardActions() {
  document.querySelectorAll(".download-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = btn.dataset.id;
      const found = LIBRARY.find(x=>x.id===id);
        if (found?.url && found.url !== "#") {
          const a = document.createElement("a");
          a.href = found.url;

          // nama file download (opsional tapi enak)
          a.download = (found.title || "file").replace(/\s+/g, "-") + ".pdf";

          document.body.appendChild(a);
          a.click();
          a.remove();
        } else {
          alert("Contoh dummy: file belum terhubung. Kamu bisa ganti URL di libraryLogic.js");
        }
    });
  });

  document.querySelectorAll(".preview-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = btn.dataset.id;
      const found = LIBRARY.find(x=>x.id===id);
      if (!found) return;
      const modal = document.createElement("div");
      modal.className = "modal";
      modal.innerHTML = `
        <div class="modal-content">
          <h3>${found.title}</h3>
          <p class="text-gray">${found.description}</p>
          <div class="muted" style="margin-top:.6rem; display:flex; flex-direction:column; gap:.25rem;">
            <span><strong>Tipe:</strong> ${capitalize(found.type)}</span>
            <span><strong>Penulis:</strong> ${found.author}</span>
            <span><strong>Mapel:</strong> ${found.subject}</span>
            <span><strong>Tahun:</strong> ${found.year}</span>
          </div>
          <div class="modal-actions" style="margin-top:.8rem;">
            <button class="btn btn-primary" onclick="closeModal(this.closest('.modal'))">Tutup</button>
          </div>
        </div>
      `;
      window.showModal(modal);
    });
  });
}

function badgeIcon(type) {
  if (type === "ebook") return "📖";
  if (type === "pdf") return "📄";
  if (type === "bank-soal") return "🗂️";
  if (type === "note") return "📝";
  return "📦";
}

function capitalize(s){ return (s||'').charAt(0).toUpperCase() + (s||'').slice(1); }
