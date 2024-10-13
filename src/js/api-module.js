import settingsModule from './settings-module.js';
import debugUtils from './debug-utils.js';

const apiModule = {
    async callOpenAIAPI(messages, memories) {
        const apiKey = settingsModule.settings.apiKey;
        const systemPrompt = settingsModule.settings.systemPrompt || "You are a helpful assistant.";
        const apiMessages = [
            { role: "system", content: systemPrompt },
            {
                role: "system",
                content: `Please respond in JSON format with 'response' and 'memories' keys. The 'response' key should contain your reply to the user. The 'memories' key should be an array of strings, each representing a single, important fact about the user or conversation. Important information includes personal details, preferences, and key discussion points. Maintain a maximum of 10 memories.
              
              Guidelines for memory management:
              1. Avoid duplicates and prioritize concise, unique facts.
              2. Update or replace old memories when new information supersedes them.
              3. If the collection reaches 10 memories, summarize or combine related items to make room for new information.
              4. If the user requests the removal of a memory, do so and return an empty array ([]) for the memories key.
              5. If no new memories are added, return the existing set of memories.
              
              Format each memory as "Category: Information". For example:
              ["Name: John", "Preference: Likes cats", "Occupation: Software developer"]
              
              If the user's input doesn't require adding or updating memories, maintain the existing set. If there's an error or the memory operation can't be performed, include an "error" key in the JSON response explaining the issue.`
              },
              
            { role: "system", content: `Memories: ${memories}` },
            ...messages
        ];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

        try {
            const response = await $.ajax({
                url: 'https://api.openai.com/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                data: JSON.stringify({
                    model: 'gpt-4o',
                    messages: apiMessages,
                    response_format: {"type": "json_object"}
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            debugUtils.log('Raw API Response:', response);

            if (response && response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
                const messageContent = response.choices[0].message.content;
                debugUtils.log('Message Content:', messageContent);

                try {
                    // Try to parse as JSON
                    const jsonResponse = JSON.parse(messageContent);
                    
                    // Check if 'memories' key exists in the response
                    if ('memories' in jsonResponse) {
                        const newMemories = jsonResponse.memories;
                        settingsModule.updateSetting('memories', newMemories);
                        $('#memories').val(Array.isArray(newMemories) ? newMemories.join('\n') : '');

                        // Save the updated settings
                        await settingsModule.saveSettings();

                        debugUtils.log('Memories updated and saved:', newMemories);
                        
                        if (Array.isArray(newMemories) && newMemories.length === 0) {
                            debugUtils.log('Memories have been cleared by the AI');
                        }
                    } else {
                        // If 'memories' key is not present, keep the existing memories
                        debugUtils.log('No changes to memories');
                    }

                    return jsonResponse.response || messageContent;
                } catch (parseError) {
                    // If parsing fails, treat it as plain text
                    debugUtils.log('Response is not JSON, treating as plain text');
                    return messageContent;
                }
            } else {
                throw new Error('Unexpected API response format');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('Request timed out');
            } else {
                console.error('Error calling OpenAI API:', error);
            }
            throw error;
        }
    }
};

export default apiModule;
