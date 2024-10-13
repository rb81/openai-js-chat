import encryptionUtils from './encryption-utils.js';
import settingsModule from './settings-module.js';
//import debugUtils from './debug-utils.js';

const chatHistoryModule = {
    chatHistory: [],

    async saveChatHistory() {
        // Trim chat history to maxHistoryLength
        this.chatHistory = this.chatHistory.slice(-settingsModule.settings.maxHistoryLength);
        
        try {
            // Encrypt chat history
            const encryptedHistory = await encryptionUtils.encryptData(JSON.stringify(this.chatHistory), 'your-secret-password');
            localStorage.setItem('chatHistory', JSON.stringify(encryptedHistory));
            return true;
        } catch (error) {
            console.error('Error saving chat history:', error);
            return false;
        }
    },

    async loadChatHistory() {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            try {
                const encryptedHistory = JSON.parse(savedHistory);
                const decryptedHistory = await encryptionUtils.decryptData(encryptedHistory, 'your-secret-password');
                this.chatHistory = JSON.parse(decryptedHistory);
                return true;
            } catch (error) {
                console.error('Error loading chat history:', error);
                this.chatHistory = [];
                return false;
            }
        } else {
            this.chatHistory = [];
            return true;
        }
    },

    addMessage(content, isUser) {
        this.chatHistory.push({ role: isUser ? "user" : "assistant", content: content });
        return this.saveChatHistory();
    },

    getMessages() {
        return this.chatHistory;
    },

    clearChatHistory() {
        this.chatHistory = [];
        localStorage.removeItem('chatHistory');
        return true;
    }
};

export default chatHistoryModule;