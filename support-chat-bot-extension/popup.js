class PopupController {
  constructor() {
    this.elements = {
      apiKey: document.getElementById('apiKey'),
      saveApiKey: document.getElementById('saveApiKey'),
      toggleBot: document.getElementById('toggleBot'),
      status: document.getElementById('status'),
      botStatus: document.getElementById('botStatus')
    };
    
    this.isActive = false;
    this.hasApiKey = false;
    
    this.initialize();
  }

  async initialize() {
    await this.loadStatus();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadStatus() {
    try {
      const response = await this.sendMessage({ type: 'GET_STATUS' });
      this.isActive = response?.isActive || false;
      this.hasApiKey = response?.hasApiKey || false;
    } catch (error) {
      console.error('Failed to load status:', error);
      this.showStatus('Error loading bot status', 'error');
      this.isActive = false;
      this.hasApiKey = false;
    }
  }

  setupEventListeners() {
    this.elements.saveApiKey.addEventListener('click', () => this.saveApiKey());
    this.elements.toggleBot.addEventListener('click', () => this.toggleBot());
    
    this.elements.apiKey.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.saveApiKey();
      }
    });
  }

  async saveApiKey() {
    const apiKey = this.elements.apiKey.value.trim();
    
    if (!apiKey) {
      this.showStatus('Please enter a valid API key', 'error');
      return;
    }
    
    if (!apiKey.startsWith('sk-')) {
      this.showStatus('API key should start with "sk-"', 'error');
      return;
    }
    
    this.elements.saveApiKey.disabled = true;
    this.elements.saveApiKey.textContent = 'Saving...';
    
    try {
      await this.sendMessage({
        type: 'SET_API_KEY',
        data: { apiKey }
      });
      
      this.hasApiKey = true;
      this.elements.apiKey.value = '';
      this.showStatus('API key saved successfully!', 'success');
      this.updateUI();
      
    } catch (error) {
      this.showStatus('Failed to save API key', 'error');
    } finally {
      this.elements.saveApiKey.disabled = false;
      this.elements.saveApiKey.textContent = 'Save API Key';
    }
  }

  async toggleBot() {
    if (!this.hasApiKey) {
      this.showStatus('Please save your API key first', 'warning');
      return;
    }
    
    this.elements.toggleBot.disabled = true;
    const newState = !this.isActive;
    
    try {
      await this.sendMessage({
        type: 'TOGGLE_BOT',
        data: { active: newState }
      });
      
      this.isActive = newState;
      this.updateUI();
      
      const statusMessage = newState ? 
        'Bot enabled! Navigate to Swiggy/Zomato support chat.' : 
        'Bot disabled.';
      this.showStatus(statusMessage, 'success');
      
      await this.notifyContentScripts(newState);
      
    } catch (error) {
      this.showStatus('Failed to toggle bot', 'error');
    } finally {
      this.elements.toggleBot.disabled = false;
    }
  }

  async notifyContentScripts(active) {
    try {
      const tabs = await chrome.tabs.query({
        url: ['https://www.swiggy.com/*', 'https://www.zomato.com/*']
      });
      
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'TOGGLE_BOT',
            data: { active }
          });
        } catch (tabError) {
          console.log(`Failed to notify tab ${tab.id}:`, tabError.message);
        }
      }
    } catch (error) {
      console.log('No active Swiggy/Zomato tabs found:', error.message);
    }
  }

  updateUI() {
    this.updateBotStatus();
    this.updateToggleButton();
  }

  updateBotStatus() {
    const statusElement = this.elements.botStatus;
    
    if (!this.hasApiKey) {
      statusElement.textContent = '⚠️ API Key Required';
      statusElement.className = 'bot-status bot-inactive';
    } else if (this.isActive) {
      statusElement.textContent = '✅ Bot Active';
      statusElement.className = 'bot-status bot-active';
    } else {
      statusElement.textContent = '⏸️ Bot Inactive';
      statusElement.className = 'bot-status bot-inactive';
    }
  }

  updateToggleButton() {
    const button = this.elements.toggleBot;
    
    if (!this.hasApiKey) {
      button.disabled = true;
      button.textContent = 'Configure API Key First';
      button.className = 'toggle-button inactive';
    } else if (this.isActive) {
      button.disabled = false;
      button.textContent = 'Disable Bot';
      button.className = 'toggle-button inactive';
    } else {
      button.disabled = false;
      button.textContent = 'Enable Bot';
      button.className = 'toggle-button';
    }
  }

  showStatus(message, type) {
    const statusElement = this.elements.status;
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
    statusElement.classList.remove('hidden');
    
    setTimeout(() => {
      statusElement.classList.add('hidden');
    }, 4000);
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});