import { sendChatMessage, detectLearningTopic, saveChatHistory } from '../services/chatbot.service.js';

/**
 * POST /api/chatbot/message
 * Mengirim pesan ke chatbot dan menerima respons
 */
export const sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user?.id;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Pesan tidak boleh kosong'
      });
    }

    // Deteksi topik pembelajaran
    const topic = detectLearningTopic(message);

    // Kirim ke AI
    const aiResponse = await sendChatMessage(message, conversationHistory);

    // Simpan history (opsional)
    if (userId) {
      await saveChatHistory(userId, message, aiResponse);
    }

    res.status(200).json({
      success: true,
      message: 'Respons berhasil dikirim',
      data: {
        response: aiResponse,
        topic: topic,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Chatbot Controller Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal memproses pesan chatbot'
    });
  }
};

/**
 * POST /api/chatbot/topic-help
 * Meminta bantuan untuk topik spesifik
 */
export const getTopicHelp = async (req, res) => {
  try {
    const { topic, subtopic } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topik harus disediakan'
      });
    }

    const prompt = subtopic 
      ? `Jelaskan tentang ${subtopic} dalam mata pelajaran ${topic} secara singkat dan mudah dipahami`
      : `Apa saja yang perlu dipelajari tentang ${topic}? Berikan penjelasan singkat.`;

    const response = await sendChatMessage(prompt);

    res.status(200).json({
      success: true,
      message: 'Bantuan topik berhasil didapatkan',
      data: {
        topic: topic,
        subtopic: subtopic,
        explanation: response
      }
    });
  } catch (error) {
    console.error('Topic Help Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mendapatkan bantuan topik'
    });
  }
};

/**
 * POST /api/chatbot/explain
 * Menjelaskan konsep pembelajaran
 */
export const explainConcept = async (req, res) => {
  try {
    const { concept, level = 'intermediate' } = req.body;

    if (!concept) {
      return res.status(400).json({
        success: false,
        message: 'Konsep harus disediakan'
      });
    }

    const levelDescription = {
      beginner: 'tingkat pemula (sangat sederhana)',
      intermediate: 'tingkat menengah',
      advanced: 'tingkat lanjut'
    };

    const prompt = `Jelaskan konsep "${concept}" pada ${levelDescription[level] || 'tingkat menengah'}. Gunakan contoh yang relatable dan mudah dipahami.`;

    const explanation = await sendChatMessage(prompt);

    res.status(200).json({
      success: true,
      message: 'Penjelasan konsep berhasil diperoleh',
      data: {
        concept: concept,
        level: level,
        explanation: explanation
      }
    });
  } catch (error) {
    console.error('Explain Concept Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal menjelaskan konsep'
    });
  }
};

/**
 * GET /api/chatbot/health
 * Check chatbot service status
 */
export const checkHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Chatbot service aktif dan siap digunakan',
    status: 'online'
  });
};
