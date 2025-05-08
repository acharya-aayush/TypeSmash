/**
 * test-timer.js - Timer functionality for typing tests
 * Handles countdown, time tracking, and time display
 */

const TestTimer = (function() {
    // Private variables
    let timer = null;
    let startTime = 0;
    let timeLeft = 15; // Default time limit
    let isTimeMode = true;
    let displayElement = null;
    
    /**
     * Initialize the timer
     * @param {HTMLElement} timeDisplay - Element to display time
     */
    function initialize(timeDisplay) {
        displayElement = timeDisplay;
        
        // Subscribe to state changes
        if (window.State) {
            State.watch('typing.timeMode', (value) => {
                isTimeMode = value;
            });
            
            State.watch('typing.wordLimit', (value) => {
                updateDisplay();
            });
            
            State.watch('typing.wordCount', (value) => {
                if (!isTimeMode) {
                    updateDisplay();
                }
            });
        }
        
        // Subscribe to events
        if (window.EventBus) {
            EventBus.subscribe('typing:start', start);
            EventBus.subscribe('typing:complete', stop);
            EventBus.subscribe('typing:reset', reset);
        }
    }
    
    /**
     * Start the timer
     */
    function start() {
        // Record start time
        startTime = Date.now();
        
        // Reset time left for timed mode
        if (isTimeMode) {
            timeLeft = 15;
            updateDisplay();
            
            // Start countdown for timed mode
            timer = setInterval(() => {
                timeLeft -= 1;
                
                // Update time display
                updateDisplay();
                
                // End test when time runs out
                if (timeLeft <= 0) {
                    // Ensure time doesn't go negative
                    timeLeft = 0;
                    updateDisplay();
                    
                    // Stop the timer immediately
                    stop();
                    
                    // End the test
                    if (window.EventBus) {
                        EventBus.publish('typing:complete');
                    }
                }
            }, 1000);
        }
        
        // Update state
        if (window.State) {
            State.update('typing.startTime', startTime);
        }
    }
    
    /**
     * Stop the timer
     */
    function stop() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }
    
    /**
     * Reset the timer
     */
    function reset() {
        // Stop any existing timer
        stop();
        
        // Reset time values
        timeLeft = 15;
        startTime = 0;
        
        // Update display
        updateDisplay();
        
        // Update state
        if (window.State) {
            State.update('typing.timeLeft', timeLeft);
            State.update('typing.startTime', startTime);
        }
    }
    
    /**
     * Update time display
     */
    function updateDisplay() {
        if (!displayElement) return;
        
        if (isTimeMode) {
            // Show time left for timed mode
            displayElement.textContent = `${timeLeft}s`;
        } else {
            // Show word count for word mode
            const wordCount = window.State ? State.get('typing.wordCount') : 0;
            const wordLimit = window.State ? State.get('typing.wordLimit') : 20;
            displayElement.textContent = `${wordCount}/${wordLimit}`;
        }
    }
    
    /**
     * Get elapsed time in seconds
     * @returns {number} - Time elapsed in seconds
     */
    function getElapsedTime() {
        if (startTime === 0) return 0;
        return (Date.now() - startTime) / 1000;
    }
    
    /**
     * Get elapsed time in minutes
     * @returns {number} - Time elapsed in minutes
     */
    function getElapsedTimeInMinutes() {
        return getElapsedTime() / 60;
    }
    
    /**
     * Format time in seconds to mm:ss format
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time string
     */
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // Public API
    return {
        initialize,
        start,
        stop,
        reset,
        getElapsedTime,
        getElapsedTimeInMinutes,
        formatTime
    };
})();

// Export for use in other modules
window.TestTimer = TestTimer;