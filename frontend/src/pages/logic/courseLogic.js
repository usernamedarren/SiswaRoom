import { AuthService } from "../../utils/auth.js";
import { isQuizCompleted } from "../../utils/quizProgress.js";
import { API_BASE } from "../../utils/config.js";

const DUMMY_DATA = false;
const MOCK_COURSE_DETAILS = {
  math101: {
    course_id: 'math101',
    course_name: 'Matematika Dasar',
    description: 'Kursus pengantar matematika',
    teacher_name: 'Pak Budi',
    stats: { total_materials: 10, total_quizzes: 10, avg_quiz_score: 75 },
    is_enrolled: true,
    materials: [
      {
        title: 'Bilangan Bulat dan Pecahan',
        description: 'Pelajari operasi bilangan bulat, pecahan, dan aplikasinya dalam kehidupan sehari-hari',
        content: 'Bilangan bulat adalah bilangan yang terdiri dari bilangan negatif, nol, dan bilangan positif. Pecahan adalah bilangan yang menyatakan bagian dari keseluruhan. Materi ini membahas operasi dasar dan contoh penerapan.',
        // Dummy video URL (backend will provide real URLs later)
        video: 'https://www.w3schools.com/html/mov_bbb.mp4',
        points: [
          'Operasi penjumlahan dan pengurangan bilangan bulat',
          'Perkalian dan pembagian bilangan bulat',
          'Pecahan biasa, desimal, dan persen',
          'Operasi pada pecahan'
        ]
      },
      {
        title: 'Aljabar Dasar',
        description: 'Memahami variabel, persamaan linear, dan pertidaksamaan',
        content: 'Aljabar merupakan dasar untuk menyelesaikan persamaan. Di sini Anda akan belajar menyusun dan menyelesaikan persamaan linear sederhana serta mengerti konsep variabel.',
        points: [
          'Pengertian variabel dan konstanta',
          'Menyelesaikan persamaan linear',
          'Pertidaksamaan dan grafiknya',
          'Penerapan aljabar dalam masalah riil'
        ]
      },
      {
        title: 'Geometri dan Bangun Ruang',
        description: 'Mengenal bangun datar, bangun ruang, dan rumus-rumusnya',
        content: 'Materi ini membahas sifat-sifat bangun datar dan bangun ruang serta rumus luas, keliling, volume yang sering digunakan dalam soal-soal matematika.',
        points: [
          'Sifat dan rumus bangun datar (persegi, segitiga, lingkaran)',
          'Volume dan luas permukaan bangun ruang (kubus, balok, tabung)',
          'Penerapan rumus pada soal cerita',
          'Strategi pemecahan masalah geometri'
        ]
      },
      {
        title: 'Statistika dan Peluang',
        description: 'Menganalisis data, mean, median, modus, dan peluang kejadian',
        content: 'Belajar dasar-dasar statistika untuk menganalisis kumpulan data dan memahami konsep peluang serta penerapannya dalam kehidupan sehari-hari.',
        points: [
          'Menghitung mean, median, dan modus',
          'Mengukur sebaran data (range, varians, standar deviasi)',
          'Pengenalan peluang dan aturan dasar',
          'Menganalisis contoh data nyata'
        ]
      }
    ],
    quizzes: [
      { id: 'q1', title: 'Kuis Matematika 1', question_count: 10 },
      { id: 'q2', title: 'Kuis Matematika 2', question_count: 8 },
      { id: 'q3', title: 'Kuis Matematika 3', question_count: 12 },
      { id: 'q4', title: 'Kuis Matematika 4', question_count: 10 },
      { id: 'q5', title: 'Kuis Matematika 5', question_count: 15 },
      { id: 'q6', title: 'Kuis Matematika 6', question_count: 10 },
      { id: 'q7', title: 'Kuis Matematika 7', question_count: 9 },
      { id: 'q8', title: 'Kuis Matematika 8', question_count: 11 },
      { id: 'q9', title: 'Kuis Matematika 9', question_count: 10 },
      { id: 'q10', title: 'Kuis Matematika 10', question_count: 7 }
    ]
  },
  bio101: {
    course_id: 'bio101',
    course_name: 'Biologi Dasar',
    description: 'Kursus pengantar biologi',
    teacher_name: 'Bu Ani',
    stats: { total_materials: 8, total_quizzes: 6, avg_quiz_score: 80 },
    is_enrolled: false,
    materials: [
      { title: 'Bab 1: Sel', description: 'Struktur dan fungsi sel' },
      { title: 'Bab 2: Jaringan', description: 'Jenis jaringan tubuh' },
      { title: 'Bab 3: Sistem Organ', description: 'Sistem pernapasan' },
      { title: 'Bab 4: Genetika', description: 'Dasar pewarisan' },
      { title: 'Bab 5: Evolusi', description: 'Teori evolusi' },
      { title: 'Bab 6: Ekologi', description: 'Interaksi organisme dan lingkungan' },
      { title: 'Bab 7: Mikrobiologi', description: 'Mikroorganisme' },
      { title: 'Bab 8: Anatomi', description: 'Struktur tubuh' }
    ],
    quizzes: [
      { id: 'q11', title: 'Kuis Biologi 1', question_count: 10 },
      { id: 'q12', title: 'Kuis Biologi 2', question_count: 8 },
      { id: 'q13', title: 'Kuis Biologi 3', question_count: 10 },
      { id: 'q14', title: 'Kuis Biologi 4', question_count: 7 },
      { id: 'q15', title: 'Kuis Biologi 5', question_count: 9 },
      { id: 'q16', title: 'Kuis Biologi 6', question_count: 6 }
    ]
  },
  chem101: {
    course_id: 'chem101',
    course_name: 'Kimia Dasar',
    description: 'Dasar reaksi kimia dan eksperimen sederhana',
    teacher_name: 'Pak Rahman',
    stats: {
      total_materials: 8,
      total_quizzes: 5,
      avg_quiz_score: 70
    },
    is_enrolled: true,
    materials: [
      {
        title: 'Pengenalan Atom',
        description: 'Struktur atom dan partikel penyusunnya'
      },
      {
        title: 'Reaksi Kimia',
        description: 'Jenis-jenis reaksi kimia'
      }
    ],
    quizzes: [
      {
        title: 'Kuis Atom',
        question_count: 10
      }
    ]
  },
  phys101: {
    course_id: "phys101",
    course_name: "Fisika",
    description: "Mekanika, gelombang, dan listrik dasar.",
    teacher_name: "Pak Andi",
    stats: {
      total_materials: 10,
      total_quizzes: 5,
      avg_quiz_score: 78,
    },
    is_enrolled: true,
    materials: [
      { title: "Besaran & Satuan", description: "Konsep besaran pokok/turunan dan satuan SI." },
      { title: "Gerak Lurus", description: "GLB, GLBB, grafik posisi–waktu, kecepatan–waktu." },
      { title: "Hukum Newton", description: "Gaya, massa, percepatan, dan penerapannya." },
      { title: "Usaha & Energi", description: "Energi kinetik/potensial, usaha, dan kekekalan energi." },
    ],
    quizzes: [
      { title: "Kuis Gerak Lurus", question_count: 10 },
      { title: "Kuis Hukum Newton", question_count: 10 },
    ],
  },

  eng101: {
    course_id: "eng101",
    course_name: "Bahasa Inggris",
    description: "Grammar, reading, dan latihan kuis singkat.",
    teacher_name: "Bu Siti",
    stats: {
      total_materials: 8,
      total_quizzes: 4,
      avg_quiz_score: 82,
    },
    is_enrolled: true,
    materials: [
      { title: "Basic Grammar", description: "Parts of speech & sentence structure dasar." },
      { title: "Tenses (Present)", description: "Simple present & present continuous + contoh." },
      { title: "Reading: Main Idea", description: "Cara menemukan ide pokok dan detail penting." },
      { title: "Vocabulary Builder", description: "Latihan kosakata yang sering muncul." },
    ],
    quizzes: [
      { title: "Quiz: Tenses", question_count: 10 },
      { title: "Quiz: Reading", question_count: 8 },
    ],
  },

  id101: {
    course_id: "id101",
    course_name: "Bahasa Indonesia",
    description: "Meningkatkan literasi, memahami teks, dan menulis dengan baik.",
    teacher_name: "Bu Rina",
    stats: {
      total_materials: 9,
      total_quizzes: 4,
      avg_quiz_score: 80,
    },
    is_enrolled: true,
    materials: [
      { title: "Teks Eksposisi", description: "Struktur, kaidah kebahasaan, dan contoh." },
      { title: "Teks Narasi", description: "Alur, tokoh, latar, dan sudut pandang." },
      { title: "Ejaan & Tanda Baca", description: "PUEBI dasar yang sering dipakai." },
      { title: "Ringkasan & Parafrasa", description: "Teknik meringkas tanpa mengubah makna." },
    ],
    quizzes: [
      { title: "Kuis PUEBI", question_count: 10 },
      { title: "Kuis Teks Eksposisi", question_count: 8 },
    ],
  },

  cs101: {
    course_id: "cs101",
    course_name: "Informatika",
    description: "Logika komputasi, algoritma dasar, dan pemrograman pemula.",
    teacher_name: "Pak Dimas",
    stats: {
      total_materials: 10,
      total_quizzes: 5,
      avg_quiz_score: 76,
    },
    is_enrolled: true,
    materials: [
      { title: "Pengenalan Informatika", description: "Apa itu komputer, software, dan data." },
      { title: "Algoritma & Flowchart", description: "Langkah-langkah solusi & diagram alur." },
      { title: "Variabel & Tipe Data", description: "Konsep variabel, input/output sederhana." },
      { title: "Percabangan & Perulangan", description: "If-else, for/while, dan contoh kasus." },
    ],
    quizzes: [
      { title: "Kuis Algoritma", question_count: 10 },
      { title: "Kuis Percabangan", question_count: 10 },
    ],
  },
  lain101: {
  course_id: "lain101",
  course_name: "Lain-Lain (Pendukung)",
  description: "Materi tambahan seperti tips belajar, literasi digital, dan pengembangan diri.",
  teacher_name: "Tim SiswaRoom",
  stats: { total_materials: 4, total_quizzes: 1, avg_quiz_score: 0 },
  is_enrolled: true,
  materials: [
    {
      title: "Cara Belajar Efektif",
      description: "Teknik belajar yang bikin lebih fokus dan cepat paham.",
      content: "Gunakan teknik Pomodoro, buat rangkuman singkat, dan latihan soal bertahap.",
      points: ["Pomodoro 25/5", "Active Recall", "Spaced Repetition", "Latihan soal"],
    },
    {
      title: "Manajemen Waktu",
      description: "Atur jadwal biar tugas & belajar lebih terkontrol.",
      content: "Mulai dari prioritas (penting vs mendesak) dan buat to-do harian.",
      points: ["Prioritas", "Time blocking", "Target harian", "Review mingguan"],
    },
    {
      title: "Literasi Digital",
      description: "Bedakan info valid vs hoaks, dan aman berinternet.",
      content: "Cek sumber, bandingkan berita, jangan sebar info tanpa verifikasi.",
      points: ["Cek sumber", "Cari bukti", "Jaga privasi", "Etika online"],
    },
    {
      title: "Tips Menghadapi Ujian",
      description: "Strategi persiapan, latihan, dan mental saat ujian.",
      content: "Latihan dari soal tahun lalu, tidur cukup, dan buat catatan inti.",
      points: ["Latihan soal", "Sleep", "Ringkasan", "Simulasi ujian"],
    },
  ],
  quizzes: [
    { id: "q-lain-1", title: "Kuis Pendukung 1", question_count: 10 },
  ],
},
};

