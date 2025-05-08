/**
 * input-handler.js - Keyboard input management for typing tests
 * Handles input processing, character verification, and completed word handling
 */

const InputHandler = (function() {
    // Private variables
    let inputElement = null;
    let currentWordIndex = 0;
    let typedCorrectChars = 0;
    let typedIncorrectChars = 0;
    let totalChars = 0;
    let errorCount = 0;
    let currentWordHistory = [];
    let words = [];
    let isActive = false;
    let isTestDone = false;
    
    /**
     * Initialize the input handler
     * @param {HTMLElement} input - The input element to attach to
     */
    function initialize(input) {
        inputElement = input;
        
        if (!inputElement) {
            console.error('Input element not provided to InputHandler');
            return;
        }
        
        // Set up input event listener
        inputElement.addEventListener('input', handleInput);
        
        // Set up keydown event for space handling
        inputElement.addEventListener('keydown', handleKeyDown);
        
        // Refocus input when it loses focus
        inputElement.addEventListener('blur', () => {
            // Only refocus if test is active and not in Zoro mode
            if (!isTestDone && !document.querySelector('#zoro-container:not(.hidden)')) {
                setTimeout(() => inputElement.focus(), 0);
            }
        });
        
        // Subscribe to state changes
        if (window.State) {
            State.watch('typing.words', (value) => {
                words = value;
            });
            
            State.watch('typing.currentWordIndex', (value) => {
                currentWordIndex = value;
            });
            
            State.watch('typing.active', (value) => {
                isActive = value;
            });
            
            State.watch('typing.doneTyping', (value) => {
                isTestDone = value;
            });
        }
    }
    
    /**
     * Handle input events
     * @param {Event} e - Input event
     */
    function handleInput(e) {
        // If test is done, ignore input
        if (isTestDone) return;
        
        // Start test if not already active
        if (!isActive) {
            // Emit event to start test
            if (window.EventBus) {
                EventBus.publish('typing:start');
            }
            
            // Update state
            if (window.State) {
                State.update('typing.active', true);
            }
            
            // Add typing-active class to body
            document.body.classList.add('typing-active');
        }
        
        // Get current input and current word
        const currentInput = inputElement.value;
        const currentWord = words[currentWordIndex] || '';
        
        // Update character highlighting in the current word
        if (window.TextDisplay) {
            TextDisplay.updateCharHighlighting(currentInput);
        }
        
        // Check for Easter eggs based on typed word
        checkForEasterEggs(currentInput);
    }
    
    /**
     * Handle keydown events (for space and tab handling)
     * @param {KeyboardEvent} e - Keyboard event
     */
    function handleKeyDown(e) {
        // Handle tab key for test restart
        if (e.key === 'Tab') {
            e.preventDefault();
            
            // Publish reset event
            if (window.EventBus) {
                EventBus.publish('typing:reset');
            }
            
            return;
        }
        
        // Only handle space for completing words if test is active and not done
        if (e.code === 'Space' && isActive && !isTestDone) {
            e.preventDefault(); // Prevent default space behavior
            
            // Get current input without the space
            const typedWord = inputElement.value.trim();
            
            // Process the word
            processCompletedWord(typedWord);
            
            // Clear input for next word
            inputElement.value = '';
            
            // Update display
            if (window.TextDisplay) {
                TextDisplay.updateCursorPosition(0);
            }
        }
    }
    
    /**
     * Process completed word
     * @param {string} typedWord - The word typed by the user
     */
    function processCompletedWord(typedWord) {
        // Get correct word
        const correctWord = words[currentWordIndex] || '';
        
        // Save word history
        currentWordHistory.push({
            typed: typedWord,
            target: correctWord,
            correct: typedWord === correctWord
        });
        
        // Calculate characters and errors
        for (let i = 0; i < Math.max(typedWord.length, correctWord.length); i++) {
            totalChars++;
            
            if (i < typedWord.length && i < correctWord.length) {
                if (typedWord[i] === correctWord[i]) {
                    typedCorrectChars++;
                } else {
                    typedIncorrectChars++;
                    errorCount++;
                }
            } else if (i >= typedWord.length && i < correctWord.length) {
                // Missing characters
                typedIncorrectChars++;
                errorCount++;
            } else if (i >= correctWord.length && i < typedWord.length) {
                // Extra characters
                typedIncorrectChars++;
                errorCount++;
            }
        }
        
        // Update state with metrics
        if (window.State) {
            State.update('typing.typedCorrectChars', typedCorrectChars);
            State.update('typing.typedIncorrectChars', typedIncorrectChars);
            State.update('typing.totalChars', totalChars);
            State.update('typing.errorCount', errorCount);
            State.update('typing.wordCount', currentWordIndex + 1);
            State.update('typing.currentWordHistory', currentWordHistory);
        }
        
        // Publish metrics update
        if (window.EventBus) {
            EventBus.publish('typing:metricsUpdated', {
                typedCorrectChars,
                typedIncorrectChars,
                totalChars,
                errorCount,
                wordCount: currentWordIndex + 1
            });
        }
        
        // Check if word mode is complete
        const wordLimit = window.State ? State.get('typing.wordLimit') : 0;
        const timeMode = window.State ? State.get('typing.timeMode') : true;
        
        if (!timeMode && currentWordIndex + 1 >= wordLimit) {
            // End test if we've reached the word limit
            if (window.EventBus) {
                EventBus.publish('typing:complete');
            }
            return;
        }
        
        // Move to next word
        if (window.TextDisplay) {
            TextDisplay.moveToNextWord();
        } else if (window.State) {
            // Update current word index directly if TextDisplay not available
            State.update('typing.currentWordIndex', currentWordIndex + 1);
        }
    }
    
    /**
     * Check for Easter eggs based on typed word
     * @param {string} input - Current input value
     */
    function checkForEasterEggs(input) {
        // Convert to lowercase for easier comparison
        const lowerInput = input.toLowerCase().trim();
        
        // Only check completed words (with space at the end)
        if (!input.endsWith(' ')) return;
        
        // Gomu Gomu trigger
        if (lowerInput === "gomu" || lowerInput === "gomugomu") {
            if (window.utilsModule && window.utilsModule.playSound) {
                window.utilsModule.playSound('sounds/gomu.mp3', 1.0);
                showNotification("Gomu Gomu no... Typing Test! 🏴‍☠️", 3000);
                
                // Add temporary gomu visual effect with Luffy gif
                document.body.classList.add('gomu-effect');
                setTimeout(() => document.body.classList.remove('gomu-effect'), 5000);
            }
        }
        
        // Nami-swan trigger with disappointment effect
        if (lowerInput === "namiswan" || lowerInput === "nami") {
            if (window.utilsModule && window.utilsModule.playSound) {
                window.utilsModule.playSound('sounds/namiswan.mp3', 1.0);
                showNotification("Nami-swaaaan! 💰💰💰 Berry, berry!", 3000);
                
                // Add temporary class for money effect with Nami image
                document.body.classList.add('nami-effect');
                setTimeout(() => document.body.classList.remove('nami-effect'), 4000);
            }
        }
    }
    
    /**
     * Show a notification message
     * @param {string} message - Message to display
     * @param {number} duration - Duration to show in ms
     */
    function showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Trigger appearance
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            notification.classList.remove('show');
            
            // Remove from DOM after animation
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }
    
    /**
     * Get current metrics
     * @returns {Object} - Current typing metrics
     */
    function getMetrics() {
        return {
            typedCorrectChars,
            typedIncorrectChars,
            totalChars,
            errorCount,
            wordCount: currentWordIndex + 1,
            currentWordHistory
        };
    }
    
    /**
     * Reset the input handler
     */
    function reset() {
        // Clear input
        if (inputElement) {
            inputElement.value = '';
        }
        
        // Reset metrics
        typedCorrectChars = 0;
        typedIncorrectChars = 0;
        totalChars = 0;
        errorCount = 0;
        currentWordHistory = [];
        
        // Update state
        if (window.State) {
            State.update('typing.typedCorrectChars', 0);
            State.update('typing.typedIncorrectChars', 0);
            State.update('typing.totalChars', 0);
            State.update('typing.errorCount', 0);
            State.update('typing.wordCount', 0);
            State.update('typing.currentWordHistory', []);
            State.update('typing.active', false);
            State.update('typing.doneTyping', false);
        }
        
        // Ensure focus is on input
        if (inputElement) {
            setTimeout(() => inputElement.focus(), 0);
        }
    }
    
    /**
     * Focus the input element
     */
    function focus() {
        if (inputElement) {
            inputElement.focus();
        }
    }
    
    // Public API
    return {
        initialize,
        getMetrics,
        reset,
        focus
    };
})();

// Export for use in other modules
window.InputHandler = InputHandler;