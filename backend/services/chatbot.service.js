import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
const API_URL = process.env.AI_API_URL || 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Kirim pesan ke AI chatbot
 * @param {string} message - Pesan dari user
 * @param {Array} conversationHistory - Riwayat percakapan
 * @returns {Promise<string>} - Respons dari AI
 */
export const sendChatMessage = async (message, conversationHistory = []) => {
  try {
    if (!API_KEY) {
      throw new Error('API key untuk AI tidak tersedia. Silakan set GROQ_API_KEY atau OPENAI_API_KEY di .env');
    }

    const systemPrompt = {
      role: "system",
      content: `Anda adalah chatbot pembelajaran yang membantu siswa dalam platform SiswaRoom. 
      Anda harus:
      - Menjawab pertanyaan tentang mata pelajaran dengan jelas dan ringkas
      - Membantu siswa memahami konsep pembelajaran
      - Memberikan contoh praktis
      - Mendorong siswa untuk belajar lebih dalam
      - Menggunakan bahasa Indonesia yang baik
      - Jika tidak tahu, katakan dengan jujur dan sarankan untuk bertanya kepada guru`
    };

    const messages = [
      systemPrompt,
      ...conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.message
      })),
      {
        role: 'user',
        content: message
      }
    ];

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || 'Gagal mendapatkan respons dari AI'}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    return aiMessage;
  } catch (error) {
    console.error('Chatbot Service Error:', error.message);
    throw new Error(`Chatbot Error: ${error.message}`);
  }
};

/**
 * Simpan chat history ke database (opsional)
 * @param {number} userId - ID user
 * @param {string} message - Pesan
 * @param {string} response - Respons dari AI
 * @returns {Promise}
 */
export const saveChatHistory = async (userId, message, response) => {
  // Bisa diintegrasikan dengan database jika diperlukan
  console.log(`Chat history: User ${userId} - ${message} - ${response}`);
};

/**
 * Analisis pesan untuk mendeteksi topik pembelajaran
 * @param {string} message - Pesan user
 * @returns {string} - Topik yang terdeteksi
 */
export const detectLearningTopic = (message) => {
  const topics = {
    matematika: ['matematika', 'kalkulus', 'aljabar', 'geometri', 'persamaan'],
    fisika: ['fisika', 'mekanika', 'listrik', 'optik', 'gelombang'],
    bahasa: ['bahasa', 'grammar', 'vocabulary', 'tenses', 'syntax'],
    sejarah: ['sejarah', 'perang', 'revolusi', 'kerajaan', 'era'],
    biologi: ['biologi', 'sel', 'fotosintesis', 'evolusi', 'genetika']
  };

  const lowerMessage = message.toLowerCase();
  for (const [topic, keywords] of Object.entries(topics)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return topic;
    }
  }

  return 'general';
};
