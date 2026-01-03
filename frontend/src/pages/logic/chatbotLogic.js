/**
 * Chatbot Component Logic
 * Menangani interaksi dengan AI chatbot
 */

let chatHistory = [];
let isLoading = false;

/**
 * Inisialisasi chatbot
 */
export function initChatbot() {
  setupChatbotEventListeners();
  loadChatHistory();
  setupQuickActionToggle();
}

/**
 * Setup event listeners untuk chatbot (hanya untuk form dan send button)
 */
function setupChatbotEventListeners() {
  const chatForm = document.getElementById('chatbot-form');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendMessage(chatInput.value);
      chatInput.value = '';
    }, false);
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sendMessage(chatInput.value);
      chatInput.value = '';
    }, false);
  }
}

/**
 * Kirim pesan ke chatbot
 * @param {string} message - Pesan user
 */
async function sendMessage(message) {
  if (!message.trim() || isLoading) return;

  const chatMessages = document.getElementById('chat-messages');
  isLoading = true;

  // Tambahkan pesan user ke UI
  addMessageToChat('user', message);
  chatHistory.push({ sender: 'user', message });

  // Disable input
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  if (chatInput) chatInput.disabled = true;
  if (sendBtn) sendBtn.disabled = true;

  try {
    const response = await fetch(`${getApiUrl()}/chatbot/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        message: message,
        conversationHistory: chatHistory
      })
    });

    const data = await response.json();

    if (data.success) {
      const botMessage = data.data.response;
      addMessageToChat('bot', botMessage);
      chatHistory.push({ sender: 'bot', message: botMessage });
      saveChatHistory();
    } else {
      addMessageToChat('error', data.message || 'Terjadi kesalahan');
    }
  } catch (error) {
    console.error('Chat error:', error);
    addMessageToChat('error', 'Gagal menghubungi chatbot. Silakan coba lagi.');
  } finally {
    isLoading = false;
    if (chatInput) chatInput.disabled = false;
    if (sendBtn) sendBtn.disabled = false;
    if (chatInput) chatInput.focus();
  }
}

/**
 * Tambahkan pesan ke UI
 * @param {string} sender - 'user' atau 'bot'
 * @param {string} message - Teks pesan
 */
function addMessageToChat(sender, message) {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message chat-message-${sender}`;
  
  if (sender === 'error') {
    messageDiv.className = 'chat-message chat-message-error';
  }

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.innerHTML = formatMessage(message);

  const timestampDiv = document.createElement('div');
  timestampDiv.className = 'message-timestamp';
  timestampDiv.textContent = new Date().toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  messageDiv.appendChild(contentDiv);
  messageDiv.appendChild(timestampDiv);
  chatMessages.appendChild(messageDiv);

  // Scroll ke bawah
  setTimeout(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 100);
}

/**
 * Format pesan dengan markdown dasar
 * @param {string} message - Pesan
 * @returns {string} - HTML formatted message
 */
function formatMessage(message) {
  return message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

/**
 * Toggle chatbot visibility (tidak digunakan di sini, dipindah ke chatbot-init.js)
 * Tetap ada untuk backward compatibility
 */
function toggleChatbot() {
  const chatbot = document.getElementById('chatbot-widget');
  if (chatbot) {
    chatbot.classList.toggle('open');
  }
}

/**
 * Simpan chat history ke localStorage
 */
function saveChatHistory() {
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

/**
 * Load chat history dari localStorage
 */
function loadChatHistory() {
  const saved = localStorage.getItem('chatHistory');
  if (saved) {
    chatHistory = JSON.parse(saved);
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
      chatHistory.forEach(msg => {
        addMessageToChat(msg.sender, msg.message);
      });
    }
  }
}

/**
 * Clear chat history
 */
export function clearChatHistory() {
  chatHistory = [];
  localStorage.removeItem('chatHistory');
  const chatMessages = document.getElementById('chat-messages');
  if (chatMessages) {
    chatMessages.innerHTML = '';
  }
}

/**
 * Setup toggle untuk quick actions
 */
function setupQuickActionToggle() {
  const toggleBtn = document.getElementById('toggle-suggestions');
  const quickActionsHeader = document.getElementById('quick-actions-toggle');
  const quickActions = document.getElementById('chatbot-quick-actions');
  
  // Load saved state
  const isCollapsed = localStorage.getItem('quickActionsCollapsed') === 'true';
  if (isCollapsed && quickActions && toggleBtn) {
    quickActions.classList.add('collapsed');
    toggleBtn.classList.add('collapsed');
  }

  if (quickActionsHeader) {
    quickActionsHeader.addEventListener('click', () => {
      if (quickActions && toggleBtn) {
        const willBeCollapsed = !quickActions.classList.contains('collapsed');
        quickActions.classList.toggle('collapsed');
        toggleBtn.classList.toggle('collapsed');
        // Save state
        localStorage.setItem('quickActionsCollapsed', willBeCollapsed.toString());
      }
    });
  }
}

/**
 * Minta penjelasan untuk topik spesifik
 * @param {string} topic - Topik pembelajaran
 */
export async function getTopicHelp(topic) {
  isLoading = true;

  try {
    const response = await fetch(`${getApiUrl()}/chatbot/topic-help`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ topic })
    });

    const data = await response.json();

    if (data.success) {
      const explanation = data.data.explanation;
      addMessageToChat('bot', `**Penjelasan ${topic}:**\n\n${explanation}`);
      chatHistory.push({ sender: 'bot', message: explanation });
      saveChatHistory();
    } else {
      addMessageToChat('error', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    addMessageToChat('error', 'Gagal mendapatkan penjelasan');
  } finally {
    isLoading = false;
  }
}

/**
 * Minta penjelasan konsep
 * @param {string} concept - Konsep yang ingin dijelaskan
 * @param {string} level - Tingkat kesulitan (beginner, intermediate, advanced)
 */
export async function explainConcept(concept, level = 'intermediate') {
  isLoading = true;

  try {
    const response = await fetch(`${getApiUrl()}/chatbot/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ concept, level })
    });

    const data = await response.json();

    if (data.success) {
      const explanation = data.data.explanation;
      addMessageToChat('bot', `**Penjelasan ${concept} (${level}):**\n\n${explanation}`);
      chatHistory.push({ sender: 'bot', message: explanation });
      saveChatHistory();
    } else {
      addMessageToChat('error', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    addMessageToChat('error', 'Gagal menjelaskan konsep');
  } finally {
    isLoading = false;
  }
}

/**
 * Dapatkan API URL
 */
function getApiUrl() {
  return window.API_URL || 'http://localhost:4000/api';
}

/**
 * Dapatkan auth token
 */
function getAuthToken() {
  return localStorage.getItem('token') || '';
}
