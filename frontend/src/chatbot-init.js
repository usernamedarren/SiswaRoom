/**
 * Main Entry Point - Chatbot Integration Example
 * Letakkan kode ini di file HTML utama atau router main
 */

import { initChatbot, clearChatHistory, getTopicHelp, explainConcept } from './pages/logic/chatbotLogic.js';

/**
 * Initialize Chatbot saat DOM siap
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Chatbot] Initializing...');
  
  try {
    // Load chatbot widget template
    const chatbotHTML = `
<!-- AI Chatbot Widget -->
<div id="chatbot-widget" class="chatbot-widget">
  <div class="chatbot-header">
    <h3>
      <svg class="chatbot-icon" viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      AI Tutor Chatbot
    </h3>
    <button id="toggle-chatbot" class="close-btn" title="Close">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>
  </div>

  <div id="chat-messages" class="chat-messages">
    <div class="chat-message chat-message-bot">
      <div class="message-content">
        <strong>Halo! 👋</strong><br>
        Saya adalah AI Tutor. Saya siap membantu Anda memahami materi pelajaran, menjawab pertanyaan, dan memberikan penjelasan konsep pembelajaran.<br><br>
        <em>Silakan ketik pertanyaan Anda atau pilih topik yang ingin dipelajari.</em>
      </div>
      <div class="message-timestamp">Sekarang</div>
    </div>
  </div>

  <div class="chatbot-quick-actions">
    <button class="quick-action" onclick="window.explainConcept('Fotosintesis', 'beginner')">
      📚 Fotosintesis
    </button>
    <button class="quick-action" onclick="window.explainConcept('Persamaan Kuadrat', 'intermediate')">
      🔢 Persamaan Kuadrat
    </button>
    <button class="quick-action" onclick="window.explainConcept('Revolusi Perancis', 'intermediate')">
      📖 Sejarah
    </button>
  </div>

  <form id="chatbot-form" class="chatbot-input">
    <input 
      id="chat-input" 
      type="text" 
      placeholder="Tanya sesuatu..." 
      autocomplete="off"
      aria-label="Pesan untuk chatbot"
    />
    <button id="send-btn" type="submit" class="send-btn" aria-label="Kirim pesan">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16151495 C3.34915502,0.9 2.40734225,0.9 1.77946707,1.4429026 C0.994623095,2.0605983 0.837654326,3.0605983 1.15159189,3.98499899 L3.03521743,10.4259921 C3.03521743,10.5741566 3.19218622,10.5741566 3.50612381,10.5741566 L16.6915026,11.3596434 C16.6915026,11.3596434 17.1624089,11.3596434 17.1624089,11.9179141 L17.1624089,12.0660786 C17.1624089,12.6315722 16.6915026,12.4744748 16.6915026,12.4744748 Z"/>
      </svg>
    </button>
  </form>

  <div class="chatbot-footer">
    <button class="btn-icon" onclick="window.clearChatHistory()" title="Hapus riwayat">
      🗑️ Hapus
    </button>
  </div>
</div>

<!-- Chatbot Toggle Button -->
<button id="chatbot-toggle-btn" class="chatbot-toggle-btn" title="Buka Chatbot">
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
  </svg>
</button>
    `;

    // Inject chatbot HTML
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    // Expose functions to global window
    window.clearChatHistory = clearChatHistory;
    window.getTopicHelp = getTopicHelp;
    window.explainConcept = explainConcept;

    // Initialize chatbot functionality
    initChatbot();

    // Add toggle button handler for floating button
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const widget = document.getElementById('chatbot-widget');
        widget?.classList.toggle('open');
      });
    }

    // Add navbar button handler
    const navbarBtn = document.getElementById('navbar-ai-tutor');
    if (navbarBtn) {
      navbarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const widget = document.getElementById('chatbot-widget');
        widget?.classList.toggle('open');
      });
    }

    // Close widget when X button is clicked
    const closeBtn = document.getElementById('toggle-chatbot');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const widget = document.getElementById('chatbot-widget');
        widget?.classList.remove('open');
      });
    }
  } catch (error) {
    console.error('[Chatbot] Initialization error:', error);
  }
});

    console.log('[Chatbot] Successfully initialized!');
  } catch (error) {
    console.error('[Chatbot] Initialization error:', error);
  }
});

/**
 * Setup API URL if not already set
 */
if (!window.API_URL) {
  window.API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
}

console.log('[Chatbot] API URL:', window.API_URL);

// Export untuk usage di module lain jika diperlukan
export { initChatbot, clearChatHistory, getTopicHelp, explainConcept };
