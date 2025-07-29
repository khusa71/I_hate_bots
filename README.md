# I Hate Bots - Support Chat Automation

This repository contains a Chrome extension that automates support chat conversations on food delivery platforms using AI.

## 📁 Project Structure

```
I_hate_bots/
└── support-chat-bot-extension/     # Chrome extension for chat automation
    ├── manifest.json               # Extension configuration
    ├── background.js              # Service worker & API handler
    ├── popup.html & popup.js      # Extension popup interface
    ├── content-scripts/           # Site-specific automation scripts
    │   ├── swiggy-chat.js        # Swiggy support chat automation
    │   └── zomato-chat.js        # Zomato support chat automation
    ├── utils/                    # Utility functions
    │   └── gpt-api.js           # OpenAI GPT API integration
    ├── README.md                # Detailed extension documentation
    └── ISSUES_FIXED.md         # Code review and fixes log
```

## 🤖 Support Chat Bot Extension

AI-powered Chrome extension that automatically handles support chat conversations on Swiggy and Zomato using GPT-4.

### Key Features
- **Auto-detection** of support chat windows
- **Intelligent responses** powered by GPT-4
- **Human-like typing** with realistic delays
- **Conversation context** preservation
- **Easy toggle** on/off functionality

### Quick Start

1. **Load Extension**
   ```bash
   # Open Chrome
   # Go to chrome://extensions/
   # Enable Developer mode
   # Click "Load unpacked"
   # Select: support-chat-bot-extension/ folder
   ```

2. **Configure**
   - Get OpenAI API key from https://platform.openai.com/api-keys
   - Click extension icon and paste API key
   - Toggle "Enable Bot"

3. **Use**
   - Navigate to Swiggy or Zomato support chat
   - Bot automatically responds to support messages

### Documentation

See [`support-chat-bot-extension/README.md`](./support-chat-bot-extension/README.md) for complete documentation including:
- Detailed installation guide
- Configuration instructions
- Usage examples
- Troubleshooting
- Architecture overview

## ⚠️ Disclaimer

This project is for educational purposes. Use responsibly and ensure compliance with platform terms of service.