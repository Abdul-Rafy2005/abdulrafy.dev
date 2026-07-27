const CONTEXT = require('./context');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body || {};

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('GROQ_API_KEY is not set');
    return res.status(500).json({ error: 'Chat service is not configured. Please try again later.' });
  }

  const systemPrompt = `You are a helpful AI assistant on Abdul Rafy's personal portfolio website.
Answer questions about Abdul Rafy, his skills, projects, and experience based on the following context.
Keep answers concise, friendly, and professional. If you don't know something based on the context,
say so honestly. Do not make up information.

--- CONTEXT ---
${CONTEXT}
--- END CONTEXT ---`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message.trim() },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Groq API error:', response.status, errorBody);
      return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: 'No response received.' });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Groq API error:', error.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};
