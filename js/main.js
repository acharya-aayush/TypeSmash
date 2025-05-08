// Main.js - The Mikasa of this app (does all the heavy lifting)

// Game state - gotta track everything like Shikamaru planning a battle
const typingGame = {
    active: false,
    timeMode: true, // Default to timed mode like a true speedrunner
    timeLeft: 15, // 15 seconds for timed mode (time flies like Minato)
    wordLimit: 20, // Default to 20 words for word mode
    wordCount: 0,
    words: [],
    currentWordIndex: 0,
    wordsDisplayed: 3, // Number of words to display at once - fixed at exactly 3
    wordsPerLine: 14, // Words per line so it displays basically how many words fit in the screen
    currentLineIndex: 0, // Track which line we're on like tracking Titans on the battlefield
    typedCorrectChars: 0,
    typedIncorrectChars: 0,
    totalChars: 0,
    errorCount: 0,
    startTime: 0,
    timer: null,
    doneTyping: false,
    logoClickCount: 0,
    logoClickTimer: null,
    
    // Word history for current session (better than Nico Robin's history knowledge tbh)
    currentWordHistory: [],
    
    // New property to track the current word mode
    wordModeCount: 20, // Default to 20 words
};

// DOM elements - gotta grab everything like Luffy stealing meat
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

// Set up global access for modules - make everything available like the One Piece
window.typingGame = {
    elements,
    state: typingGame
};

// Initialize all modules directly to avoid timing issues
document.addEventListener('DOMContentLoaded', function() {
    init();
});

/**
 * Initialize the game - like Kakashi saying "begin"
 */
function init() {
    // Set app title to TypeSmash
    document.title = "TypeSmash - Typing Test";
    
    // Update logo text if it exists
    if (elements.logo && elements.logo.textContent.includes("TypeTest")) {
        elements.logo.textContent = elements.logo.textContent.replace("TypeTest", "TypeSmash");
    }
    
    // Set up event listeners
    elements.timedModeBtn.addEventListener('click', () => setMode('timed'));
    elements.wordModeBtn.addEventListener('click', () => setMode('word'));
    elements.statsToggleBtn.addEventListener('click', toggleStats);
    elements.closeStatsBtn.addEventListener('click', toggleStats);
    elements.clearHistoryBtn.addEventListener('click', confirmClearHistory);
    
    // Word count selection buttons
    elements.wordCountButtons.forEach(button => {
        button.addEventListener('click', () => {
            const wordCount = parseInt(button.dataset.wordCount, 10);
            if (!isNaN(wordCount)) {
                setWordCountMode(wordCount);
            }
        });
    });
    
    // Show/hide word count dropdown when word mode is clicked
    elements.wordModeBtn.addEventListener('click', () => {
        elements.wordCountDropdown.classList.toggle('show');
    });
    
    // Hide dropdown when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.word-mode-container')) {
            elements.wordCountDropdown.classList.remove('show');
        }
    });
    
    // Filter buttons
    for (const key in elements.filterButtons) {
        if (elements.filterButtons[key]) {
            elements.filterButtons[key].addEventListener('click', () => {
                setActiveFilter(key);
            });
        }
    }
    
    // View buttons
    for (const key in elements.viewButtons) {
        if (elements.viewButtons[key]) {
            elements.viewButtons[key].addEventListener('click', () => {
                setActiveView(key);
            });
        }
    }
    
    // Input handling
    elements.hiddenInput.addEventListener('input', handleTyping);
    elements.hiddenInput.addEventListener('blur', () => {
        // Refocus input when it loses focus
        if (!typingGame.doneTyping && !document.querySelector('#zoro-container:not(.hidden)')) {
            setTimeout(() => elements.hiddenInput.focus(), 0);
        }
    });
    
    // Key events (Tab for restart)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            resetTest();
        }
    });
    
    // Set up logo clicks for Zoro Mode
    setUpZoroTrigger();
    
    // Initialize Zoro Mode
    if (window.zoroModule && window.zoroModule.init) {
        window.zoroModule.init();
    }
    
    // Initialize and load stats
    if (window.statsModule && window.statsModule.init) {
        window.statsModule.init();
    }
    
    // Set the initial label based on current mode
    const timeLabel = document.getElementById('time-label');
    if (timeLabel) {
        timeLabel.textContent = typingGame.timeMode ? 'Time' : 'Words';
    }
    
    // Ensure words collection is loaded
    if (window.utilsModule && window.utilsModule.loadWordsCollection) {
        window.utilsModule.loadWordsCollection();
    }
    
    // Start with the default mode
    resetTest();
    
    // Focus the input for immediate typing
    elements.hiddenInput.focus();
}

