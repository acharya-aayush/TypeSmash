/**
 * state.js - Centralized state management for TypeSmash
 * Provides a reactive state system with change notifications
 */

const State = (function() {
    // Default state
    const initialState = {
        // Typing test state
        typing: {
            active: false,
            timeMode: true,
            timeLeft: 15,
            wordCount: 0,
            wordLimit: 20, // Default to 20 words
            actualWordCount: 20, // Store actual word count for passages
            currentWordIndex: 0,
            currentLineIndex: 0,
            words: [],
            wordsPerLine: 14,
            typedCorrectChars: 0,
            typedIncorrectChars: 0,
            totalChars: 0,
            errorCount: 0,
            startTime: 0,
            doneTyping: false,
            wordModeCount: 20, // Default word count selection
            currentWordHistory: [] // Track history for current test
        },
        
        // Zoro mode state
        zoro: {
            active: false,
            gameActive: false,
            level: 1,
            score: 0,
            combo: 0,
            maxCombo: 0,
            lives: 3,
            lastSuccessTime: 0,
            hakiActive: false,
            ashuraActive: false,
            onigiriActive: false,
            difficultyTier: 'East Blue',
            gameSpeed: 1500, // ms between word spawns
            wordSpeed: 0.8, // pixels per frame
            words: []
        },
        
        // UI state
        ui: {
            darkMode: false,
            statsVisible: false,
            activeFilter: 'all',
            activeViewType: 'bar',
            wordCountDropdownVisible: false
        }
    };
    
    // Current state - clone of initial state
    let state = JSON.parse(JSON.stringify(initialState));
    
    /**
     * Get a value from state using dot notation path
     * @param {string} path - Path to state value (e.g. 'typing.active')
     * @return {*} - Value at path
     */
    function get(path) {
        if (!path) return JSON.parse(JSON.stringify(state)); // Return clone of entire state
        
        const keys = path.split('.');
        let value = state;
        
        for (const key of keys) {
            if (value === undefined || value === null) return undefined;
            value = value[key];
        }
        
        // Return clone of object/array to prevent direct mutation
        if (typeof value === 'object' && value !== null) {
            return JSON.parse(JSON.stringify(value));
        }
        
        return value;
    }
    
    /**
     * Update state at path and notify subscribers
     * @param {string} path - Path to state value
     * @param {*} value - New value
     */
    function update(path, value) {
        const keys = path.split('.');
        let target = state;
        
        // Navigate to parent object
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (target[key] === undefined) {
                target[key] = {};
            }
            target = target[key];
        }
        
        // Get final key
        const finalKey = keys[keys.length - 1];
        
        // Update value
        target[finalKey] = value;
        
        // Notify subscribers
        if (window.EventBus) {
            window.EventBus.publish('state:change', { path, value });
            window.EventBus.publish(`state:change:${path}`, value);
        }
    }
    
    /**
     * Reset state to initial values
     * @param {string} [section] - Optional section to reset (e.g. 'typing', 'zoro')
     */
    function reset(section) {
        if (section) {
            if (initialState[section]) {
                state[section] = JSON.parse(JSON.stringify(initialState[section]));
                
                // Notify subscribers
                if (window.EventBus) {
                    window.EventBus.publish('state:reset', { section });
                    window.EventBus.publish(`state:reset:${section}`, state[section]);
                }
            }
        } else {
            // Reset entire state
            state = JSON.parse(JSON.stringify(initialState));
            
            // Notify subscribers
            if (window.EventBus) {
                window.EventBus.publish('state:reset', null);
            }
        }
    }
    
    /**
     * Watch for changes to a specific path
     * @param {string} path - Path to watch
     * @param {Function} callback - Function to call when value changes
     * @return {Function} - Unsubscribe function
     */
    function watch(path, callback) {
        if (window.EventBus) {
            return window.EventBus.subscribe(`state:change:${path}`, callback);
        }
        return () => {}; // No-op if EventBus not available
    }
    
    // Public API
    return {
        get,
        update,
        reset,
        watch
    };
})();

// Export for use in other modules
window.State = State;