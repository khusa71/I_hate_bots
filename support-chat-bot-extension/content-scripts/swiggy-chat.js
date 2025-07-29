class SwiggyChatBot {
  constructor() {
    this.isActive = false;
    this.chatContainer = null;
    this.messageInput = null;
    this.sendButton = null;
    this.observer = null;
    this.lastMessageCount = 0;
    this.processingMessage = false;
    
    this.initialize();
  }

  async initialize() {
    try {
      await this.waitForChatInterface();
      this.setupMessageListener();
      
      const status = await this.sendMessage({ type: 'GET_STATUS' });
      this.isActive = status?.isActive && status?.hasApiKey;
      
      if (this.isActive) {
        this.startMonitoring();
      }
    } catch (error) {
      console.error('Swiggy chat bot initialization failed:', error);
    }
  }

  async waitForChatInterface() {
    const maxAttempts = 30;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const selectors = [
        '[data-testid="chat-input"]',
        'input[placeholder*="Type a message"]',
        'textarea[placeholder*="message"]',
        '.chat-input',
        '#chat-input'
      ];
      
      for (const selector of selectors) {
        this.messageInput = document.querySelector(selector);
        if (this.messageInput) {
          this.findChatElements();
          return;
        }
      }
      
      await this.sleep(1000);
      attempts++;
    }
    
    console.log('Swiggy chat interface not found');
  }

  findChatElements() {
    const containerSelectors = [
      '.chat-container',
      '.messages-container',
      '[data-testid="chat-messages"]',
      '.conversation-container'
    ];
    
    for (const selector of containerSelectors) {
      this.chatContainer = document.querySelector(selector);
      if (this.chatContainer) break;
    }
    
    if (!this.chatContainer) {
      this.chatContainer = this.messageInput.closest('.chat-wrapper') || 
                          this.messageInput.parentElement.parentElement;
    }
    
    const buttonSelectors = [
      'button[data-testid="send-button"]',
      'button[type="submit"]',
      '.send-button',
      'button:has(svg[data-icon="send"])'
    ];
    
    for (const selector of buttonSelectors) {
      this.sendButton = document.querySelector(selector);
      if (this.sendButton) break;
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'TOGGLE_BOT') {
        this.isActive = message.data.active;
        if (this.isActive) {
          this.startMonitoring();
        } else {
          this.stopMonitoring();
        }
        sendResponse({ success: true });
      }
    });
  }

  startMonitoring() {
    if (!this.chatContainer) return;
    
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          this.checkForNewMessages();
        }
      });
    });
    
    this.observer.observe(this.chatContainer, {
      childList: true,
      subtree: true
    });
    
    this.checkForNewMessages();
  }

  stopMonitoring() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  async checkForNewMessages() {
    if (this.processingMessage || !this.isActive) return;
    
    const messages = this.getMessages();
    const newMessageCount = messages.length;
    
    if (newMessageCount > this.lastMessageCount) {
      const latestMessage = messages[messages.length - 1];
      
      if (this.isFromSupport(latestMessage)) {
        this.processingMessage = true;
        await this.handleSupportMessage(latestMessage);
        this.processingMessage = false;
      }
    }
    
    this.lastMessageCount = newMessageCount;
  }

  getMessages() {
    const messageSelectors = [
      '.message',
      '.chat-message',
      '[data-testid="message"]',
      '.conversation-message'
    ];
    
    let messages = [];
    for (const selector of messageSelectors) {
      messages = Array.from(document.querySelectorAll(selector));
      if (messages.length > 0) break;
    }
    
    return messages.map(msg => ({
      element: msg,
      text: msg.textContent.trim(),
      isFromSupport: this.isFromSupport(msg)
    }));
  }

  isFromSupport(messageElement) {
    if (typeof messageElement === 'object' && messageElement.element) {
      messageElement = messageElement.element;
    }
    
    const supportIndicators = [
      '.support-message',
      '.agent-message',
      '[data-sender="support"]',
      '.incoming-message'
    ];
    
    for (const indicator of supportIndicators) {
      if (messageElement.matches(indicator) || messageElement.querySelector(indicator)) {
        return true;
      }
    }
    
    const classList = messageElement.className;
    return classList.includes('support') || 
           classList.includes('agent') || 
           classList.includes('incoming') ||
           !classList.includes('user') && !classList.includes('outgoing');
  }

  async handleSupportMessage(message) {
    try {
      await this.sleep(2000 + Math.random() * 3000);
      
      const response = await this.sendMessage({
        type: 'PROCESS_MESSAGE',
        data: {
          message: message.text,
          context: { tabId: 'swiggy' },
          platform: 'Swiggy'
        }
      });
      
      if (response.response) {
        await this.typeAndSendResponse(response.response);
      }
    } catch (error) {
      console.error('Error processing support message:', error);
    }
  }

  async typeAndSendResponse(responseText) {
    if (!this.messageInput || !responseText) return;
    
    this.messageInput.focus();
    await this.sleep(500);
    
    for (let i = 0; i < responseText.length; i++) {
      this.messageInput.value += responseText[i];
      this.messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      await this.sleep(50 + Math.random() * 100);
    }
    
    await this.sleep(1000);
    
    if (this.sendButton) {
      this.sendButton.click();
    } else {
      this.messageInput.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
        keyCode: 13,
        bubbles: true
      }));
    }
  }

  async sendMessage(message) {
    return new Promise((resolve, reject) => {
      if (!chrome.runtime?.id) {
        reject(new Error('Extension context invalidated'));
        return;
      }
      
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

if (window.location.hostname.includes('swiggy.com')) {
  const swiggyChatBot = new SwiggyChatBot();
}