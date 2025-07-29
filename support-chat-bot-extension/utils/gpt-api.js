class GPTApiUtil {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.openai.com/v1';
    this.defaultModel = 'gpt-4';
  }

  async generateResponse(message, context = {}) {
    const { platform = 'Support', conversationHistory = [], customerIssue = '' } = context;
    
    const systemPrompt = this.buildSystemPrompt(platform, customerIssue);
    const messages = this.buildMessageHistory(systemPrompt, conversationHistory, message);
    
    try {
      const response = await this.callOpenAI(messages);
      return this.extractResponseText(response);
    } catch (error) {
      throw new Error(`GPT API Error: ${error.message}`);
    }
  }

  buildSystemPrompt(platform, customerIssue) {
    const basePrompt = `You are a helpful customer support assistant for ${platform}. Your goal is to resolve customer issues efficiently and professionally.

IMPORTANT GUIDELINES:
- Be polite, empathetic, and solution-focused
- Keep responses concise (under 100 words)
- Ask for specific details when needed (order ID, phone number, address)
- Offer practical solutions and alternatives
- Escalate to human agent when necessary
- Use natural, conversational language
- Avoid robotic or templated responses`;

    if (customerIssue) {
      return `${basePrompt}\n\nCUSTOMER'S MAIN ISSUE: ${customerIssue}`;
    }
    
    return basePrompt;
  }

  buildMessageHistory(systemPrompt, conversationHistory, currentMessage) {
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });
    
    messages.push({
      role: 'user',
      content: currentMessage
    });
    
    return messages;
  }

  async callOpenAI(messages) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.defaultModel,
        messages: messages,
        max_tokens: 150,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  extractResponseText(apiResponse) {
    if (!apiResponse.choices || apiResponse.choices.length === 0) {
      throw new Error('No response generated');
    }
    
    const responseText = apiResponse.choices[0].message?.content;
    if (!responseText) {
      throw new Error('Empty response content');
    }
    
    return responseText.trim();
  }

  static validateApiKey(apiKey) {
    if (!apiKey) {
      return { valid: false, error: 'API key is required' };
    }
    
    if (!apiKey.startsWith('sk-')) {
      return { valid: false, error: 'API key must start with "sk-"' };
    }
    
    if (apiKey.length < 20) {
      return { valid: false, error: 'API key appears to be too short' };
    }
    
    return { valid: true };
  }

  static async testApiKey(apiKey) {
    const testUtil = new GPTApiUtil(apiKey);
    
    try {
      await testUtil.generateResponse('Hello', {
        platform: 'Test',
        conversationHistory: []
      });
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error.message.includes('401') ? 'Invalid API key' : error.message 
      };
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GPTApiUtil;
}