// Global variables
const state = {
    mode: 'timed', // 'timed' or 'word'
    isRunning: false,
    startTime: 0,
    endTime: 0,
    timeLimit: 15, // seconds for timed mode
    wordLimit: 20, // words for word mode
    currentWordIndex: 0,
    currentCharIndex: 0,
    correctChars: 0,
    incorrectChars: 0,
    extraChars: 0,
    words: [],
    lineElements: [],
    timer: null,
    currentInput: '',
    testComplete: false
};

// DOM Elements
const elements = {
    textDisplay: document.getElementById('text-display'),
    hiddenInput: document.getElementById('hidden-input'),
    cursor: document.getElementById('cursor'),
    timedModeBtn: document.getElementById('timed-mode'),
    wordModeBtn: document.getElementById('word-mode'),
    logo: document.getElementById('logo'),
    statsContainer: document.getElementById('stats-container'),
    wpm: document.getElementById('wpm'),
    accuracy: document.getElementById('accuracy'),
    characters: document.getElementById('characters'),
    errors: document.getElementById('errors'),
    time: document.getElementById('time'),
    restartPrompt: document.getElementById('restart-prompt')
};

// Word lists
const commonWords = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also'
];

// Paragraphs for timed mode
const paragraphs = [
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter in the alphabet. Typing practice helps improve your speed and accuracy over time. Focus on accuracy first, and speed will come naturally as you practice more.",
    "Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using many different languages. Learning to code is becoming an essential skill in today's digital world.",
    "Effective communication is crucial in both personal and professional settings. It involves not only speaking clearly but also listening actively. Good communicators can express ideas in a way that others can easily understand.",
    "Reading books can transport you to different worlds and perspectives. It increases vocabulary and improves concentration. Many successful people attribute their knowledge and creativity to reading regularly."
];

// Initialize the app
function init() {
    // Add event listeners
    elements.hiddenInput.addEventListener('input', handleInput);
    elements.hiddenInput.addEventListener('keydown', handleKeyDown);
    elements.timedModeBtn.addEventListener('click', () => switchMode('timed'));
    elements.wordModeBtn.addEventListener('click', () => switchMode('word'));
    elements.logo.addEventListener('click', resetApp);

    // Focus on input
    elements.hiddenInput.focus();
    
    // Initialize with timed mode
    switchMode('timed');
    
    // Position cursor at the starting point
    updateCursorPosition();
    
    // Ensure focus returns to input when clicking anywhere
    document.addEventListener('click', () => {
        elements.hiddenInput.focus();
    });
}

// Switch between modes
function switchMode(mode) {
    if (state.isRunning) {
        resetTest();
    }
    
    state.mode = mode;
    
    // Update UI
    elements.timedModeBtn.classList.toggle('active', mode === 'timed');
    elements.wordModeBtn.classList.toggle('active', mode === 'word');
    
    // Generate text based on mode
    generateText();
    
    // Reset to initial state
    resetTest(false);
}

// Generate text based on current mode
function generateText() {
    // Clear previous text
    elements.textDisplay.innerHTML = '';
    state.lineElements = [];
    
    if (state.mode === 'timed') {
        // Select a random paragraph
        const paragraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
        state.words = paragraph.split(' ');
    } else {
        // Generate random words for word mode
        state.words = [];
        
        // Get random words, but ensure no duplicates next to each other
        for (let i = 0; i < state.wordLimit; i++) {
            let randomWord;
            do {
                randomWord = commonWords[Math.floor(Math.random() * commonWords.length)];
            } while (i > 0 && randomWord === state.words[i - 1]);
            
            state.words.push(randomWord);
        }
    }
    
    // Create lines with words
    createTextDisplay();
}

// Create the text display with words
function createTextDisplay() {
    let currentLine = document.createElement('div');
    currentLine.className = 'line active';
    elements.textDisplay.appendChild(currentLine);
    state.lineElements.push(currentLine);
    
    let lineWidth = 0;
    const maxWidth = elements.textDisplay.clientWidth * 0.9; // 90% of container width
    
    state.words.forEach((word, wordIndex) => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word';
        wordElement.dataset.index = wordIndex;
        
        // Add each character as a span
        for (let i = 0; i < word.length; i++) {
            const charElement = document.createElement('span');
            charElement.className = 'char';
            charElement.textContent = word[i];
            charElement.dataset.index = i;
            wordElement.appendChild(charElement);
        }
        
        // Calculate if this word fits in the current line
        // Approximate width calculation
        const wordWidth = word.length * 14 + 8; // rough character width + word spacing
        
        if (lineWidth + wordWidth > maxWidth && lineWidth > 0) {
            // Create a new line
            currentLine = document.createElement('div');
            currentLine.className = 'line';
            elements.textDisplay.appendChild(currentLine);
            state.lineElements.push(currentLine);
            lineWidth = wordWidth;
        } else {
            lineWidth += wordWidth;
        }
        
        currentLine.appendChild(wordElement);
    });
    
    // Show only 3 lines maximum
    updateVisibleLines();
}

