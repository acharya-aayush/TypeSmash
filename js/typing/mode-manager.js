/**
 * mode-manager.js - Test mode management for typing tests
 * Handles mode selection (timed, word count), word count selection, and mode-specific configurations
 */

const ModeManager = (function() {
    // Private variables
    let timeMode = true; // Default to timed mode
    let wordModeCount = 20; // Default word count
    let timedModeBtn = null;
    let wordModeBtn = null;
    let wordCountButtons = [];
    let wordCountDropdown = null;
    let timeLabel = null;
    let isResetting = false; // Flag to prevent infinite recursion
    
    /**
     * Initialize the mode manager
     * @param {Object} elements - DOM elements for mode selection
     */
    function initialize(elements) {
        // Store references to DOM elements
        timedModeBtn = elements.timedModeBtn;
        wordModeBtn = elements.wordModeBtn;
        wordCountButtons = elements.wordCountButtons || [];
        wordCountDropdown = elements.wordCountDropdown;
        timeLabel = elements.timeLabel;
        
        // Set up event listeners
        setupEventListeners();
        
        // Set initial state
        if (window.State) {
            State.update('typing.timeMode', timeMode);
            State.update('typing.wordModeCount', wordModeCount);
        }
        
        // Update UI based on initial mode
        updateModeUI();
    }
    
    /**
     * Set up event listeners for mode buttons
     */
    function setupEventListeners() {
        if (timedModeBtn) {
            timedModeBtn.addEventListener('click', () => setMode('timed'));
        }
        
        if (wordModeBtn) {
            wordModeBtn.addEventListener('click', () => setMode('word'));
            
            // Show/hide word count dropdown when word mode is clicked
            wordModeBtn.addEventListener('click', () => {
                if (wordCountDropdown) {
                    wordCountDropdown.classList.toggle('show');
                }
            });
        }
        
        // Word count selection buttons
        if (wordCountButtons && wordCountButtons.length) {
            wordCountButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const wordCount = parseInt(button.dataset.wordCount, 10);
                    if (!isNaN(wordCount)) {
                        setWordCountMode(wordCount);
                    }
                });
            });
        }
        
        // Hide dropdown when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (wordCountDropdown && !e.target.closest('.word-mode-container')) {
                wordCountDropdown.classList.remove('show');
            }
        });
        
        // No longer subscribe to typing:reset event to avoid circular reference
        // EventBus.subscribe('typing:reset', resetWithCurrentMode);
    }
    
    /**
     * Set game mode (timed or word count)
     * @param {string} mode - 'timed' or 'word'
     */
    function setMode(mode) {
        const isTimed = mode === 'timed';
        timeMode = isTimed;
        
        // Update state
        if (window.State) {
            State.update('typing.timeMode', isTimed);
        }
        
        // Update UI
        updateModeUI();
        
        // Reset test with new mode
        resetWithCurrentMode();
        
        // Ensure focus is set on input
        setTimeout(() => {
            const hiddenInput = document.getElementById('hidden-input');
            if (hiddenInput) hiddenInput.focus();
        }, 0);
        
        // Publish mode change event
        if (window.EventBus) {
            EventBus.publish('typing:modeChanged', { isTimeMode: isTimed });
        }
    }
    
    /**
     * Update UI based on current mode
     */
    function updateModeUI() {
        // Update button states
        if (timedModeBtn) timedModeBtn.classList.toggle('active', timeMode);
        if (wordModeBtn) wordModeBtn.classList.toggle('active', !timeMode);
        
        // Update the label based on mode
        if (timeLabel) {
            timeLabel.textContent = timeMode ? 'Time' : 'Words';
        }
    }
    
    /**
     * Set word count mode for word mode
     * @param {number} wordCount - Number of words (20, 50, 100, 200, 500, or 1000)
     */
    function setWordCountMode(wordCount) {
        // Update word count
        wordModeCount = wordCount;
        
        // Update state
        if (window.State) {
            State.update('typing.wordModeCount', wordCount);
        }
        
        // Update active state on buttons
        if (wordCountButtons && wordCountButtons.length) {
            wordCountButtons.forEach(button => {
                const btnWordCount = parseInt(button.dataset.wordCount, 10);
                button.classList.toggle('active', btnWordCount === wordCount);
            });
        }
        
        // Update word mode button text
        if (wordModeBtn) {
            wordModeBtn.textContent = `${wordCount}w`;
        }
        
        // Close the dropdown
        if (wordCountDropdown) {
            wordCountDropdown.classList.remove('show');
        }
        
        // If already in word mode, reset the test with new word count
        if (!timeMode) {
            resetWithCurrentMode();
        }
        
        // Ensure focus is set on input
        setTimeout(() => {
            const hiddenInput = document.getElementById('hidden-input');
            if (hiddenInput) hiddenInput.focus();
        }, 0);
        
        // Publish word count change event
        if (window.EventBus) {
            EventBus.publish('typing:wordCountChanged', { wordCount });
        }
    }
    
    /**
     * Reset test with current mode settings
     */
    function resetWithCurrentMode() {
        // Prevent infinite recursion
        if (isResetting) return;
        
        isResetting = true;
        
        if (window.EventBus) {
            EventBus.publish('typing:reset', { isTimeMode: timeMode, wordModeCount });
        }
        
        // Reset flag after a short delay to ensure all event handlers have completed
        setTimeout(() => {
            isResetting = false;
        }, 0);
    }
    
    /**
     * Get current mode
     * @returns {Object} - Object containing mode information
     */
    function getCurrentMode() {
        return {
            isTimeMode: timeMode,
            wordModeCount
        };
    }
    
    // Public API
    return {
        initialize,
        setMode,
        setWordCountMode,
        getCurrentMode,
        resetWithCurrentMode
    };
})();

// Export for use in other modules
window.ModeManager = ModeManager;