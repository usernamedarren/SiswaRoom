import { SubjectCard } from "../components/subjectCard.js";
import "../styles/subject.css";

export function SubjectsPage() {
  return `
    <div class="subject-page">
      <h3>Materi Pembelajaran</h3>
      <p>Pilih mata pelajaran dan topik yang ingin dipelajari</p>

      <div class="subject-container">
        
        ${SubjectCard(
          "linear-gradient(135deg, #38bdf8, #2563eb)",
          "Matematika",
          4,
          ["Bilangan Bulat dan Pecahan", "Aljabar Dasar", "Geometri dan Bangun Ruang"],
          "Matematika" 
        )}

        ${SubjectCard(
          "linear-gradient(135deg, #4ade80, #16a34a)",
          "IPA",
          5,
          ["Sistem Organisasi Kehidupan", "Gerak dan Gaya", "Energi dan Perubahannya"],
          "IPA"           // 🔥 slug
        )}

      </div>

      <div class="subject-container">

        ${SubjectCard(
          "linear-gradient(135deg, #f97316, #ea580c)",
          "Bahasa Indonesia",
          3,
          ["Teks Deskripsi", "Teks Narasi", "Cerita Pendek"],
          "Bahasa indonesia"     // 🔥 slug
        )}

        ${SubjectCard(
          "linear-gradient(135deg, #a855f7, #7e22ce)",
          "Bahasa Inggris",
          3,
          ["Simple Present Tense", "Greeting", "Daily Activities"],
          "Bahasa Inggris"       // 🔥 slug
        )}

      </div>

    </div>
  `;
}
