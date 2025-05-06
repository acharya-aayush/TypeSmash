/**
 * Utility functions for the typing game application
 */

/**
 * Formats a timestamp into a readable date/time string
 * @param {Date|number} date - Date object or timestamp
 * @returns {string} Formatted date string
 */
function formatTimestamp(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Returns a random word from the word list
 * @returns {string} Random word
 */
function getRandomWord() {
    const wordList = [
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
        'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
        'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
        'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
        'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
        'code', 'data', 'type', 'learn', 'work', 'such', 'give', 'want', 'use', 'software',
        'build', 'great', 'should', 'product', 'system', 'first', 'well', 'way', 'even', 'new'
    ];
    return wordList[Math.floor(Math.random() * wordList.length)];
}

/**
 * Plays a sound with the given volume
 * @param {string} filePath - Path to the sound file
 * @param {number} volume - Volume level (0.0 to 1.0)
 * @returns {HTMLAudioElement} The audio element
 */
function playSound(filePath, volume = 1.0) {
    const audio = new Audio(filePath);
    audio.volume = volume;
    
    // Prevent overlapping sounds by stopping previous instances
    const existingSounds = document.querySelectorAll(`audio[src="${filePath}"]`);
    existingSounds.forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
    });
    
    audio.play().catch(error => {
        console.warn('Failed to play sound:', error);
    });
    
    return audio;
}

/**
 * Formats time in seconds to a readable format (mm:ss)
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Animates text with a typewriter or fade effect
 * @param {HTMLElement} element - Element to animate
 * @param {Object} options - Animation options
 */
function animateText(element, options = {}) {
    const defaultOptions = {
        type: 'fade', // 'fade' or 'typewriter'
        duration: 500, // in milliseconds
        delay: 0 // in milliseconds
    };
    
    const settings = { ...defaultOptions, ...options };
    
    if (settings.type === 'fade') {
        element.style.opacity = '0';
        element.style.transition = `opacity ${settings.duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, settings.delay);
    } 
    else if (settings.type === 'typewriter') {
        const text = element.textContent;
        element.textContent = '';
        element.style.opacity = '1';
        
        let charIndex = 0;
        const typeInterval = setInterval(() => {
            if (charIndex < text.length) {
                element.textContent += text.charAt(charIndex);
                charIndex++;
            } else {
                clearInterval(typeInterval);
            }
        }, settings.duration / text.length);
    }
}

/**
 * Creates a debounced function that delays invoking the provided function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

/**
 * Generates a specified number of words for use in the typing test
 * @param {number} count - Number of words to generate
 * @returns {string[]} Array of words
 */
function generateWordList(count) {
    const words = [];
    
    // Get random words, but ensure no duplicates next to each other
    for (let i = 0; i < count; i++) {
        let randomWord;
        do {
            randomWord = getRandomWord();
        } while (i > 0 && randomWord === words[i - 1]);
        
        words.push(randomWord);
    }
    
    return words;
}

/**
 * Calculates the WPM (Words Per Minute) based on characters typed and time taken
 * @param {number} charCount - Number of characters typed
 * @param {number} seconds - Time taken in seconds
 * @returns {number} Calculated WPM
 */
function calculateWPM(charCount, seconds) {
    // Standard WPM calculation (5 characters = 1 word)
    const minutes = seconds / 60;
    const words = charCount / 5;
    return Math.round(words / minutes);
}

// Make functions globally accessible
window.utilsModule = {
    formatTimestamp,
    getRandomWord,
    playSound,
    formatTime,
    animateText,
    debounce,
    generateWordList,
    calculateWPM
};