// Update which lines are visible and their opacity
function updateVisibleLines() {
    // Find active word and its line
    const activeWord = document.querySelector(`.word[data-index="${state.currentWordIndex}"]`);
    if (!activeWord) return;
    
    const activeLine = activeWord.closest('.line');
    const activeLineIndex = state.lineElements.indexOf(activeLine);
    
    // Reset all lines
    state.lineElements.forEach(line => {
        line.className = 'line';
    });
    
    // Set classes for visible lines
    for (let i = 0; i < state.lineElements.length; i++) {
        if (i === activeLineIndex) {
            state.lineElements[i].className = 'line active';
        } else if (i === activeLineIndex - 1) {
            state.lineElements[i].className = 'line previous';
        } else if (i === activeLineIndex - 2) {
            state.lineElements[i].className = 'line previous-2';
        }
    }
}

// Handle input
function handleInput(e) {
    if (!state.isRunning && e.data) {
        startTest();
    }
    
    if (!state.isRunning || state.testComplete) return;
    
    const inputValue = e.target.value;
    state.currentInput = inputValue;
    
    // Process input
    processInput(inputValue);
    
    // Update cursor position
    updateCursorPosition();
}

// Process current input
function processInput(input) {
    if (state.currentWordIndex >= state.words.length) return;
    
    const currentWord = state.words[state.currentWordIndex];
    const wordElement = document.querySelector(`.word[data-index="${state.currentWordIndex}"]`);
    
    // Clear previous states
    Array.from(wordElement.querySelectorAll('.char')).forEach(char => {
        char.className = 'char';
    });
    
    // Remove any extra character elements
    Array.from(wordElement.querySelectorAll('.extra')).forEach(extra => {
        extra.remove();
    });
    
    // Check each character
    for (let i = 0; i < input.length; i++) {
        const charElement = wordElement.querySelector(`.char[data-index="${i}"]`);
        
        if (i < currentWord.length) {
            // Character exists in current word
            if (input[i] === currentWord[i]) {
                charElement.classList.add('correct');
            } else {
                charElement.classList.add('incorrect');
            }
        } else {
            // Extra characters
            const extraChar = document.createElement('span');
            extraChar.className = 'extra';
            extraChar.textContent = input[i];
            wordElement.appendChild(extraChar);
        }
    }
    
    // Highlight current character position
    if (input.length < currentWord.length) {
        const currentChar = wordElement.querySelector(`.char[data-index="${input.length}"]`);
        if (currentChar) {
            currentChar.classList.add('current');
        }
    }
}

// Handle key presses
function handleKeyDown(e) {
    // Tab key to restart
    if (e.key === 'Tab') {
        e.preventDefault();
        resetTest();
        return;
    }
    
    // Prevent default behavior for some keys
    if (e.key === 'Enter') {
        e.preventDefault();
        return;
    }
    
    // Space to move to next word
    if (e.key === ' ' && state.isRunning) {
        e.preventDefault();
        
        // Calculate metrics for current word
        calculateWordMetrics();
        
        // Move to next word
        state.currentWordIndex++;
        state.currentCharIndex = 0;
        elements.hiddenInput.value = '';
        state.currentInput = '';
        
        // Check if the test is complete
        if (state.mode === 'word' && state.currentWordIndex >= state.wordLimit) {
            endTest();
            return;
        }
        
        // Update visible lines
        updateVisibleLines();
    }
}

// Calculate metrics for current word
function calculateWordMetrics() {
    const currentWord = state.words[state.currentWordIndex];
    const input = state.currentInput;
    
    // Count correct and incorrect characters
    for (let i = 0; i < Math.max(currentWord.length, input.length); i++) {
        if (i < input.length && i < currentWord.length) {
            // Character exists in both the word and input
            if (input[i] === currentWord[i]) {
                state.correctChars++;
            } else {
                state.incorrectChars++;
            }
        } else if (i >= currentWord.length && i < input.length) {
            // Extra characters in input
            state.extraChars++;
        } else if (i < currentWord.length && i >= input.length) {
            // Missing characters in input
            state.incorrectChars++;
        }
    }
}