/**
 * Set word count mode for word mode
 * @param {number} wordCount - Number of words (20, 50, 100, 200, 500, or 1000)
 */
function setWordCountMode(wordCount) {
    // Update word count
    typingGame.wordLimit = wordCount;
    typingGame.wordModeCount = wordCount;
    
    // Update active state on buttons
    elements.wordCountButtons.forEach(button => {
        const btnWordCount = parseInt(button.dataset.wordCount, 10);
        button.classList.toggle('active', btnWordCount === wordCount);
    });
    
    // Update word mode button text
    elements.wordModeBtn.textContent = `${wordCount}w`;
    
    // Close the dropdown
    elements.wordCountDropdown.classList.remove('show');
    
    // If already in word mode, reset the test with new word count
    if (!typingGame.timeMode) {
        resetTest();
    }
    
    // Ensure focus is set on input
    setTimeout(() => elements.hiddenInput.focus(), 0);
}

/**
 * Set game mode (timed or word count) - pick your poison
 * @param {string} mode - 'timed' or 'word'
 */
function setMode(mode) {
    const isTimed = mode === 'timed';
    typingGame.timeMode = isTimed;
    
    // Update UI
    elements.timedModeBtn.classList.toggle('active', isTimed);
    elements.wordModeBtn.classList.toggle('active', !isTimed);
    
    // Update the label based on mode
    const timeLabel = document.getElementById('time-label');
    if (timeLabel) {
        timeLabel.textContent = isTimed ? 'Time' : 'Words';
    }
    
    // Reset test with new mode
    resetTest();
    
    // Ensure focus is set on input
    setTimeout(() => elements.hiddenInput.focus(), 0);
}

/**
 * Reset typing test to start a new one - like getting a senzu bean
 */
function resetTest() {
    // Cancel existing timer
    if (typingGame.timer) {
        clearInterval(typingGame.timer);
        typingGame.timer = null;
    }
    
    // Reset state
    typingGame.active = false;
    typingGame.timeLeft = 15;
    typingGame.wordCount = 0;
    typingGame.words = [];
    typingGame.currentWordIndex = 0;
    typingGame.typedCorrectChars = 0;
    typingGame.typedIncorrectChars = 0;
    typingGame.totalChars = 0;
    typingGame.errorCount = 0;
    typingGame.doneTyping = false;
    typingGame.currentWordHistory = [];
    
    // Prepare words based on mode
    if (typingGame.timeMode) {
        // For timed mode, still use random single words
        generateWords(100);
    } else {
        // For word mode, use passage-based approach
        loadPassageWords(typingGame.wordModeCount);
    }
    
    // Reset UI
    updateWordDisplay();
    
    // Hide the stats container
    elements.statsContainer.classList.add('hidden');
    
    // Hide restart prompt
    elements.restartPrompt.classList.add('hidden');
    
    // Clear input
    elements.hiddenInput.value = '';
    
    // Reset stats display
    elements.wpmDisplay.textContent = '0';
    elements.accuracyDisplay.textContent = '0%';
    elements.charactersDisplay.textContent = '0';
    elements.errorsDisplay.textContent = '0';
    elements.timeDisplay.textContent = typingGame.timeMode ? '15s' : '0/' + typingGame.wordLimit;
    
    // Remove typing-active class to show social icons again
    document.body.classList.remove('typing-active');
    
    // Focus input
    elements.hiddenInput.focus();
}

