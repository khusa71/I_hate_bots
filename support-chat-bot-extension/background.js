class SupportChatBot {
  constructor() {
    this.conversations = new Map();
    this.isActive = false;
    this.apiKey = null;
    this.initialize();
  }

  async initialize() {
    const result = await chrome.storage.sync.get(['apiKey', 'isActive']);
    this.apiKey = result.apiKey || null;
    this.isActive = result.isActive || false;
    
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true;
    });
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      const { type, data } = message;
      
      switch (type) {
        case 'GET_STATUS':
          sendResponse({ isActive: this.isActive, hasApiKey: !!this.apiKey });
          break;
          
        case 'SET_API_KEY':
          this.apiKey = data.apiKey;
          await chrome.storage.sync.set({ apiKey: data.apiKey });
          sendResponse({ success: true });
          break;
          
        case 'TOGGLE_BOT':
          this.isActive = data.active;
          await chrome.storage.sync.set({ isActive: this.isActive });
          sendResponse({ success: true });
          break;
          
        case 'PROCESS_MESSAGE':
          if (!this.isActive || !this.apiKey) {
            sendResponse({ error: 'Bot not active or API key missing' });
            return;
          }
          
          try {
            const response = await this.getGPTResponse(data.message, data.context, data.platform);
            sendResponse({ response });
          } catch (error) {
            console.error('GPT API Error:', error);
            sendResponse({ error: error.message });
          }
          break;
          
        case 'UPDATE_CONTEXT':
          const tabId = sender.tab?.id || data.context?.tabId || 'default';
          this.conversations.set(tabId, data.context);
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ error: 'Internal error occurred' });
    }
  }

  async getGPTResponse(message, context, platform) {
    const tabId = context?.tabId || 'default';
    const conversationHistory = this.conversations.get(tabId) || [];
    
    const systemPrompt = `You are a customer support assistant helping resolve issues on ${platform}. 
    Be polite, concise, and focused on resolving the customer's issue. 
    Provide specific solutions and ask relevant follow-up questions when needed.
    Keep responses under 100 words and maintain a helpful tone.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }
    
    const gptResponse = data.choices[0].message.content;

    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: gptResponse }
    );
    
    if (conversationHistory.length > 20) {
      conversationHistory.splice(0, 2);
    }
    
    this.conversations.set(tabId, conversationHistory);
    
    return gptResponse;
  }
}

const bot = new SupportChatBot();