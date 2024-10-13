import settingsModule from './settings-module.js';
import chatHistoryModule from './chat-history-module.js';
import apiModule from './api-module.js';
import uiModule from './ui-module.js';
import debugUtils from './debug-utils.js';

const mainApp = {
    async init() {
        debugUtils.init();
        await settingsModule.loadSettings();
        try {
            await chatHistoryModule.loadChatHistory();
            uiModule.init();
            this.loadChatHistoryToUI();
            debugUtils.log('Application started');
            this.bindEvents();
        } catch (error) {
            debugUtils.log('Error during initialization:', error);
            debugUtils.log('Failed to initialize application');
        }
    },

    async loadChatHistoryToUI() {
        const chatHistory = chatHistoryModule.getMessages();
        for (let i = 0; i < chatHistory.length; i++) {
            const message = chatHistory[i];
            await uiModule.addMessage(message.content, message.role === 'user');
            // Delay to prevent browser lockup
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    },

    bindEvents() {
        $('.send-button').off('click').on('click', () => this.handleSendMessage());
        $('.chat-input input').off('keypress').on('keypress', (e) => {
            if (e.which == 13) {
                this.handleSendMessage();
                return false;
            }
        });
    },

    async handleSendMessage() {
        const message = uiModule.sendMessage();
        if (message) {
            await this.processUserMessage(message);
        }
    },

    async processUserMessage(message) {
        await uiModule.addMessage(message, true);
        await chatHistoryModule.addMessage(message, true);

        uiModule.showTypingIndicator();

        if (settingsModule.settings.apiKey) {
            try {
                const botResponse = await this.callOpenAIAPI();
                uiModule.removeTypingIndicator();

                let responseContent;
                if (typeof botResponse === 'string') {
                    try {
                        const jsonResponse = JSON.parse(botResponse);
                        responseContent = jsonResponse.response || botResponse;
                    } catch (error) {
                        responseContent = botResponse;
                    }
                } else {
                    responseContent = botResponse.response || botResponse;
                }

                await uiModule.addMessage(responseContent, false);
                await chatHistoryModule.addMessage(responseContent, false);
            } catch (error) {
                console.error('Error calling OpenAI API:', error);
                uiModule.removeTypingIndicator();
                uiModule.handleAPIError(error.status);
            }
        } else {
            await this.simulateBotResponse();
        }

        uiModule.enableInput();
    },

    async callOpenAIAPI() {
        const messages = chatHistoryModule.getMessages();
        const memories = settingsModule.settings.memories;
        debugUtils.log('Sending memories to API:', memories);
        const response = await apiModule.callOpenAIAPI(messages, memories);
        debugUtils.log('Memories after API call:', settingsModule.settings.memories);
        return response;
    },

    async simulateBotResponse() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        uiModule.removeTypingIndicator();
        const response = "This is a simulated response. Please set an OpenAI API key in the settings to use the AI model.\n\nHere's some **Markdown** to test:\n\n- Item 1\n- Item 2\n\n```javascript\ndebugUtils.log('Hello, world!');\n```";
        await uiModule.addMessage(response, false);
        await chatHistoryModule.addMessage(response, false);
    }
};

export default mainApp;

// Initialize the app when the document is ready
$(document).ready(() => {
    mainApp.init();
});