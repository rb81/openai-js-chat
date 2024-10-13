import settingsModule from './settings-module.js';
import debugUtils from './debug-utils.js';

const uiModule = {
    md: window.markdownit(),

    init() {
        this.bindEventListeners();
        this.applyCurrentSettings();

        // Add event listener for memories textarea
        $('#memories').on('change', () => {
            const newMemories = $('#memories').val();
            settingsModule.updateSetting('memories', newMemories);
            debugUtils.log('Memories manually updated and saved:', newMemories);
        });
    },

    bindEventListeners() {
        $('#settings-toggle').click(() => this.toggleSettingsPanel());
        $('.close-settings').click(() => this.closeSettingsPanel());
        $('#save-settings').click(() => this.saveSettings());
        $('.send-button').click(() => this.sendMessage());
        $('.chat-input input').keypress((e) => {
            if (e.which == 13) {
                this.sendMessage();
                return false;
            }
        });
        $('#max-history').on('change', function() {
            settingsModule.updateSetting('maxHistoryLength', parseInt($(this).val()) || 100);
        });
        $('#delete-messages').click(() => settingsModule.deleteAllMessages());
        
        $('#dark-mode').on('change', () => {
            this.toggleDarkMode();
        });
    },

    toggleSettingsPanel() {
        $('.settings-panel').toggleClass('open');
    },

    closeSettingsPanel() {
        $('.settings-panel').removeClass('open');
    },

    applyCurrentSettings() {
        $('#api-key').val(settingsModule.settings.apiKey || '');
        $('#system-prompt').val(settingsModule.settings.systemPrompt || '');
        $('#bot-name').val(settingsModule.settings.botName || 'ChatGPT');
        $('#user-name').val(settingsModule.settings.userName || 'You');
        $('#dark-mode').prop('checked', settingsModule.settings.darkMode);
        $('#max-history').val(settingsModule.settings.maxHistoryLength || 100);
        const memories = settingsModule.settings.memories || [];
        $('#memories').val(Array.isArray(memories) ? memories.join('\n') : memories);
        this.applyDarkMode();
        debugUtils.log('Applied current settings. Memories:', settingsModule.settings.memories);
    },

    saveSettings() {
        settingsModule.updateSetting('apiKey', $('#api-key').val());
        settingsModule.updateSetting('systemPrompt', $('#system-prompt').val());
        settingsModule.updateSetting('botName', $('#bot-name').val() || 'ChatGPT');
        settingsModule.updateSetting('userName', $('#user-name').val() || 'You');
        settingsModule.updateSetting('darkMode', $('#dark-mode').is(':checked'));
        settingsModule.updateSetting('maxHistoryLength', parseInt($('#max-history').val()) || 100);
        settingsModule.updateSetting('memories', $('#memories').val());
        settingsModule.saveSettings();
        debugUtils.log('Settings saved');
        this.closeSettingsPanel();
    },

    toggleDarkMode() {
        const isDarkMode = $('#dark-mode').is(':checked');
        settingsModule.updateSetting('darkMode', isDarkMode);
        this.applyDarkMode();
    },

    applyDarkMode() {
        if (settingsModule.settings.darkMode) {
            $('body').addClass('dark-mode');
        } else {
            $('body').removeClass('dark-mode');
        }
    },

    async addMessage(content, isUser) {
        const messageClass = isUser ? 'user-message' : 'bot-message';
        const name = isUser ? settingsModule.settings.userName : settingsModule.settings.botName;
        const timestamp = new Date().toLocaleTimeString();
        const renderedContent = this.md.render(content);
        const messageHtml = `
            <div class="message ${messageClass}">
                <div class="message-header">
                    <strong class="message-name">${name}</strong>
                    <span class="timestamp">${timestamp}</span>
                </div>
                <div class="message-content">
                    ${renderedContent}
                </div>
            </div>
        `;
        $('.chat-messages').append(messageHtml);
        this.scrollToBottom();
    },

    scrollToBottom() {
        const chatMessages = $('.chat-messages');
        chatMessages.scrollTop(chatMessages[0].scrollHeight);
    },

    sendMessage() {
        const message = $('.chat-input input').val().trim();
        if (message) {
            $('.chat-input input').val('');
            $('.chat-input input').prop('disabled', true);
            $('.chat-input button').prop('disabled', true);
            return message;
        }
        return null;
    },

    showTypingIndicator() {
        $('.chat-messages').append('<div class="message bot-message"><div class="message-content loading">ChatGPT is doing its thing</div></div>');
        this.scrollToBottom();
    },

    removeTypingIndicator() {
        $('.loading').closest('.message').remove();
    },

    enableInput() {
        $('.chat-input input').prop('disabled', false).focus();
        $('.chat-input button').prop('disabled', false);
    },

    clearChatMessages() {
        $('.chat-messages').empty();
        debugUtils.log('Chat messages cleared');
    },

    handleAPIError(statusCode) {
        let errorMessage;
        switch(statusCode) {
            case 401:
                errorMessage = "Authentication error. Please check your API key.";
                break;
            case 429:
                errorMessage = "Rate limit exceeded. Please try again later.";
                break;
            case 500:
                errorMessage = "Server error. Please try again later.";
                break;
            default:
                errorMessage = "An error occurred. Please try again.";
        }
        this.addMessage(errorMessage, false);
        console.error(`API Error: ${errorMessage}`);
    }
};

export default uiModule;