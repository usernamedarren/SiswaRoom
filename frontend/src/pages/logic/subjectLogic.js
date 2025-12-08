import { API_BASE } from "../../config/api.js";
import { AuthService } from "../../utils/auth.js";

export async function initSubject(container, subjectId) {
  try {
    const response = await fetch(new URL('../static/subject.html', import.meta.url).href);
    if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
    const html = await response.text();
    container.innerHTML = html;
    
    loadSubject(subjectId);
  } catch (err) {
    console.error('[SUBJECT] Failed to load HTML:', err);
    container.innerHTML = '<p>Error loading subject. Please refresh.</p>';
  }
}

async function loadSubject(subjectId) {
  try {
    // Load subject info
    const subRes = await fetch(`${API_BASE}/subjects/${subjectId}`, {
      headers: AuthService.getAuthHeaders()
    });
    const subject = await subRes.json();

    const titleEl = document.getElementById('subject-title');
    const descEl = document.getElementById('subject-description');

    if (titleEl) titleEl.textContent = subject.subject_name || subject.name || 'Mata Pelajaran';
    if (descEl) descEl.textContent = subject.description || 'Deskripsi mata pelajaran tidak tersedia';

    // Load topics for this subject
    const topicsRes = await fetch(`${API_BASE}/topics?subject_id=${subjectId}`, {
      headers: AuthService.getAuthHeaders()
    });
    const topics = await topicsRes.json();

    const container = document.getElementById('topics-container');
    const noTopics = document.getElementById('no-topics');

    if (!topics || topics.length === 0) {
      if (container) container.innerHTML = '';
      if (noTopics) noTopics.style.display = 'block';
      return;
    }

    if (noTopics) noTopics.style.display = 'none';

    if (container) {
      container.innerHTML = topics.map(topic => `
        <div data-subject-id="${subjectId}" data-topic-id="${topic.topic_id}" class="topic-card" style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); cursor: pointer; transition: all 0.3s;">
          <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 600; margin: 0 0 0.5rem 0;">
            ${topic.title}
          </h3>
          <p style="color: #64748b; font-size: 0.95rem; margin: 0;">
            ${topic.description || 'Deskripsi topik tidak tersedia'}
          </p>
        </div>
      `).join('');

      // Add event listeners to topic cards
      container.querySelectorAll('.topic-card').forEach(card => {
        card.addEventListener('click', () => {
          const subId = card.dataset.subjectId;
          const topicId = card.dataset.topicId;
          window.location.hash = `#/materi/${subId}/${topicId}`;
        });
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-4px)';
          card.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        });
      });
    }
  } catch (err) {
    console.error('Error loading subject:', err);
  }
}
