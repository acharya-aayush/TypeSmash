/**
 * metrics.js - Performance metrics for typing tests
 * Handles WPM calculation, accuracy calculation, and related metrics
 */

const Metrics = (function() {
    // Private variables
    let startTime = 0;
    let correctChars = 0;
    let incorrectChars = 0;
    let totalChars = 0;
    let errorCount = 0;
    let wordCount = 0;
    let wpmDisplay = null;
    let accuracyDisplay = null;
    let charactersDisplay = null;
    let errorsDisplay = null;
    
    /**
     * Initialize the metrics module
     * @param {Object} displayElements - Object containing display elements
     */
    function initialize(displayElements) {
        // Store reference to display elements
        wpmDisplay = displayElements.wpm;
        accuracyDisplay = displayElements.accuracy;
        charactersDisplay = displayElements.characters;
        errorsDisplay = displayElements.errors;
        
        // Subscribe to state changes
        if (window.State) {
            State.watch('typing.startTime', value => {
                startTime = value;
                updateDisplays();
            });
            
            State.watch('typing.typedCorrectChars', value => {
                correctChars = value;
                updateDisplays();
            });
            
            State.watch('typing.typedIncorrectChars', value => {
                incorrectChars = value;
                updateDisplays();
            });
            
            State.watch('typing.totalChars', value => {
                totalChars = value;
                updateDisplays();
            });
            
            State.watch('typing.errorCount', value => {
                errorCount = value;
                updateDisplays();
            });
            
            State.watch('typing.wordCount', value => {
                wordCount = value;
                updateDisplays();
            });
        }
        
        // Subscribe to events
        if (window.EventBus) {
            EventBus.subscribe('typing:metricsUpdated', updateFromEvent);
            EventBus.subscribe('typing:reset', reset);
        }
        
        // Initialize displays
        resetDisplays();
    }
    
    /**
     * Update metrics from event data
     * @param {Object} data - Event data with metrics
     */
    function updateFromEvent(data) {
        if (!data) return;
        
        if (data.typedCorrectChars !== undefined) correctChars = data.typedCorrectChars;
        if (data.typedIncorrectChars !== undefined) incorrectChars = data.typedIncorrectChars;
        if (data.totalChars !== undefined) totalChars = data.totalChars;
        if (data.errorCount !== undefined) errorCount = data.errorCount;
        if (data.wordCount !== undefined) wordCount = data.wordCount;
        
        updateDisplays();
    }
    
    /**
     * Calculate WPM (Words Per Minute)
     * @returns {number} - WPM value
     */
    function calculateWPM() {
        if (!startTime) return 0;
        
        // Get elapsed time in minutes
        const elapsedTimeInSeconds = (Date.now() - startTime) / 1000;
        const elapsedTimeInMinutes = elapsedTimeInSeconds / 60;
        
        // Avoid division by zero
        if (elapsedTimeInMinutes === 0) return 0;
        
        // Calculate WPM (5 characters = 1 word)
        const grossWPM = totalChars / 5 / elapsedTimeInMinutes || 0;
        const netWPM = Math.max(0, grossWPM - (errorCount / elapsedTimeInMinutes));
        
        return Math.round(netWPM);
    }
    
    /**
     * Calculate accuracy percentage
     * @returns {number} - Accuracy as a whole number percentage
     */
    function calculateAccuracy() {
        if (totalChars === 0) return 100;
        
        const accuracy = (correctChars / totalChars) * 100;
        return Math.round(accuracy);
    }
    
    /**
     * Calculate error rate
     * @returns {number} - Error rate percentage
     */
    function calculateErrorRate() {
        if (totalChars === 0) return 0;
        
        const errorRate = (errorCount / totalChars) * 100;
        return Math.round(errorRate);
    }
    
    /**
     * Update all metric displays
     */
    function updateDisplays() {
        if (wpmDisplay) {
            wpmDisplay.textContent = calculateWPM().toString();
        }
        
        if (accuracyDisplay) {
            accuracyDisplay.textContent = `${calculateAccuracy()}%`;
        }
        
        if (charactersDisplay) {
            charactersDisplay.textContent = correctChars.toString();
        }
        
        if (errorsDisplay) {
            errorsDisplay.textContent = errorCount.toString();
        }
    }
    
    /**
     * Reset all displays to zero
     */
    function resetDisplays() {
        if (wpmDisplay) wpmDisplay.textContent = '0';
        if (accuracyDisplay) accuracyDisplay.textContent = '0%';
        if (charactersDisplay) charactersDisplay.textContent = '0';
        if (errorsDisplay) errorsDisplay.textContent = '0';
    }
    
    /**
     * Reset all metrics
     */
    function reset() {
        startTime = 0;
        correctChars = 0;
        incorrectChars = 0;
        totalChars = 0;
        errorCount = 0;
        wordCount = 0;
        
        resetDisplays();
    }
    
    /**
     * Get all current metrics
     * @returns {Object} - Object containing all metrics
     */
    function getAllMetrics() {
        return {
            wpm: calculateWPM(),
            accuracy: calculateAccuracy(),
            errorRate: calculateErrorRate(),
            correctChars,
            incorrectChars,
            totalChars,
            errorCount,
            wordCount
        };
    }
    
    /**
     * Check for performance-based easter eggs
     * @param {boolean} isTestComplete - Whether the test is complete
     */
    function checkForPerformanceEasterEggs(isTestComplete) {
        if (!isTestComplete) return;
        
        const wpm = calculateWPM();
        const accuracy = calculateAccuracy();
        
        // Utility function for playing sound and showing notification
        const triggerEasterEgg = (soundFile, message, duration = 2000, cssClass = null) => {
            if (window.utilsModule && window.utilsModule.playSound) {
                window.utilsModule.playSound(soundFile, 1.0);
                
                if (message) {
                    // Show notification if there's a message
                    const notification = document.createElement('div');
                    notification.className = 'notification';
                    notification.textContent = message;
                    
                    document.body.appendChild(notification);
                    
                    // Trigger appearance
                    setTimeout(() => notification.classList.add('show'), 10);
                    
                    // Remove after duration
                    setTimeout(() => {
                        notification.classList.remove('show');
                        setTimeout(() => notification.remove(), 300);
                    }, duration);
                }
                
                // Add CSS class if provided
                if (cssClass) {
                    document.body.classList.add(cssClass);
                    setTimeout(() => document.body.classList.remove(cssClass), duration);
                }
            }
        };
        
        // 69 WPM or 69% accuracy - "Nice!"
        if (wpm === 69 || accuracy === 69) {
            triggerEasterEgg('sounds/nice.mp3', "Nice! 👌", 2000);
        }
        // Low WPM - Luffy laugh
        else if (wpm < 20 && totalChars > 30) {
            triggerEasterEgg('sounds/luffylaug.mp3', "Shishishi! Keep practicing! 🍖", 8000, 'luffy-laugh');
        }
        // High speed performance
        else if (wpm >= 150) {
            triggerEasterEgg('sounds/godlike.mp3', "Are you even human?! 🤖", 2000);
        }
        // Good speed performance
        else if (wpm >= 100 && wpm < 150) {
            triggerEasterEgg('sounds/impressive.mp3', "Speed demon! 🔥", 2000);
        }
        // Perfect accuracy on substantial test
        else if (accuracy === 100 && totalChars > 50) {
            triggerEasterEgg('sounds/Perfect.mp3', "Flawless Victory! ✨", 2000);
        }
        // Suspicious performance
        else if (wpm > 200 && accuracy > 98) {
            triggerEasterEgg('sounds/suspicious.mp3', "Sus... Are you a robot? 🤖", 3000);
        }
    }
    
    // Public API
    return {
        initialize,
        calculateWPM,
        calculateAccuracy,
        calculateErrorRate,
        getAllMetrics,
        checkForPerformanceEasterEggs,
        reset,
        updateDisplays
    };
})();

// Export for use in other modules
window.Metrics = Metrics;