/**
 * Generate random words for the test - RNG gods be with us
 * @param {number} count - How many words to generate
 */
function generateWords(count) {
    typingGame.words = [];
    for (let i = 0; i < count; i++) {
        typingGame.words.push(getRandomWord());
    }
}

/**
 * Load words from a text passage based on word count
 * @param {number} wordCount - Nominal word count
 */
function loadPassageWords(wordCount) {
    if (window.utilsModule && window.utilsModule.getRandomPassage) {
        // Get a passage and its actual word count
        const { text, actualWordCount } = window.utilsModule.getRandomPassage(wordCount);
        
        // Update actual word count in game state
        typingGame.actualWordCount = actualWordCount;
        
        // Split the passage into words
        typingGame.words = text.trim().split(/\s+/).filter(word => word.length > 0);
        
        // Update word limit to actual count
        typingGame.wordLimit = actualWordCount;
    } else {
        // Fall back to random words if utility function is not available
        generateWords(wordCount);
        typingGame.actualWordCount = wordCount;
    }
}

/**
 * Update the word display to show current words with line-based scrolling
 */
function updateWordDisplay() {
    // Clear the text display
    elements.textDisplay.innerHTML = '';
    
    // Create 3 lines
    const numLines = 3;
    const wordsPerLine = typingGame.wordsPerLine; // Use the configurable value
    
    // Calculate which line the current word is on
    typingGame.currentLineIndex = Math.floor(typingGame.currentWordIndex / wordsPerLine);
    
    // Display 3 lines, starting from the current line
    for (let lineOffset = 0; lineOffset < numLines; lineOffset++) {
        const lineIndex = typingGame.currentLineIndex + lineOffset;
        
        // Create a line div
        const lineDiv = document.createElement('div');
        lineDiv.className = 'line';
        
        // Apply appropriate styling based on line position
        if (lineOffset === 0) {
            lineDiv.classList.add('active');
        } else if (lineOffset === 1) {
            lineDiv.classList.add('next');
        } else {
            lineDiv.classList.add('future');
        }
        
        // Calculate the starting word index for this line
        const lineStartWordIndex = lineIndex * wordsPerLine;
        
        // Add words to this line
        for (let wordInLine = 0; wordInLine < wordsPerLine; wordInLine++) {
            const wordIndex = lineStartWordIndex + wordInLine;
            
            if (wordIndex < typingGame.words.length) {
                const wordDiv = document.createElement('div');
                wordDiv.className = 'word';
                
                // Mark the current word
                if (wordIndex === typingGame.currentWordIndex) {
                    wordDiv.classList.add('current');
                } else if (wordIndex < typingGame.currentWordIndex) {
                    wordDiv.classList.add('completed');
                }
                
                // Create spans for each character
                const word = typingGame.words[wordIndex];
                for (let j = 0; j < word.length; j++) {
                    const charSpan = document.createElement('span');
                    charSpan.className = 'char';
                    
                    // For completed words, mark all characters as correct
                    if (wordIndex < typingGame.currentWordIndex) {
                        charSpan.classList.add('correct');
                    }
                    
                    charSpan.textContent = word[j];
                    wordDiv.appendChild(charSpan);
                }
                
                // Add a space after each word (except the last one in a line)
                if (wordInLine < wordsPerLine - 1 && wordIndex < typingGame.words.length - 1) {
                    const spaceSpan = document.createElement('span');
                    spaceSpan.className = 'space';
                    spaceSpan.textContent = ' ';
                    wordDiv.appendChild(spaceSpan);
                }
                
                lineDiv.appendChild(wordDiv);
            }
        }
        
        elements.textDisplay.appendChild(lineDiv);
    }
    
    // Update cursor position
    updateCursorPosition();
}

