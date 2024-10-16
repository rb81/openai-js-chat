# OpenAI JavaScript Chat Application

![OpenAI JavaScript Chat Application Screenshot](/header.png)

A simple JavaScript OpenAI application that allows you to chat with OpenAI. It supports a very rudimentary form of memory management, and the conversation history is encrypted and stored in the browser's local storage.

## Features

- Real-time chat interface with AI responses
- Chat history management with basic encryption
- Markdown support for rich text formatting
- Memory feature for context-aware conversations
- Customizable settings (API key, system prompt, bot name, user name)
- Debug mode for development
- Dark mode toggle

## Getting Started

### Prerequisites

- Modern web browser
- OpenAI API key (for AI functionality)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/rb81/openai-js-chat.git
   ```

2. Navigate to the project directory:
   ```
   cd openai-js-chat
   ```

3. To run the application properly and allow it to make API calls, you need to serve it from a local HTTP server instead of opening it directly as a file. You can use the included `server.py` script for this purpose.
   ```
   python server.py
   ```

### Configuration

1. Open the settings panel in the application.
2. Enter your OpenAI API key.
3. Customize other settings as desired (system prompt, bot name, user name, etc.).

## Usage

1. Type your message in the input field and press Enter or click the send button.
2. The AI will respond based on the conversation context and your settings.
3. Use the settings panel to adjust application behavior.

## Development

To run the application in debug mode, append `?debug=true` to the URL. Detailed logging will be displayed in the browser's console.

## File Structure

- `src/js/main-app.js`: Main application logic
- `src/js/ui-module.js`: User interface management
- `src/js/api-module.js`: OpenAI API interaction
- `src/js/settings-module.js`: Settings management
- `src/js/chat-history-module.js`: Chat history handling
- `src/js/encryption-utils.js`: Data encryption utilities
- `src/js/debug-utils.js`: Debugging utilities

## Acknowledgments

- [Markdown-it](https://github.com/markdown-it/markdown-it) for Markdown rendering

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This application uses OpenAI's API, which may have usage costs. Please be aware of OpenAI's pricing and terms of service when using this application.

## Transparency Disclaimer

[ai.collaboratedwith.me](https://ai.collaboratedwith.me) in creating this project.
