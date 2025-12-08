import { API_BASE } from "../config/api.js";
import { AuthService } from "../utils/auth.js";

export function SchedulesPage() {
  setTimeout(() => loadSchedules(), 100);
  return `
    <div style="max-width: 1400px; margin: 0 auto; padding: 2rem;">
      <!-- Page Header -->
      <div style="margin-bottom: 3rem;">
        <h1 style="color: #7c3aed; font-size: 2.5rem; font-weight: 700; margin: 0; margin-bottom: 0.5rem;">
          📅 Jadwal Kelas
        </h1>
        <p style="color: #64748b; font-size: 1.1rem; margin: 0;">
          Lihat semua jadwal kelas yang Anda ikuti
        </p>
      </div>

      <!-- Filter Section -->
      <div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
        <input type="text" id="search-schedule" placeholder="Cari jadwal..." style="flex: 1; min-width: 250px; padding: 0.875rem 1rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; outline: none;" onkeyup="filterSchedules()" />
        <select id="filter-type" style="padding: 0.875rem 1rem; border: 2px solid #e2e8f0; border-radius: 10px; background: white; font-size: 1rem; cursor: pointer;" onchange="filterSchedules()">
          <option value="">Semua Jadwal</option>
          <option value="upcoming">Jadwal Mendatang</option>
          <option value="past">Jadwal Lampau</option>
        </select>
      </div>

      <!-- Schedules List -->
      <div id="schedules-container">
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
          <p style="color: #64748b;">Memuat jadwal...</p>
        </div>
      </div>

      <!-- No Results -->
      <div id="no-schedules" style="display: none; text-align: center; padding: 3rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
        <p style="color: #64748b; font-size: 1.1rem;">
          Tidak ada jadwal untuk ditampilkan
        </p>
      </div>
    </div>
  `;
}

async function loadSchedules() {
  try {
    const res = await fetch(`${API_BASE}/schedules`, {
      headers: AuthService.getAuthHeaders()
    });
    const schedules = await res.json();

    const container = document.getElementById("schedules-container");
    if (!container) return;

    if (!schedules || schedules.length === 0) {
      container.innerHTML = '';
      document.getElementById("no-schedules").style.display = 'block';
      return;
    }

    // Group schedules by date
    const grouped = {};
    schedules.forEach(s => {
      const date = new Date(s.class_date).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(s);
    });

    let html = '';
    for (const [date, items] of Object.entries(grouped)) {
      html += `
        <div style="margin-bottom: 2rem;">
          <h3 style="color: #1e293b; font-size: 1.3rem; font-weight: 600; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e2e8f0;">
            ${date}
          </h3>
          <div style="display: grid; gap: 1rem;">
            ${items.map(schedule => `
              <div style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #7c3aed; transition: all 0.3s;">
                <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 2rem; align-items: start;">
                  <!-- Schedule Info -->
                  <div>
                    <h4 style="color: #1e293b; font-size: 1.1rem; font-weight: 600; margin: 0 0 0.5rem 0;">
                      ${schedule.class_name || 'Kelas'}
                    </h4>
                    <p style="color: #64748b; margin: 0.3rem 0; font-size: 0.95rem;">
                      👨‍🏫 Guru: ${schedule.teacher_name || 'N/A'}
                    </p>
                    <p style="color: #64748b; margin: 0.3rem 0; font-size: 0.95rem;">
                      ⏰ ${schedule.start_time} - ${schedule.end_time}
                    </p>
                  </div>

                  <!-- Meeting Info -->
                  <div>
                    ${schedule.is_online ? `
                      <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; border-left: 3px solid #0ea5e9;">
                        <p style="color: #0ea5e9; font-weight: 600; margin: 0 0 0.5rem 0;">🌐 Kelas Online</p>
                        <a href="${schedule.meeting_url}" target="_blank" style="color: #0ea5e9; text-decoration: none; font-weight: 500; word-break: break-all;">
                          ${schedule.meeting_url}
                        </a>
                      </div>
                    ` : `
                      <div style="background: #f5f3ff; padding: 1rem; border-radius: 8px; border-left: 3px solid #7c3aed;">
                        <p style="color: #7c3aed; font-weight: 600; margin: 0 0 0.5rem 0;">📍 Kelas Offline</p>
                        <p style="color: #7c3aed; margin: 0;">${schedule.meeting_room}</p>
                      </div>
                    `}
                  </div>

                  <!-- Actions -->
                  <div style="text-align: right;">
                    ${new Date(schedule.class_date + ' ' + schedule.start_time) > new Date() ? `
                      <button onclick="joinClass('${schedule.schedule_id}', '${schedule.meeting_url}')" style="background: #7c3aed; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s; font-size: 0.95rem;">
                        Masuki Kelas
                      </button>
                    ` : `
                      <div style="color: #64748b; font-size: 0.9rem; padding: 0.75rem 1.5rem;">
                        Selesai
                      </div>
                    `}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  } catch (err) {
    console.error('Error loading schedules:', err);
    document.getElementById("schedules-container").innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #ef4444;">
        <p>⚠️ Gagal memuat jadwal</p>
      </div>
    `;
  }
}

window.filterSchedules = function() {
  // Implement filter logic
  loadSchedules();
};

window.joinClass = function(scheduleId, meetingUrl) {
  if (meetingUrl && meetingUrl.trim()) {
    window.open(meetingUrl, '_blank');
  } else {
    alert('URL kelas tidak tersedia');
  }
};

window.joinClass = function(scheduleId, meetingUrl) {
  if (meetingUrl) {
    window.open(meetingUrl, '_blank');
  } else {
    alert('URL ruang rapat tidak tersedia');
  }
};