/**
 * Start the typing test
 */
function startTest() {
    if (typingGame.active) return;
    
    typingGame.active = true;
    typingGame.startTime = Date.now();
    elements.statsContainer.classList.remove('hidden');
    
    // Start timer for timed mode
    if (typingGame.timeMode) {
        // Ensure timeLeft is correct at start
        typingGame.timeLeft = 15;
        elements.timeDisplay.textContent = `${typingGame.timeLeft}s`;
        
        typingGame.timer = setInterval(() => {
            typingGame.timeLeft -= 1;
            
            // Update time display
            elements.timeDisplay.textContent = `${typingGame.timeLeft}s`;
            
            // End test when time runs out
            if (typingGame.timeLeft <= 0) {
                // Ensure time doesn't go negative
                typingGame.timeLeft = 0;
                elements.timeDisplay.textContent = '0s';
                
                // Stop the timer immediately to prevent any more ticks
                clearInterval(typingGame.timer);
                typingGame.timer = null;
                
                // End the test
                endTest();
            }
        }, 1000);
    } else {
        // For word mode, initialize the display
        elements.timeDisplay.textContent = `0/${typingGame.wordLimit}`;
    }
}

/**
 * End the typing test - GAME OVER like when Ace died (still not over it tbh)
 */
function endTest() {
    // Ignore if test is not active or already ended
    if (!typingGame.active || typingGame.doneTyping) return;
    
    // Stop timer
    if (typingGame.timer) {
        clearInterval(typingGame.timer);
        typingGame.timer = null;
    }
    
    // Calculate final stats
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();
    
    // Update displays
    elements.wpmDisplay.textContent = wpm;
    elements.accuracyDisplay.textContent = `${accuracy}%`;
    elements.charactersDisplay.textContent = typingGame.typedCorrectChars;
    elements.errorsDisplay.textContent = typingGame.errorCount;
    
    // Set the final time display correctly
    if (typingGame.timeMode) {
        elements.timeDisplay.textContent = '0s'; // Time is up
    } else {
        elements.timeDisplay.textContent = `${typingGame.wordLimit}/${typingGame.wordLimit}`; // All words completed
    }
    
    // Mark test as completed
    typingGame.active = false;
    typingGame.doneTyping = true;
    
    // Show restart prompt
    elements.restartPrompt.classList.remove('hidden');
    
    // Save results to history
    if (window.statsModule && window.statsModule.saveToHistory) {
        const timeDisplay = typingGame.timeMode 
            ? '15s' 
            : formatTime((Date.now() - typingGame.startTime) / 1000);
            
        // Modified mode identifier to include word count for word mode
        const modeIdentifier = typingGame.timeMode 
            ? 'timed' 
            : `word-${typingGame.wordModeCount}`;
            
        window.statsModule.saveToHistory(
            wpm,
            accuracy,
            modeIdentifier,
            typingGame.typedCorrectChars,
            typingGame.errorCount,
            timeDisplay,
            !typingGame.timeMode ? typingGame.actualWordCount : null // Only pass actual word count for word mode
        );
    }
    
    // Hide cursor
    elements.cursor.style.display = 'none';
}

/**
 * Handle typing input
 * @param {Event} e - Input event
 */
function handleTyping(e) {
    // Only start test if it's not active AND not done typing
    if (!typingGame.active && !typingGame.doneTyping) {
        startTest();
        // Add typing-active class to body when typing starts
        document.body.classList.add('typing-active');
    }
    
    // Ignore if test is complete
    if (typingGame.doneTyping) return;
    
    // Get current input
    const currentInput = elements.hiddenInput.value;
    
    // Get current word
    const currentWord = typingGame.words[typingGame.currentWordIndex];
    
    // Update character highlighting in the displayed word
    updateCharHighlighting(currentInput, currentWord);
    
    // Check for space to go to next word
    if (e.inputType === 'insertText' && e.data === ' ') {
        // Process completed word (without the space)
        const typedWord = currentInput.trim();
        processCompletedWord(typedWord);
        
        // Clear input for next word
        elements.hiddenInput.value = '';
        
        // Update display
        updateWordDisplay();
    }
    
    // Update cursor position
    updateCursorPosition();
}