// ID video untuk fallback mata pelajaran "Lain-lain"
const OTHER_VIDEO_ID = (typeof import.meta !== "undefined" && import.meta.env?.VITE_OTHER_VIDEO_ID)
  ? String(import.meta.env.VITE_OTHER_VIDEO_ID)
  : "lain101";

export async function initCourse(container, courseId) {
  try {
    const html = await (await fetch(new URL("../static/course.html", import.meta.url))).text();
    container.innerHTML = html;

    // setup UI bits
    setupCourseMenu();

    await loadCourse(container, courseId);
  } catch (err) {
    console.error("[COURSE] Failed to load page:", err);
    container.innerHTML = `<p class="center text-gray">Gagal memuat halaman kursus.</p>`;
  }
}

function setupCourseMenu() {
  const tabs = document.querySelectorAll('#course-tabs .admin-tab-btn');
  const sections = document.querySelectorAll('[data-section]');
  if (!tabs.length || !sections.length) return;

  function showSection(name) {
    sections.forEach(s => {
      if (s.getAttribute('data-section') === name) {
        s.style.display = '';
      } else {
        s.style.display = 'none';
      }
    });

    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  }

  tabs.forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.tab));
  });

  // accessibility: allow switching via arrow keys
  tabs.forEach((btn, idx) => {
    btn.tabIndex = 0;
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') tabs[(idx + 1) % tabs.length].focus();
      if (e.key === 'ArrowLeft') tabs[(idx - 1 + tabs.length) % tabs.length].focus();
      if (e.key === 'Enter' || e.key === ' ') btn.click();
    });
  });

  // initialize visible section based on the active tab (default to 'materi')
  try {
    const initialTab = tabs.find(t => t.classList.contains('active'))?.dataset.tab || 'materi';
    showSection(initialTab);
  } catch (e) {
    showSection('materi');
  }
}