// Update cursor position
function updateCursorPosition() {
    if (state.currentWordIndex >= state.words.length) {
        elements.cursor.style.display = 'none';
        return;
    }
    
    const wordElement = document.querySelector(`.word[data-index="${state.currentWordIndex}"]`);
    if (!wordElement) {
        elements.cursor.style.display = 'none';
        return;
    }
    
    const inputLength = state.currentInput.length;
    let targetElement;
    
    if (inputLength < state.words[state.currentWordIndex].length) {
        // Position at the current character
        targetElement = wordElement.querySelector(`.char[data-index="${inputLength}"]`);
    } else {
        // Position at the end of the word
        targetElement = wordElement.querySelector(`.char[data-index="${state.words[state.currentWordIndex].length - 1}"]`);
    }
    
    if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const parentRect = elements.textDisplay.getBoundingClientRect();
        
        elements.cursor.style.display = 'block';
        
        if (inputLength < state.words[state.currentWordIndex].length) {
            // Position at the start of the character
            elements.cursor.style.left = `${rect.left - parentRect.left}px`;
        } else {
            // Position at the end of the word
            elements.cursor.style.left = `${rect.right - parentRect.left + 2}px`;
        }
        
        elements.cursor.style.top = `${rect.top - parentRect.top}px`;
        elements.cursor.style.height = `${rect.height}px`;
    } else {
        elements.cursor.style.display = 'none';
    }
}

// Start the test
function startTest() {
    if (state.isRunning) return;
    
    state.isRunning = true;
    state.startTime = Date.now();
    state.testComplete = false;
    
    // Highlight the first character
    const firstWordElement = document.querySelector('.word[data-index="0"]');
    if (firstWordElement) {
        const firstChar = firstWordElement.querySelector('.char[data-index="0"]');
        if (firstChar) {
            firstChar.classList.add('current');
        }
    }
    
    // Show cursor
    elements.cursor.style.display = 'block';
    
    // Start timer for timed mode
    if (state.mode === 'timed') {
        state.timer = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
            const remainingSeconds = state.timeLimit - elapsedSeconds;
            
            if (remainingSeconds <= 0) {
                endTest();
            }
        }, 200);
    }
}

// End the test
function endTest() {
    if (!state.isRunning) return;
    
    state.isRunning = false;
    state.endTime = Date.now();
    state.testComplete = true;
    
    // Clear timer if it exists
    if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
    }
    
    // Calculate final word if not processed yet
    if (state.currentInput.length > 0) {
        calculateWordMetrics();
    }
    
    // Calculate and display stats
    displayStats();
    
    // Hide cursor
    elements.cursor.style.display = 'none';
    
    // Show restart prompt
    elements.restartPrompt.classList.remove('hidden');
}

// Calculate and display statistics
function displayStats() {
    const timeElapsed = (state.endTime - state.startTime) / 1000;
    const totalChar = state.correctChars + state.incorrectChars + state.extraChars;
    const totalCorrectWords = state.correctChars / 5; // Standard WPM calculation
    const wpmValue = Math.round(totalCorrectWords / (timeElapsed / 60));
    
    // Calculate accuracy
    const accuracyValue = totalChar > 0 
        ? Math.round((state.correctChars / totalChar) * 100) 
        : 0;
    
    // Display stats
    elements.wpm.textContent = wpmValue;
    elements.accuracy.textContent = `${accuracyValue}%`;
    elements.characters.textContent = state.correctChars;
    elements.errors.textContent = state.incorrectChars + state.extraChars;
    elements.time.textContent = `${Math.round(timeElapsed)}s`;
    
    // Show stats container
    elements.statsContainer.classList.remove('hidden');
}

// Reset the test
function resetTest(generateNewText = true) {
    // Reset state
    state.isRunning = false;
    state.startTime = 0;
    state.endTime = 0;
    state.currentWordIndex = 0;
    state.currentCharIndex = 0;
    state.correctChars = 0;
    state.incorrectChars = 0;
    state.extraChars = 0;
    state.currentInput = '';
    state.testComplete = false;
    
    // Clear input
    elements.hiddenInput.value = '';
    
    // Clear timer if it exists
    if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
    }
    
    // Generate new text if specified
    if (generateNewText) {
        generateText();
    }
    
    // Hide stats
    elements.statsContainer.classList.add('hidden');
    
    // Hide restart prompt
    elements.restartPrompt.classList.add('hidden');
    
    // Focus on input
    elements.hiddenInput.focus();
    
    // Update cursor position
    updateCursorPosition();
}

// Reset entire app
function resetApp() {
    switchMode('timed');
}

// Handle window resize
window.addEventListener('resize', () => {
    // Recreate text display to adjust for new width
    if (state.words.length > 0) {
        createTextDisplay();
        updateCursorPosition();
    }
});

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