// Add a keydown event listener to handle spaces
document.addEventListener('DOMContentLoaded', function() {
    // ...existing init code will run...
    
    // Add keydown handler for spaces
    elements.hiddenInput.addEventListener('keydown', function(e) {
        if (e.code === 'Space' && typingGame.active && !typingGame.doneTyping) {
            e.preventDefault(); // Prevent default space behavior
            
            // Get current input without the space
            const typedWord = elements.hiddenInput.value.trim();
            
            // Process the word
            processCompletedWord(typedWord);
            
            // Clear input for next word
            elements.hiddenInput.value = '';
            
            // Update display
            updateWordDisplay();
        }
    });
});

/**
 * Update character highlighting in the displayed word
 * @param {string} input - Current user input
 * @param {string} word - Target word to type
 */
function updateCharHighlighting(input, word) {
    // Get all characters of the current word
    const wordElement = elements.textDisplay.querySelector('.word.current');
    if (!wordElement) return;
    
    const charElements = wordElement.querySelectorAll('.char');
    
    // Remove all classes first
    charElements.forEach(charEl => {
        charEl.className = 'char';
    });
    
    // Check each character
    for (let i = 0; i < input.length; i++) {
        if (i < charElements.length) {
            if (i < word.length) {
                if (input[i] === word[i]) {
                    charElements[i].classList.add('correct');
                } else {
                    charElements[i].classList.add('incorrect');
                }
            } else {
                // Extra characters
                charElements[i].classList.add('incorrect');
            }
        }
    }
}

/**
 * Process a completed word
 * @param {string} typedWord - Word typed by user
 */
function processCompletedWord(typedWord) {
    // Get correct word
    const correctWord = typingGame.words[typingGame.currentWordIndex];
    
    // Save word history
    typingGame.currentWordHistory.push({
        typed: typedWord,
        target: correctWord,
        correct: typedWord === correctWord
    });
    
    // Calculate characters and errors
    for (let i = 0; i < Math.max(typedWord.length, correctWord.length); i++) {
        typingGame.totalChars++;
        
        if (i < typedWord.length && i < correctWord.length) {
            if (typedWord[i] === correctWord[i]) {
                typingGame.typedCorrectChars++;
            } else {
                typingGame.typedIncorrectChars++;
                typingGame.errorCount++;
            }
        } else if (i >= typedWord.length && i < correctWord.length) {
            // Missing characters
            typingGame.typedIncorrectChars++;
            typingGame.errorCount++;
        } else if (i >= correctWord.length && i < typedWord.length) {
            // Extra characters
            typingGame.typedIncorrectChars++;
            typingGame.errorCount++;
        }
    }
    
    // Update live stats
    updateLiveStats();
    
    // Calculate current line before updating
    const currentLineBefore = Math.floor(typingGame.currentWordIndex / typingGame.wordsPerLine);
    
    // Move to next word
    typingGame.currentWordIndex++;
    typingGame.wordCount++;
    
    // Calculate current line after updating
    const currentLineAfter = Math.floor(typingGame.currentWordIndex / typingGame.wordsPerLine);
    
    // Check if we've reached the word limit in word mode
    if (!typingGame.timeMode && typingGame.wordCount >= typingGame.wordLimit) {
        endTest();
        return;
    }
    
    // Only update display if we've moved to a new line or it's the first/last word
    if (currentLineAfter !== currentLineBefore || 
        typingGame.currentWordIndex === 1 || 
        typingGame.currentWordIndex >= typingGame.words.length - 3) {
        updateWordDisplay();
    } else {
        // Just update current word highlighting
        const currentWordElem = elements.textDisplay.querySelector('.word.current');
        if (currentWordElem) {
            currentWordElem.classList.remove('current');
        }
        
        // Find the new current word and highlight it
        const wordElements = elements.textDisplay.querySelectorAll('.word');
        const wordIndexInView = typingGame.currentWordIndex % (typingGame.wordsPerLine * 3);
        
        if (wordElements[wordIndexInView]) {
            wordElements[wordIndexInView].classList.add('current');
            
            // Mark previous word as completed
            if (wordIndexInView > 0 && wordElements[wordIndexInView - 1]) {
                wordElements[wordIndexInView - 1].classList.add('completed');
                
                // Mark all characters in the previous word as correct
                const prevChars = wordElements[wordIndexInView - 1].querySelectorAll('.char');
                prevChars.forEach(char => {
                    char.classList.add('correct');
                });
            }
        }
    }
    
    // Update cursor position
    updateCursorPosition();
}

