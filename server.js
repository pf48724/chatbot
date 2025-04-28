require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

if (!process.env.OPENROUTER_API_KEY) {
  console.error('OPENROUTER_API_KEY is not set in .env file');
  process.exit(1);
}

if (!process.env.OPENROUTER_API_URL) {
  console.error('OPENROUTER_API_URL is not set in .env file');
  process.exit(1);
}

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request. Messages array is required.' });
    }

    const response = await fetch(process.env.OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000', 
        'X-Title': 'Clingy Chatbot' 
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo', 
        messages: messages,
        max_tokens: 500,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return res.status(response.status).json({
        error: 'Error from OpenRouter API',
        details: errorData
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/clingy-chatbot.html');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
