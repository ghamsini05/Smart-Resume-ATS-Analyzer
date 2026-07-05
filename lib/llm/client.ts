export const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

interface GroqChatArgs {
  messages: { role: string; content: string }[];
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export async function groqChat({
  messages,
  json,
  maxTokens,
  temperature
}: GroqChatArgs): Promise<string | null> {
  const key = process.env.GROQ_API_KEY;
  
  // If no key is set or it remains the default placeholder, fallback to null
  if (!key || key === 'your_key' || key.trim() === '') {
    console.warn('Groq API Key is missing or default. Falling back to deterministic mode.');
    return null;
  }

  try {
    const body = {
      model: MODEL,
      messages,
      temperature: temperature ?? 0.3,
      max_tokens: maxTokens ?? 1024,
      ...(json ? { response_format: { type: 'json_object' } } : {})
    };

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify(body)
    });

    if (res.status !== 200) {
      console.error(`Groq API error status: ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('Groq API fetch failed:', err);
    return null;
  }
}