/**
 * Update real-time stats
 */
function updateLiveStats() {
    // Calculate WPM and accuracy
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();
    
    // Update displays
    elements.wpmDisplay.textContent = wpm;
    elements.accuracyDisplay.textContent = `${accuracy}%`;
    elements.charactersDisplay.textContent = typingGame.typedCorrectChars;
    elements.errorsDisplay.textContent = typingGame.errorCount;
    
    if (!typingGame.timeMode) {
        // Update word count for word mode
        elements.timeDisplay.textContent = `${typingGame.wordCount}/${typingGame.wordLimit}`;
    }
}

/**
 * Calculate WPM (Words Per Minute)
 * @returns {number} - WPM value
 */
function calculateWPM() {
    // Get elapsed time in minutes
    const elapsedTimeInSeconds = (Date.now() - typingGame.startTime) / 1000;
    const elapsedTimeInMinutes = elapsedTimeInSeconds / 60;
    
    // Calculate WPM (5 characters = 1 word)
    const grossWPM = typingGame.totalChars / 5 / elapsedTimeInMinutes || 0;
    const netWPM = Math.max(0, grossWPM - (typingGame.errorCount / elapsedTimeInMinutes));
    
    return Math.round(netWPM);
}

/**
 * Calculate accuracy percentage
 * @returns {number} - Accuracy as a whole number percentage
 */
function calculateAccuracy() {
    if (typingGame.totalChars === 0) return 100;
    
    const accuracy = (typingGame.typedCorrectChars / typingGame.totalChars) * 100;
    return Math.round(accuracy);
}

/**
 * Update cursor position based on current input
 */
function updateCursorPosition() {
    // Get current input length
    const inputLength = elements.hiddenInput.value.length;
    
    // Get current word
    const wordElement = elements.textDisplay.querySelector('.word.current');
    if (!wordElement) return;
    
    // Calculate cursor position
    if (inputLength === 0) {
        // At the start of the word
        elements.cursor.style.left = `${wordElement.offsetLeft}px`;
        elements.cursor.style.top = `${wordElement.offsetTop}px`;
    } else if (inputLength <= wordElement.children.length) {
        // Within the word
        const charElement = wordElement.children[inputLength - 1];
        elements.cursor.style.left = `${charElement.offsetLeft + charElement.offsetWidth}px`;
        elements.cursor.style.top = `${charElement.offsetTop}px`;
    } else {
        // Beyond the word
        const lastChar = wordElement.children[wordElement.children.length - 1];
        elements.cursor.style.left = `${lastChar.offsetLeft + lastChar.offsetWidth + 
            (inputLength - wordElement.children.length) * 10}px`;
        elements.cursor.style.top = `${lastChar.offsetTop}px`;
    }
    
    // Show cursor when typing
    elements.cursor.style.display = 'block';
}

/**
 * Show/hide the stats overlay
 */