async function loadCourseData(courseId) {
  if (DUMMY_DATA && MOCK_COURSE_DETAILS[courseId]) {
    return MOCK_COURSE_DETAILS[courseId];
  }

  const headers = { ...AuthService.getAuthHeaders() };

  const useOtherFallback = isOtherCourseId(courseId);

  // Kebutuhan khusus: Lain-lain hanya ambil satu video dari API videos/{id}
  if (useOtherFallback) {
    return await loadOtherVideoCourse(courseId, headers);
  }

  try {
    const [courseRes, materialsRes, quizzesRes] = await Promise.all([
      fetch(`${API_BASE}/courses/${courseId}`, { headers }),
      fetch(`${API_BASE}/materials?course_id=${courseId}`, { headers }),
      fetch(`${API_BASE}/quizzes?course_id=${courseId}`, { headers }),
    ]);

    if (!courseRes.ok) {
      throw new Error(`Failed to fetch course (${courseRes.status})`);
    }

    const courseRaw = await courseRes.json();
    const materialsRaw = materialsRes.ok ? await materialsRes.json() : [];
    const quizzesRaw = quizzesRes.ok ? await quizzesRes.json() : [];

    return normalizeCourse(courseRaw, materialsRaw, quizzesRaw);
  } catch (err) {
    // If course data tidak ada, coba fallback khusus Lain-lain ke endpoint video
    if (useOtherFallback) {
      console.warn("[COURSE] Fallback to video endpoint for Lain-lain:", courseId, err);
      return await loadOtherVideoCourse(courseId, headers);
    }
    throw err;
  }
}

