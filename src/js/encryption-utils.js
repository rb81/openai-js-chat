const encryptionUtils = {
    async encryptData(data, password) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const passwordBuffer = encoder.encode(password);
        
        const key = await crypto.subtle.importKey(
            'raw', 
            passwordBuffer,
            {name: 'PBKDF2'},
            false, 
            ['deriveKey']
        );
        
        const derivedKey = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            key,
            {name: 'AES-GCM', length: 256},
            false,
            ['encrypt']
        );
        
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedData = await crypto.subtle.encrypt(
            {name: 'AES-GCM', iv: iv},
            derivedKey,
            dataBuffer
        );
        
        return {
            salt: Array.from(salt),
            iv: Array.from(iv),
            encryptedData: Array.from(new Uint8Array(encryptedData))
        };
    },

    async decryptData(encryptedObj, password) {
        const encoder = new TextEncoder();
        const salt = new Uint8Array(encryptedObj.salt);
        const iv = new Uint8Array(encryptedObj.iv);
        const encryptedData = new Uint8Array(encryptedObj.encryptedData);
        const passwordBuffer = encoder.encode(password);
        
        const key = await crypto.subtle.importKey(
            'raw', 
            passwordBuffer,
            {name: 'PBKDF2'},
            false, 
            ['deriveKey']
        );
        
        const derivedKey = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            key,
            {name: 'AES-GCM', length: 256},
            false,
            ['decrypt']
        );
        
        const decryptedBuffer = await crypto.subtle.decrypt(
            {name: 'AES-GCM', iv: iv},
            derivedKey,
            encryptedData
        );
        
        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    }
};

export default encryptionUtils;