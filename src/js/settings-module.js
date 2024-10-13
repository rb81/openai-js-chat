import encryptionUtils from './encryption-utils.js';
import chatHistoryModule from './chat-history-module.js';
import uiModule from './ui-module.js';
import debugUtils from './debug-utils.js';

const settingsModule = {
    settings: {
        apiKey: '',
        systemPrompt: 'You are a friendly assistant.',
        botName: 'ChatGPT',
        userName: 'You',
        darkMode: false,
        maxHistoryLength: 100,
        memories: []
    },

    async loadSettings() {
        const savedSettings = localStorage.getItem('chatSettings');
        debugUtils.log('Saved settings:', savedSettings);
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            debugUtils.log('Parsed settings:', parsedSettings);
            this.settings = { ...this.settings, ...parsedSettings };
            // Decrypt the API key
            if (this.settings.apiKey) {
                const encryptedApiKey = JSON.parse(this.settings.apiKey);
                this.settings.apiKey = await encryptionUtils.decryptData(encryptedApiKey, 'your-secret-password');
            }
            debugUtils.log('Loaded settings:', this.settings);
        } else {
            debugUtils.log('No saved settings found');
        }
    },

    async saveSettings() {
        const settingsToSave = { ...this.settings };
        if (settingsToSave.apiKey) {
            const encryptedApiKey = await encryptionUtils.encryptData(settingsToSave.apiKey, 'your-secret-password');
            settingsToSave.apiKey = JSON.stringify(encryptedApiKey);
        }
        localStorage.setItem('chatSettings', JSON.stringify(settingsToSave));
        debugUtils.log('Settings saved:', settingsToSave);
    },

    async updateSetting(key, value) {
        if (key === 'memories') {
            if (Array.isArray(value)) {
                this.settings[key] = value;
            } else if (value === null || value === undefined) {
                this.settings[key] = []; // Clear memories if null or undefined
            } else {
                debugUtils.log('Attempted to update memories with invalid value:', value);
                return; // Don't update if the value is invalid
            }
        } else {
            this.settings[key] = value;
        }
        if (key === 'darkMode') {
            uiModule.applyDarkMode();
        }
        // Always save settings after an update
        await this.saveSettings();
        debugUtils.log(`Setting updated and saved: ${key} = ${value}`);
    },

    applyDarkMode() {
        if (this.settings.darkMode) {
            $('body').addClass('dark-mode');
        } else {
            $('body').removeClass('dark-mode');
        }
    },

    updateSetting(key, value) {
        this.settings[key] = value;
    },

    deleteAllMessages() {
        if (confirm("Are you sure you want to delete all messages? This action cannot be undone.")) {
            chatHistoryModule.clearChatHistory();
            uiModule.clearChatMessages();
            debugUtils.log('All messages deleted');
            
            // Reload the chat history to ensure it's empty
            chatHistoryModule.loadChatHistory();
        }
    }
};

export default settingsModule;