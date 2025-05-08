// Main.js - Refactored to use modular architecture

// Initialize all modules and connect them together
document.addEventListener('DOMContentLoaded', function() {
    init();
});

/**
 * Initialize the application
 */
function init() {
    // Set app title to TypeSmash
    document.title = "TypeSmash - Typing Test";
    
    // Collect DOM elements for module initialization
    const elements = {
        logo: document.getElementById('logo'),
        timedModeBtn: document.getElementById('timed-mode'),
        wordModeBtn: document.getElementById('word-mode'),
        wordCountButtons: document.querySelectorAll('.word-count-btn'),
        wordCountDropdown: document.querySelector('.word-count-dropdown'),
        statsToggleBtn: document.getElementById('stats-toggle'),
        textDisplay: document.getElementById('text-display'),
        hiddenInput: document.getElementById('hidden-input'),
        cursor: document.getElementById('cursor'),
        wpmDisplay: document.getElementById('wpm'),
        accuracyDisplay: document.getElementById('accuracy'),
        charactersDisplay: document.getElementById('characters'),
        errorsDisplay: document.getElementById('errors'),
        timeDisplay: document.getElementById('time'),
        timeLabel: document.getElementById('time-label'),
        statsContainer: document.getElementById('stats-container'),
        statsSection: document.getElementById('stats-section'),
        closeStatsBtn: document.getElementById('close-stats'),
        clearHistoryBtn: document.getElementById('clear-history'),
        restartPrompt: document.getElementById('restart-prompt'),
        filterButtons: {
            all: document.getElementById('filter-all'),
            timed: document.getElementById('filter-timed'),
            'word-20': document.getElementById('filter-word-20'),
            'word-50': document.getElementById('filter-word-50'),
            'word-100': document.getElementById('filter-word-100'),
            'word-200': document.getElementById('filter-word-200'),
            'word-500': document.getElementById('filter-word-500'),
            'word-1000': document.getElementById('filter-word-1000'),
            zoro: document.getElementById('filter-zoro')
        },
        viewButtons: {
            bar: document.getElementById('view-bar'),
            line: document.getElementById('view-line')
        },
        historyTable: document.getElementById('history-table'),
        historyTableBody: document.querySelector('#history-table tbody'),
        wpmGraph: document.getElementById('wpm-graph')
    };
    
    // Update logo text if it exists
    if (elements.logo && elements.logo.textContent.includes("TypeTest")) {
        elements.logo.textContent = elements.logo.textContent.replace("TypeTest", "TypeSmash");
    }
    
    // Initialize typing modules
    initializeTypingModules(elements);
    
    // Initialize other UI event handlers and features
    initializeUIHandlers(elements);
    
    // Set up Zoro Mode trigger
    setUpZoroTrigger(elements.logo);
    
    // Initialize Zoro Mode if available
    if (window.zoroModule && window.zoroModule.init) {
        window.zoroModule.init();
    }
    
    // Initialize and load stats if available
    if (window.statsModule && window.statsModule.init) {
        window.statsModule.init();
    }
    
    // Ensure words collection is loaded
    if (window.utilsModule && window.utilsModule.loadWordsCollection) {
        window.utilsModule.loadWordsCollection();
    }
    
    // Focus the input for immediate typing
    elements.hiddenInput.focus();
}

/**
 * Initialize all typing-related modules
 * @param {Object} elements - DOM elements
 */
