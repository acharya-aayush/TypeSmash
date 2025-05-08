/**
 * typing-engine.js - Core typing test controller
 * Coordinates other typing modules and manages test lifecycle
 */

const TypingEngine = (function() {
    // Private variables
    let isActive = false;
    let isDone = false;
    let restartPrompt = null;
    let statsContainer = null;
    let isResetting = false; // Flag to prevent infinite recursion
    
    /**
     * Initialize the typing engine
     * @param {Object} elements - DOM elements for typing test
     */
    function initialize(elements) {
        // Store references to DOM elements
        restartPrompt = elements.restartPrompt;
        statsContainer = elements.statsContainer;
        
        // Set up event subscriptions
        setupEventSubscriptions();
        
        // Initialize initial state in State module if available
        if (window.State) {
            const initialTypingState = {
                active: false,
                doneTyping: false,
                timeMode: true,
                timeLeft: 15,
                wordLimit: 20,
                wordModeCount: 20,
                wordCount: 0,
                words: [],
                currentWordIndex: 0,
                typedCorrectChars: 0,
                typedIncorrectChars: 0,
                totalChars: 0,
                errorCount: 0,
                startTime: 0,
                currentWordHistory: []
            };
            
            State.update('typing', initialTypingState);
        }
    }
    
    /**
     * Set up event subscriptions
     */
    function setupEventSubscriptions() {
        if (!window.EventBus) return;
        
        // Core test events
        EventBus.subscribe('typing:start', startTest);
        EventBus.subscribe('typing:complete', endTest);
        EventBus.subscribe('typing:reset', resetTest);
        
        // Mode change events
        EventBus.subscribe('typing:modeChanged', handleModeChange);
        EventBus.subscribe('typing:wordCountChanged', handleWordCountChange);
        
        // State change subscriptions
        if (window.State) {
            State.watch('typing.active', value => { isActive = value; });
            State.watch('typing.doneTyping', value => { isDone = value; });
        }
    }
    
    /**
     * Start the typing test
     */
    function startTest() {
        if (isActive) return;
        
        isActive = true;
        isDone = false;
        
        // Update state
        if (window.State) {
            State.update('typing.active', true);
            State.update('typing.doneTyping', false);
            State.update('typing.startTime', Date.now());
        }
        
        // Show stats container
        if (statsContainer) {
            statsContainer.classList.remove('hidden');
        }
        
        // Hide restart prompt if visible
        if (restartPrompt) {
            restartPrompt.classList.add('hidden');
        }
        
        // Add typing-active class to body
        document.body.classList.add('typing-active');
        
        // Publish started event
        if (window.EventBus) {
            EventBus.publish('typing:started');
        }
    }
    
    /**
     * End the typing test
     */
    function endTest() {
        // Ignore if test is not active or already ended
        if (!isActive || isDone) return;
        
        isActive = false;
        isDone = true;
        
        // Update state
        if (window.State) {
            State.update('typing.active', false);
            State.update('typing.doneTyping', true);
        }
        
        // Show restart prompt
        if (restartPrompt) {
            restartPrompt.classList.remove('hidden');
        }
        
        // Check for performance-based easter eggs
        if (window.Metrics) {
            Metrics.checkForPerformanceEasterEggs(true);
        }
        
        // Hide cursor
        if (window.TextDisplay) {
            TextDisplay.hideCursor();
        }
        
        // Save results to history
        saveResults();
        
        // Publish completed event
        if (window.EventBus) {
            EventBus.publish('typing:completed');
        }
    }
    
    /**
     * Reset the typing test
     * @param {Object} options - Reset options
     */
    function resetTest(options = {}) {
        // Prevent infinite recursion
        if (isResetting) return;
        
        isResetting = true;
        
        // Stop any active test
        if (isActive) {
            if (window.TestTimer) {
                TestTimer.stop();
            }
        }
        
        // Reset state flags
        isActive = false;
        isDone = false;
        
        // Update state
        if (window.State) {
            State.update('typing.active', false);
            State.update('typing.doneTyping', false);
        }
        
        // Hide restart prompt and stats container
        if (restartPrompt) {
            restartPrompt.classList.add('hidden');
        }
        
        if (statsContainer) {
            statsContainer.classList.add('hidden');
        }
        
        // Remove typing-active class from body
        document.body.classList.remove('typing-active');
        
        // Set words based on mode
        const isTimeMode = options?.isTimeMode ?? (window.State ? State.get('typing.timeMode') : true);
        const wordModeCount = options?.wordModeCount ?? (window.State ? State.get('typing.wordModeCount') : 20);
        
        try {
            // Generate word list
            if (window.WordProvider) {
                WordProvider.setWordList(isTimeMode, wordModeCount);
            }
            
            // Reset text display
            if (window.TextDisplay) {
                TextDisplay.reset();
            }
            
            // Reset input handler
            if (window.InputHandler) {
                InputHandler.reset();
                // Focus input
                InputHandler.focus();
            }
            
            // Reset metrics
            if (window.Metrics) {
                Metrics.reset();
            }
            
            // Reset timer
            if (window.TestTimer) {
                TestTimer.reset();
            }
            
            // Publish reset completed event
            if (window.EventBus) {
                EventBus.publish('typing:resetCompleted');
            }
        } catch (error) {
            console.error('Error during test reset:', error);
        } finally {
            // Reset flag after a short delay to ensure all event handlers have completed
            setTimeout(() => {
                isResetting = false;
            }, 0);
        }
    }
    
    /**
     * Handle mode change events
     * @param {Object} data - Mode change data
     */
    function handleModeChange(data) {
        if (!data) return;
        
        // Reset test with new mode
        resetTest({
            isTimeMode: data.isTimeMode
        });
    }
    
    /**
     * Handle word count change events
     * @param {Object} data - Word count change data
     */
    function handleWordCountChange(data) {
        if (!data) return;
        
        const isTimeMode = window.State ? State.get('typing.timeMode') : true;
        
        // Only reset if in word mode
        if (!isTimeMode) {
            resetTest({
                isTimeMode: false,
                wordModeCount: data.wordCount
            });
        }
    }
    
    /**
     * Save test results to history
     */
    function saveResults() {
        if (!window.statsModule || !window.statsModule.saveToHistory) return;
        
        // Get metrics
        const wpm = window.Metrics ? Metrics.calculateWPM() : 0;
        const accuracy = window.Metrics ? Metrics.calculateAccuracy() : 0;
        
        // Get mode information
        const isTimeMode = window.State ? State.get('typing.timeMode') : true;
        const wordModeCount = window.State ? State.get('typing.wordModeCount') : 20;
        const startTime = window.State ? State.get('typing.startTime') : 0;
        const typedCorrectChars = window.State ? State.get('typing.typedCorrectChars') : 0;
        const errorCount = window.State ? State.get('typing.errorCount') : 0;
        const actualWordCount = window.State ? State.get('typing.actualWordCount') : wordModeCount;
        
        // Calculate time display
        const timeDisplay = isTimeMode 
            ? '15s' 
            : (window.TestTimer ? TestTimer.formatTime((Date.now() - startTime) / 1000) : '0:00');
        
        // Mode identifier for history
        const modeIdentifier = isTimeMode 
            ? 'timed' 
            : `word-${wordModeCount}`;
        
        // Save to history
        window.statsModule.saveToHistory(
            wpm,
            accuracy,
            modeIdentifier,
            typedCorrectChars,
            errorCount,
            timeDisplay,
            !isTimeMode ? actualWordCount : null // Only pass actual word count for word mode
        );
    }
    
    /**
     * Get current test state
     * @returns {Object} - Current test state
     */
    function getTestState() {
        return {
            isActive,
            isDone
        };
    }
    
    // Public API
    return {
        initialize,
        startTest,
        endTest,
        resetTest,
        getTestState
    };
})();

// Export for use in other modules
window.TypingEngine = TypingEngine;