function normalizeCourse(course, materials, quizzes) {
  return {
    ...course,
    course_id: course.course_id ?? course.id ?? course.slug ?? "",
    course_name: course.course_name ?? course.name ?? course.title ?? "Course",
    description: course.description ?? course.short_description ?? "",
    teacher_name: course.teacher_name || course.teacher || (course.teacher_id ? `Guru #${course.teacher_id}` : "-"),
    materials: (materials || []).map(mapMaterial),
    quizzes: (quizzes || []).map(mapQuiz),
  };
}

function mapMaterial(m) {
  return {
    title: m.title || m.name || "Materi",
    description: m.short_description || m.description || m.full_description || "",
    content: m.full_description || m.content || m.short_description || "",
    video: m.video_url || m.video || "",
    points: (m.key_points || []).map((p) => p.point_text || p.text || p.title).filter(Boolean),
  };
}

function mapQuiz(q) {
  return {
    id: q.id || q.quiz_id,
    title: q.title || q.name || "Quiz",
    question_count: q.total_questions || q.question_count || 0,
  };
}

function isOtherCourseId(id) {
  if (!id) return false;
  const lower = String(id).toLowerCase();
  return lower.includes("lain") || lower === String(OTHER_VIDEO_ID).toLowerCase();
}

async function loadOtherVideoCourse(courseId, headers = {}) {
  const videoId = OTHER_VIDEO_ID || courseId;
  const res = await fetch(`${API_BASE}/videos/${videoId}`, { headers });

  if (!res.ok) {
    throw new Error(`Failed to fetch fallback video (${res.status})`);
  }

  const payload = await res.json();
  const pointsRaw = payload.points || payload.key_points || [];
  const points = Array.isArray(pointsRaw)
    ? pointsRaw.map((p) => typeof p === "string" ? p : (p?.point_text || p?.text || p?.title)).filter(Boolean)
    : [];

  const videoUrl = payload.url || payload.video_url || payload.link || payload.videoLink || payload.video;
  const description = payload.description || payload.summary || payload.caption || "Materi tambahan berbentuk video.";

  return {
    course_id: courseId,
    course_name: payload.course_name || "Lain-Lain",
    description,
    teacher_name: payload.uploader || payload.author || payload.owner || "Pengajar Tamu",
    materials: [
      {
        title: payload.title || payload.name || "Video Lain-lain",
        description,
        content: payload.content || description,
        video: videoUrl,
        points,
      },
    ],
    quizzes: [],
  };
}

