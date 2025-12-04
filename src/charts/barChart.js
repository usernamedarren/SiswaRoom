import Chart from "chart.js/auto";

export function renderBarChart() {
  const ctx = document.getElementById("barChart");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Bilangan Bulat", "Aljabar", "Geometri", "Sel & Jaringan", "Gerak & Gaya"],
      datasets: [{
        label: "Nilai",
        borderRadius: 8,
        data: [90, 85, 80, 95, 75],
        backgroundColor: "#7c3aed"
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      responsive: true,
    }
  });
}