function initializeTypingModules(elements) {
    // Initialize text display
    if (window.TextDisplay) {
        TextDisplay.initialize(elements.textDisplay, elements.cursor);
    }
    
    // Initialize cursor
    if (window.Cursor) {
        Cursor.initialize(elements.cursor);
    }
    
    // Initialize input handler
    if (window.InputHandler) {
        InputHandler.initialize(elements.hiddenInput);
    }
    
    // Initialize timer
    if (window.TestTimer) {
        TestTimer.initialize(elements.timeDisplay);
    }
    
    // Initialize metrics
    if (window.Metrics) {
        Metrics.initialize({
            wpm: elements.wpmDisplay,
            accuracy: elements.accuracyDisplay,
            characters: elements.charactersDisplay,
            errors: elements.errorsDisplay
        });
    }
    
    // Initialize mode manager
    if (window.ModeManager) {
        ModeManager.initialize({
            timedModeBtn: elements.timedModeBtn,
            wordModeBtn: elements.wordModeBtn,
            wordCountButtons: elements.wordCountButtons,
            wordCountDropdown: elements.wordCountDropdown,
            timeLabel: elements.timeLabel
        });
    }
    
    // Initialize typing engine last (coordinates all other modules)
    if (window.TypingEngine) {
        TypingEngine.initialize({
            restartPrompt: elements.restartPrompt,
            statsContainer: elements.statsContainer
        });
    }
    
    // Reset test to prepare for first use
    if (window.TypingEngine) {
        TypingEngine.resetTest();
    }
}

/**
 * Initialize UI event handlers
 * @param {Object} elements - DOM elements
 */
function initializeUIHandlers(elements) {
    // Stats toggle
    if (elements.statsToggleBtn && elements.closeStatsBtn) {
        const toggleStats = function() {
            elements.statsSection.classList.toggle('hidden');
        };
        
        elements.statsToggleBtn.addEventListener('click', toggleStats);
        elements.closeStatsBtn.addEventListener('click', toggleStats);
    }
    
    // Clear history confirmation
    if (elements.clearHistoryBtn) {
        elements.clearHistoryBtn.addEventListener('click', confirmClearHistory);
    }
    
    // Filter buttons for stats
    for (const key in elements.filterButtons) {
        if (elements.filterButtons[key]) {
            elements.filterButtons[key].addEventListener('click', () => {
                setActiveFilter(key);
            });
        }
    }
    
    // View buttons for stats
    for (const key in elements.viewButtons) {
        if (elements.viewButtons[key]) {
            elements.viewButtons[key].addEventListener('click', () => {
                setActiveView(key);
            });
        }
    }
    
    // Key events (Tab for restart)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            
            // Reset test via event system
            if (window.EventBus) {
                EventBus.publish('typing:reset');
            }
        }
    });
}

/**
 * Set up Zoro Mode trigger (logo clicks)
 * @param {HTMLElement} logoElement - Logo element
 */
function setUpZoroTrigger(logoElement) {
    if (!logoElement) return;
    
    let logoClickCount = 0;
    let logoClickTimer = null;
    
    logoElement.addEventListener('click', () => {
        logoClickCount++;
        
        // Clear existing timer
        if (logoClickTimer) {
            clearTimeout(logoClickTimer);
        }
        
        // Reset click count after 3 seconds
        logoClickTimer = setTimeout(() => {
            logoClickCount = 0;
        }, 3000);
        
        // Check for Zoro Mode activation (3 clicks within 3 seconds)
        if (logoClickCount >= 3) {
            logoClickCount = 0;
            clearTimeout(logoClickTimer);
            
            // Activate Zoro Mode
            if (window.zoroModule && window.zoroModule.activate) {
                window.zoroModule.activate();
            }
        }
    });
}

/**
 * Confirm clearing history
 */
function confirmClearHistory() {
    const confirmation = confirm("Are you sure you want to clear your typing history? This can't be undone!");
    
    if (confirmation && window.statsModule && window.statsModule.clearHistory) {
        window.statsModule.clearHistory();
    }
}

/**
 * Set active statistics filter
 * @param {string} filter - Filter name
 */
function setActiveFilter(filter) {
    if (window.statsModule && window.statsModule.setActiveFilter) {
        window.statsModule.setActiveFilter(filter);
    }
}

/**
 * Set active chart view
 * @param {string} view - View type (bar or line)
 */
function setActiveView(view) {
    if (window.statsModule && window.statsModule.setActiveView) {
        window.statsModule.setActiveView(view);
    }
}