async function loadCourse(container, courseId) {
  try {
    const course = await loadCourseData(courseId);

    document.getElementById("course-title").textContent = course.course_name || "Kursus";
    document.getElementById("course-teacher").textContent = `Pengajar: ${course.teacher_name || '-'}`;
    document.getElementById("course-desc").textContent = course.description || "Tidak ada deskripsi";

    // Defensive: ensure Materi section is visible so the description appears above materials
    try {
      const materiSection = document.querySelector('[data-section="materi"]');
      if (materiSection) materiSection.style.display = '';
    } catch (err) {
      // ignore – defensive only
    }



    // Materials and quizzes lists
    const matCard = document.getElementById("course-materials");
    const quizEl = document.getElementById("course-quizzes");

    // back control (universal): from detail -> list, from list -> subjects nav
    const backWrap = document.getElementById('back-to-materials-wrap');
    const backBtn = document.getElementById('back-to-materials');
    let lastView = 'list';

    // ensure back wrapper visible on course page
    if (backWrap) backWrap.style.display = '';
    if (backBtn) {
      backBtn.onclick = () => {
        if (lastView === 'detail') {
          // go back to materials list
          renderMaterials();
          lastView = 'list';
          if (backWrap) backWrap.style.display = '';
          window.scrollTo({top:0, behavior:'smooth'});
        } else {
          // go back to courses list (nav)
          window.location.hash = '#/courses';
        }
      };
    }

    function renderMaterials() {
      // when rendering list, back should lead to subjects (so keep wrapper visible)
      lastView = 'list';
      const backWrap = document.getElementById('back-to-materials-wrap');
      if (backWrap) backWrap.style.display = '';

      matCard.innerHTML = (course.materials && course.materials.length)
        ? course.materials.map((m, i) => `
          <div class="material-card">
            <div class="material-card-info">
              <h4>${m.title}</h4>
              <p class="text-gray">${m.description || ''}</p>
            </div>
            <div class="material-card-action">
              <button class="btn btn-primary start-material-btn" data-index="${i}">Mulai Belajar</button>
            </div>
          </div>
        `).join("")
        : `<p class="center text-gray">Tidak ada materi.</p>`;

      // attach handlers
      matCard.querySelectorAll('.start-material-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = Number(btn.dataset.index);
          showMaterialDetail(idx);
        });
      });
    }

    function showMaterialDetail(index) {
      lastView = 'detail';
      const m = course.materials[index];
      const videoHtml = renderMaterialVideo(m.video);
      matCard.innerHTML = `
        <div class="material-detail">
          <h3>${m.title}</h3>
          <p class="text-gray">${m.description}</p>

              <h4 style="margin-top:1rem;">Deskripsi</h4>
          <p>${m.content || m.description}</p>

          ${videoHtml}

          <h4 style="margin-top:1rem;">Poin-poin Penting</h4>
          <ol>
            ${(m.points || []).map(p => `<li>${p}</li>`).join('')}
          </ol>
        </div>
      `;

      const backWrap = document.getElementById('back-to-materials-wrap');
      // expose the universal back button but don't overwrite its handler here so the global handler
      // (set during init) decides whether to go back to list or navigate to courses.
      if (backWrap) backWrap.style.display = '';
      // set state to 'detail' so the global click handler will go to the appropriate target
      lastView = 'detail';
      window.scrollTo({top:0, behavior:'smooth'});
    }

    renderMaterials();

    // Toggle .parent-hover on the materials container so we can reliably
    // disable child hover styles when the user hovers the parent container.
    const materiParent = document.querySelector('.card[data-section="materi"]');
    if (materiParent) {
      const add = () => materiParent.classList.add('parent-hover');
      const rem = () => materiParent.classList.remove('parent-hover');
      materiParent.addEventListener('pointerenter', add);
      materiParent.addEventListener('pointerleave', rem);
      // clean up on page unload (defensive)
      window.addEventListener('unload', () => {
        materiParent.removeEventListener('pointerenter', add);
        materiParent.removeEventListener('pointerleave', rem);
      });
    }

    quizEl.innerHTML = (course.quizzes && course.quizzes.length)
      ? course.quizzes.map(q => {
          const done = isQuizCompleted(q.id);
          return `
          <a href="#/quiz/${q.id}" class="quiz-card quiz-link ${done ? 'quiz-done' : ''}" data-quiz-id="${q.id}">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:.6rem;">
              <h4 style="margin:0;">${q.title}</h4>
              ${done ? `<span class="badge done">Sudah dikerjakan</span>` : ''}
            </div>
            <p style="margin-top:.5rem;">${q.question_count || 0} soal</p>
          </a>
        `}).join("")
      : `<p class="center text-gray">Tidak ada kuis.</p>`;

  } catch (err) {
    console.error("[COURSE] Failed to fetch course:", err);
    container.innerHTML = `<p class="center text-gray">Gagal memuat data kursus.</p>`;
  }
}

