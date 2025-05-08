/**
 * word-provider.js - Word generation and management for typing tests
 * Handles random word generation and text passage loading
 */

const WordProvider = (function() {
    // Private variables
    let words = [];
    let currentWordLimit = 20;
    let actualWordCount = 20;
    let isUpdating = false; // Flag to prevent infinite recursion
    
    /**
     * Generate a set of random words
     * @param {number} count - Number of words to generate
     * @returns {Array} - Array of generated words
     */
    function generateRandomWords(count) {
        const generatedWords = [];
        for (let i = 0; i < count; i++) {
            // Use the utils module to get random words
            if (window.utilsModule && window.utilsModule.getRandomWord) {
                generatedWords.push(window.utilsModule.getRandomWord());
            } else {
                // Fallback to a simple word if utils module not available
                generatedWords.push('word');
            }
        }
        return generatedWords;
    }
    
    /**
     * Load words from a text passage based on word count
     * @param {number} wordCount - Nominal word count
     * @returns {Object} - Object containing words array and actual word count
     */
    function loadPassageWords(wordCount) {
        let passageWords = [];
        let actualCount = wordCount;
        
        if (window.utilsModule && window.utilsModule.getRandomPassage) {
            // Get a passage and its actual word count
            const { text, actualWordCount } = window.utilsModule.getRandomPassage(wordCount);
            
            // Update actual word count
            actualCount = actualWordCount;
            
            // Split the passage into words
            passageWords = text.trim().split(/\s+/).filter(word => word.length > 0);
        } else {
            // Fall back to random words if utility function is not available
            passageWords = generateRandomWords(wordCount);
            actualCount = wordCount;
        }
        
        return { words: passageWords, actualWordCount: actualCount };
    }
    
    /**
     * Set the word list based on mode and word count
     * @param {boolean} isTimeMode - Whether in timed mode
     * @param {number} wordCount - Word count for word mode
     */
    function setWordList(isTimeMode, wordCount) {
        // Prevent infinite recursion
        if (isUpdating) return { words, wordLimit: currentWordLimit, actualWordCount };
        
        isUpdating = true;
        
        // For timed mode, use larger amount of random words
        if (isTimeMode) {
            words = generateRandomWords(100);
            currentWordLimit = words.length; // No real limit in timed mode
            actualWordCount = words.length;
        } else {
            // For word mode, use meaningful passages
            try {
                const result = loadPassageWords(wordCount);
                words = result.words;
                currentWordLimit = wordCount;
                actualWordCount = result.actualWordCount;
            } catch (error) {
                console.error('Error loading passage words:', error);
                // Fallback to simple word list in case of error
                words = generateRandomWords(wordCount);
                currentWordLimit = wordCount;
                actualWordCount = wordCount;
            }
        }
        
        // Update state first (before publishing events)
        if (window.State) {
            State.update('typing.words', words);
            State.update('typing.wordLimit', currentWordLimit);
            State.update('typing.actualWordCount', actualWordCount);
        }
        
        // Publish state changes via EventBus
        if (window.EventBus) {
            EventBus.publish('wordProvider:wordsUpdated', { 
                words: words, 
                wordLimit: currentWordLimit,
                actualWordCount: actualWordCount
            });
        }
        
        // Reset flag after a short delay to ensure all event handlers have completed
        setTimeout(() => {
            isUpdating = false;
        }, 0);
        
        return {
            words,
            wordLimit: currentWordLimit,
            actualWordCount
        };
    }
    
    /**
     * Get a specific word by index
     * @param {number} index - Word index
     * @returns {string} - Word at the specified index
     */
    function getWordAtIndex(index) {
        return index >= 0 && index < words.length ? words[index] : '';
    }
    
    /**
     * Get the current word list
     * @returns {Array} - Current word list
     */
    function getWords() {
        return words;
    }
    
    /**
     * Get the current word limit
     * @returns {number} - Current word limit
     */
    function getWordLimit() {
        return currentWordLimit;
    }
    
    /**
     * Get the actual word count
     * @returns {number} - Actual word count
     */
    function getActualWordCount() {
        return actualWordCount;
    }
    
    // Public API
    return {
        setWordList,
        getWords,
        getWordLimit,
        getActualWordCount,
        getWordAtIndex
    };
})();

// Export for use in other modules
window.WordProvider = WordProvider;