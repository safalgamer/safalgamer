import ENV from '../config/env';

/**
 * AXIS Vision - Object identification via Groq vision API
 * Uses plain fetch for React Native compatibility.
 */

export async function identifyObject(imageBase64: string): Promise<string> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENV.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Look at this image. Identify what you see in 1-2 short sentences. Be direct.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.log('Groq vision error:', data.error);
      return `Vision error: ${data.error.message || 'Model unavailable'}`;
    }

    return data.choices?.[0]?.message?.content || "Can't identify that. Try again.";
  } catch (error: any) {
    return `Vision failed: ${error.message || 'Network error'}`;
  }
}

export async function analyzeScene(imageBase64: string, question: string): Promise<string> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENV.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: question },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
        max_tokens: 200,
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Can't analyze that right now.";
  } catch (error: any) {
    return `Analysis failed: ${error.message || 'Network error'}`;
  }
}
