# Support Chat Bot - Chrome Extension

🤖 AI-powered Chrome extension that automates support chat conversations on Swiggy and Zomato using GPT-4.

## ✨ Features

- **Auto-detection** of support chat windows on Swiggy & Zomato
- **Intelligent responses** powered by GPT-4
- **Human-like typing** with realistic delays
- **Conversation context** preservation
- **Easy toggle** on/off functionality
- **Secure API key** storage

## 🚀 Installation

### Method 1: Load Unpacked Extension (Recommended for Development)

1. **Download the extension**
   ```bash
   git clone <repository-url>
   cd support-chat-bot-extension
   ```

2. **Open Chrome Extensions page**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (top-right toggle)

3. **Load the extension**
   - Click "Load unpacked"
   - Select the `support-chat-bot-extension` folder
   - The extension should now appear in your extensions list

4. **Pin the extension** (optional)
   - Click the puzzle piece icon in Chrome toolbar
   - Pin "Support Chat Bot" for easy access

## ⚙️ Setup

### 1. Get OpenAI API Key
- Visit [OpenAI API](https://platform.openai.com/api-keys)
- Create a new API key
- Copy the key (starts with `sk-`)

### 2. Configure the Extension
- Click the extension icon in Chrome toolbar
- Paste your API key in the "OpenAI API Key" field
- Click "Save API Key"

### 3. Enable the Bot
- Toggle "Enable Bot" button
- The status should show "✅ Bot Active"

## 📖 Usage

1. **Navigate to support chat**
   - Go to Swiggy.com or Zomato.com
   - Start a support chat conversation

2. **Automatic operation**
   - The bot will automatically detect incoming support messages
   - It will generate and send appropriate responses
   - Maintains conversation context throughout the chat

3. **Manual control**
   - Use the extension popup to enable/disable the bot
   - Bot will only respond when enabled and API key is configured

## 🔧 How It Works

### Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Popup UI      │    │  Background.js  │    │ Content Script  │
│  (Configuration)│◄──►│  (API Handler)  │◄──►│ (Chat Monitor)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   OpenAI API    │
                       │    (GPT-4)      │
                       └─────────────────┘
```

### Flow
1. **Content Script** monitors chat DOM for new support messages
2. **Background Script** processes messages and calls GPT-4 API
3. **GPT Response** is typed naturally into the chat input
4. **Conversation Context** is maintained for better responses

## 🛡️ Security & Privacy

- ✅ API keys are stored locally in Chrome storage
- ✅ No data is sent to external servers (except OpenAI)
- ✅ Works entirely within your browser
- ✅ Can be disabled at any time
- ✅ No tracking or analytics

## ⚠️ Important Notes

### Limitations
- Requires valid OpenAI API key with GPT-4 access
- May not work if Swiggy/Zomato change their chat interface
- Responses are limited to 150 tokens to keep conversations natural
- Bot can be detected if typing patterns are too consistent

### Ethical Usage
- Use responsibly and in accordance with platform terms
- Don't abuse the automation for spam or malicious purposes
- Consider informing support agents if required by platform policies

### API Costs
- Each message costs ~$0.03-0.06 depending on conversation length
- Monitor your OpenAI usage to avoid unexpected charges

## 🐛 Troubleshooting

### Bot Not Responding
1. Check if API key is saved correctly
2. Ensure bot is enabled (green status)
3. Verify you're on a supported page (Swiggy/Zomato)
4. Open browser console to check for errors

### Chat Not Detected
- Try refreshing the page
- Ensure you're in an active support chat
- Check if DOM selectors need updates (contact maintainer)

### API Errors
- Verify API key is valid and has GPT-4 access
- Check OpenAI account has sufficient credits
- Ensure API key permissions include chat completions

## 🔄 Updates

To update the extension:
1. Download the latest version
2. Replace the extension folder
3. Go to `chrome://extensions/`
4. Click the refresh icon on the extension

## 📝 Development

### File Structure
```
support-chat-bot-extension/
├── manifest.json              # Extension configuration
├── background.js             # Service worker & API handler
├── popup.html               # Extension popup interface
├── popup.js                 # Popup functionality
├── content-scripts/
│   ├── swiggy-chat.js      # Swiggy automation
│   └── zomato-chat.js      # Zomato automation
├── utils/
│   └── gpt-api.js          # GPT API utilities
└── README.md               # This file
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes. Use responsibly and in accordance with platform terms of service.

---

**⚠️ Disclaimer**: This extension automates interactions with third-party websites. Use at your own risk and ensure compliance with platform terms of service.