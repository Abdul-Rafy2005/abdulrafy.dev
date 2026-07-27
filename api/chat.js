const { GoogleGenerativeAI } = require('@google/generative-ai');
const CONTEXT = require('./context');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body || {};

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return res.status(500).json({ error: 'Chat service is not configured. Please try again later.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are a helpful AI assistant on Abdul Rafy's personal portfolio website.
Answer questions about Abdul Rafy, his skills, projects, and experience based on the following context.
Keep answers concise, friendly, and professional. If you don't know something based on the context,
say so honestly. Do not make up information.

--- CONTEXT ---
${CONTEXT}
--- END CONTEXT ---`;

    const result = await model.generateContent([
      systemPrompt,
      message.trim(),
    ]);

    const reply = result.response.text();

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Gemini API error:', error.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};
