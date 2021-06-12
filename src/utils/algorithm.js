const sodium = require('tweetsodium');

module.exports = {
    shuffle(array) {
        let currentIndex = array.length, randomIndex;

        while (0 !== currentIndex) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
          [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    },
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    },
    encrypt(key, value) {
        // Convert the message and key to Uint8Array's (Buffer implements that interface)
        const messageBytes = Buffer.from(value);
        const keyBytes = Buffer.from(key, 'base64');

        // Encrypt using LibSodium.
        const encryptedBytes = sodium.seal(messageBytes, keyBytes);

        // Base64 the encrypted secret
        const encrypted = Buffer.from(encryptedBytes).toString('base64');

        return encrypted;
    }
};
