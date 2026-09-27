// PaisaPulse AI Client Service
// Unified provider integration (Gemini, Groq, OpenAI) with PII Privacy Masking & Offline Deterministic Fallback

// Sensitive financial information masking to preserve user privacy
export function maskSensitiveFinancialData(text = '') {
  if (typeof text !== 'string') return text;
  
  return text
    // Mask 12-16 digit bank account or card numbers (e.g. 524182910283 -> XXXXXX0283)
    .replace(/\b\d{6,12}(\d{4})\b/g, 'XXXXXX$1')
    // Mask Indian phone numbers (e.g. 9876543210 -> 98XXXXXX10)
    .replace(/\b([6-9]\d{1})\d{6}(\d{2})\b/g, '$1XXXXXX$2')
    // Mask personal UPI handles with numbers (e.g. 9876543210@paytm -> user@paytm)
    .replace(/\b[a-zA-Z0-9._%+-]+@([a-zA-Z0-9]+)\b/g, (match, bank) => {
      if (/swiggy|zomato|netflix|uber|amazon|flipkart|airtel|jio/i.test(match)) {
        return match; // preserve known merchant handles
      }
      return `user_protected@${bank}`;
    });
}

// Get configured API key from environment variables (No hardcoding)
export function getAIConfig() {
  const geminiKey = 
    (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_GEMINI_API_KEY || process.env?.VITE_GEMINI_API_KEY)) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';

  const groqKey = 
    (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_GROQ_API_KEY || process.env?.VITE_GROQ_API_KEY)) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY) || 
    '';

  const openAIKey = 
    (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_OPENAI_API_KEY || process.env?.VITE_OPENAI_API_KEY)) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY) || '';

  if (groqKey) {
    return { provider: 'groq', apiKey: groqKey, model: 'qwen/qwen3.8-27b', available: true };
  }
  if (geminiKey) {
    return { provider: 'gemini', apiKey: geminiKey, model: 'gemini-1.5-flash', available: true };
  }
  if (openAIKey) {
    return { provider: 'openai', apiKey: openAIKey, model: 'gpt-4o-mini', available: true };
  }

  // Graceful deterministic mode
  return { 
    provider: 'local_deterministic', 
    apiKey: '', 
    model: 'PaisaPulse Rule Engine', 
    available: false,
    message: 'AI enrichment running in deterministic mode. Core cashflow calculations are 100% active.'
  };
}

/**
 * Executes an LLM prompt with privacy masking and deterministic fallback
 */
export async function executeAIPrompt({ systemPrompt, userPrompt, temperature = 0.3, maxTokens = 280 }) {
  const config = getAIConfig();
  
  if (!config.available) {
    return {
      success: false,
      text: null,
      provider: config.provider,
      mode: 'deterministic_fallback',
      reason: 'No API key configured. Using deterministic engine.'
    };
  }

  const safeMaxTokens = Math.min(Math.max(Number(maxTokens) || 280, 80), 320);
  const maskedUserPrompt = maskSensitiveFinancialData(userPrompt);

  try {
    if (config.provider === 'groq') {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: maskedUserPrompt }
          ],
          temperature,
          max_tokens: safeMaxTokens
        })
      });

      if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
      const data = await response.json();
      return {
        success: true,
        text: data.choices?.[0]?.message?.content || '',
        provider: 'Groq LLM'
      };
    } else if (config.provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Question:\n${maskedUserPrompt}` }]
            }
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens
          }
        })
      });

      if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return {
        success: true,
        text: reply,
        provider: 'Google Gemini'
      };
    }
  } catch (error) {
    console.warn(`[PaisaPulse AI] ${config.provider} API call failed, falling back to local engine:`, error.message);
    return {
      success: false,
      text: null,
      provider: config.provider,
      mode: 'deterministic_fallback',
      error: error.message
    };
  }

  return {
    success: false,
    text: null,
    provider: 'local_deterministic',
    mode: 'deterministic_fallback'
  };
}