function toggleStats() {
    elements.statsSection.classList.toggle('hidden');
    
    // Update stats display when showing
    if (!elements.statsSection.classList.contains('hidden')) {
        if (window.statsModule && window.statsModule.updateStats) {
            window.statsModule.updateStats();
        }
    }
}

/**
 * Set active filter for stats display
 * @param {string} filter - Filter type ('all', 'timed', 'word')
 */
function setActiveFilter(filter) {
    // Update button state
    for (const key in elements.filterButtons) {
        elements.filterButtons[key].classList.toggle('active', key === filter);
    }
    
    // Update stats with filter
    if (window.statsModule && window.statsModule.updateStats) {
        window.statsModule.updateStats(filter);
    }
}

/**
 * Set active view for stats display
 * @param {string} view - View type ('bar', 'line')
 */
function setActiveView(view) {
    // Update button state
    for (const key in elements.viewButtons) {
        elements.viewButtons[key].classList.toggle('active', key === view);
    }
    
    // Update stats with view
    if (window.statsModule && window.statsModule.updateStats) {
        window.statsModule.updateStats(null, view);
    }
}

/**
 * Confirm before clearing history
 */
function confirmClearHistory() {
    if (confirm('Are you sure you want to clear all typing history?')) {
        if (window.statsModule && window.statsModule.clearHistory) {
            window.statsModule.clearHistory();
        }
    }
}

/**
 * Set up triple-click detection on logo to enter Zoro Mode
 */
function setUpZoroTrigger() {
    elements.logo.addEventListener('click', () => {
        typingGame.logoClickCount++;
        
        // Clear existing timer
        if (typingGame.logoClickTimer) {
            clearTimeout(typingGame.logoClickTimer);
        }
        
        // Create new timer
        typingGame.logoClickTimer = setTimeout(() => {
            // Check if we've clicked 3 times quickly
            if (typingGame.logoClickCount >= 3) {
                if (window.zoroModule && window.zoroModule.activate) {
                    window.zoroModule.activate();
                }
            }
            
            // Reset click count
            typingGame.logoClickCount = 0;
        }, 500); // Reset after 500ms
    });
}

// Main Application Entry Point

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    // Set up event listeners
    initializeKeyboardEvents();
    
    // Check for Zoro Mode and initialize if available
    if (window.zoroModule) {
        window.zoroModule.init();
    }
    
    // Initialize statistics module if available
    if (window.statsModule) {
        window.statsModule.init();
    }
}

// Initialize keyboard event listeners
function initializeKeyboardEvents() {
    const textInput = document.getElementById('hidden-input'); // Changed from 'text-input' to 'hidden-input'
    
    if (!textInput) {
        console.warn('Hidden input element not found. Keyboard events may not work properly.');
        return; // Exit the function if the element doesn't exist
    }
    
    // Focus the input field when the page loads
    textInput.focus();
    
    // Focus the input field when the user clicks anywhere on the document
    document.addEventListener('click', function(event) {
        // Only focus if we're not clicking on another input or interactive element
        const tagName = event.target.tagName.toLowerCase();
        if (tagName !== 'input' && tagName !== 'button' && tagName !== 'a' && tagName !== 'textarea') {
            textInput.focus();
        }
    });
    
    // Handle input for Zoro Mode activation
    textInput.addEventListener('input', function(event) {
        const value = event.target.value.trim();
        
        // Check for Zoro Mode trigger
        if (window.zoroModule && window.zoroModule.isZoroTriggerSequence(value)) {
            // Clear input
            event.target.value = '';
            
            // Activate Zoro Mode
            window.zoroModule.activate();
        }
    });
}

// Add dark mode toggle functionality
const darkModeToggle = document.getElementById('dark-mode-toggle');
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        
        // Save preference to localStorage
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('dark-mode', isDarkMode);
    });
    
    // Check for saved preference
    const savedDarkMode = localStorage.getItem('dark-mode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
    }
}

// Utility functions for general use throughout the app
// Add any shared utility functions here that may be used across different modules

// Example: Function to show a temporary notification
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