// Helpers to render video content (YouTube embed or direct video)
function isYouTubeUrl(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    return host.includes('youtube.com') || host.includes('youtu.be');
  } catch {
    return false;
  }
}

function toYouTubeEmbed(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host.includes('youtu.be')) {
      // Format: https://youtu.be/VIDEO_ID
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
    if (host.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) {
        // Already embed format
        return url;
      }
      // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
      const id = u.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
  } catch {
    // fallthrough
  }
  return '';
}

function renderMaterialVideo(url) {
  if (!url) {
    return `<div class="material-video-placeholder text-gray" style="margin-top:1rem;">Video belum tersedia</div>`;
  }
  const isYT = isYouTubeUrl(url);
  if (isYT) {
    const embedUrl = toYouTubeEmbed(url);
    if (embedUrl) {
      return `
        <h4 style="margin-top:1rem;">Video Pembelajaran</h4>
        <div class="material-video" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:.5rem;background:#000;">
          <iframe src="${embedUrl}" title="YouTube video" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <div style="margin-top:.5rem"><a class="btn" href="${url}" target="_blank" rel="noopener">Buka Video di Tab Baru</a></div>
      `;
    }
  }
  // Fallback: render as HTML5 video (e.g., direct MP4)
  return `
    <h4 style="margin-top:1rem;">Video Pembelajaran</h4>
    <video class="material-video" controls preload="metadata" src="${url}">
      Browser Anda tidak mendukung elemen video.
    </video>
    <div style="margin-top:.5rem"><a class="btn" href="${url}" target="_blank" rel="noopener">Buka Video di Tab Baru</a></div>
  `;
}
