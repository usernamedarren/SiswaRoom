import { StatCard } from "../components/statCard.js";
import { renderBarChart } from "../charts/barChart.js";
import { SubjectProgress } from "../charts/subjectProgress.js";

export function DashboardPage() {
    const subjects = [
      { name: "Matematika", value: 85 },
      { name: "IPA", value: 88 },
      { name: "Bahasa Indonesia", value: 80 },
      { name: "IPS", value: 75 },
    ];
  setTimeout(() => {
    renderBarChart();
    renderPieChart();
  }, 50);

  return `
    <div class=container>
      <div class="page-header">
        <h1 class="dashboard-title">Dashboard Belajar</h1>
        <p class="dashboard-sub">Platform Belajar Seru untuk Seluruh Siswa di Indonesia!</p>
      </div>


      <!-- STAT -->
      <div class="stat-container">
        ${StatCard("🏆", "#f472b6", "Rata-rata Nilai", "85%")}
        ${StatCard("📘", "#38bdf8", "Kuis Dikerjakan", "24")}
        ${StatCard("🎯", "#4ade80", "Topik Dikuasai", "12")}
        ${StatCard("🔥", "#fb923c", "Hari Aktif", "7 Hari")}
      </div>

      <!-- CHARTS -->
      <div class="chart-wrapper">
        <div class="chart-card">
          <h3>Nilai Terkini</h3>
          <canvas id="barChart"></canvas>
        </div>

        <div class="chart-card">
          <h3>Performa per Mata Pelajaran</h3>
          ${SubjectProgress(subjects)}
        </div>
      </div>
      <!-- SUBJECT PROGRESS -->
      
      <!-- SCHEDULE -->
      <div class="calendar-wrapper">

        <div class="calendar-header">
          <div>Senin</div>
          <div>Selasa</div>
          <div>Rabu</div>
          <div>Kamis</div>
          <div>Jumat</div>
        </div>

        <div class="calendar-grid">

          <!-- SENIN -->
          <div class="calendar-cell">

            <div class="calendar-lesson">
              Matematika
            </div>

            <div class="calendar-lesson">
              Bahasa Indonesia
            </div>
          </div>

          <!-- SELASA -->
          <div class="calendar-cell">

            <div class="calendar-lesson">
              IPA
            </div>

            <div class="calendar-lesson">
              Bahasa Inggris
            </div>
          </div>

          <!-- RABU -->
          <div class="calendar-cell selected">

            <div class="calendar-lesson">
              Matematika
            </div>

            <div class="calendar-lesson">
              IPA
            </div>
          </div>

          <!-- KAMIS -->
          <div class="calendar-cell">

            <div class="calendar-lesson">
              Bahasa Indonesia
            </div>

            <div class="calendar-lesson">
              Bahasa Inggris
            </div>
          </div>

          <!-- JUMAT -->
          <div class="calendar-cell">

            <div class="calendar-lesson">
              Matematika
            </div>

            <div class="calendar-lesson">
              Bahasa Inggris
            </div>
          </div>

        </div> 
      </div>
    </div>
  `;
  
}

