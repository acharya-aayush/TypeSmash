/**
 * text-display.js - Text display management for typing test
 * Handles word rendering, highlighting, and display updates
 */

const TextDisplay = (function() {
    // Private variables
    let textDisplayElement = null;
    let cursorElement = null;
    let wordsPerLine = 14; // Default value, can be overridden from Config
    let currentWordIndex = 0;
    let currentLineIndex = 0;
    let words = [];

    /**
     * Initialize the text display
     * @param {HTMLElement} textDisplayEl - Text display container element
     * @param {HTMLElement} cursorEl - Cursor element
     */
    function initialize(textDisplayEl, cursorEl) {
        textDisplayElement = textDisplayEl;
        cursorElement = cursorEl;

        // Get wordsPerLine from Config if available
        if (window.Config && Config.TYPING && Config.TYPING.WORDS_PER_LINE) {
            wordsPerLine = Config.TYPING.WORDS_PER_LINE;
        }

        // Subscribe to state changes
        if (window.State) {
            State.watch('typing.currentWordIndex', (value) => {
                currentWordIndex = value;
                updateDisplay();
            });
            
            State.watch('typing.words', (value) => {
                words = value;
                updateDisplay();
            });
        }
    }

    /**
     * Update the text display with current words
     */
    function updateDisplay() {
        if (!textDisplayElement || words.length === 0) return;

        // Clear the text display
        textDisplayElement.innerHTML = '';

        // Calculate which line the current word is on
        currentLineIndex = Math.floor(currentWordIndex / wordsPerLine);

        // Create 3 lines
        const numLines = 3;

        // Display 3 lines, starting from the current line
        for (let lineOffset = 0; lineOffset < numLines; lineOffset++) {
            const lineIndex = currentLineIndex + lineOffset;
            
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
                
                if (wordIndex < words.length) {
                    const wordDiv = document.createElement('div');
                    wordDiv.className = 'word';
                    
                    // Mark the current word
                    if (wordIndex === currentWordIndex) {
                        wordDiv.classList.add('current');
                    } else if (wordIndex < currentWordIndex) {
                        wordDiv.classList.add('completed');
                    }
                    
                    // Create spans for each character
                    const word = words[wordIndex];
                    for (let j = 0; j < word.length; j++) {
                        const charSpan = document.createElement('span');
                        charSpan.className = 'char';
                        
                        // For completed words, mark all characters as correct
                        if (wordIndex < currentWordIndex) {
                            charSpan.classList.add('correct');
                        }
                        
                        charSpan.textContent = word[j];
                        wordDiv.appendChild(charSpan);
                    }
                    
                    // Add a space after each word (except the last one in a line)
                    if (wordInLine < wordsPerLine - 1 && wordIndex < words.length - 1) {
                        const spaceSpan = document.createElement('span');
                        spaceSpan.className = 'space';
                        spaceSpan.textContent = ' ';
                        wordDiv.appendChild(spaceSpan);
                    }
                    
                    lineDiv.appendChild(wordDiv);
                }
            }
            
            textDisplayElement.appendChild(lineDiv);
        }

        // Update cursor position
        updateCursorPosition();
    }

    /**
     * Update character highlighting in the current word
     * @param {string} input - Current user input
     */
    function updateCharHighlighting(input) {
        // Get the current word
        const currentWord = words[currentWordIndex] || '';
        
        // Get the current word element
        const wordElement = textDisplayElement.querySelector('.word.current');
        if (!wordElement) return;
        
        const charElements = wordElement.querySelectorAll('.char');
        
        // Remove all classes first
        charElements.forEach(charEl => {
            charEl.className = 'char';
        });
        
        // Check each character
        for (let i = 0; i < input.length; i++) {
            if (i < charElements.length) {
                if (i < currentWord.length) {
                    if (input[i] === currentWord[i]) {
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
        
        // Update cursor position after highlighting
        updateCursorPosition();
    }

    /**
     * Update cursor position based on input length
     * @param {number} [inputLength] - Length of current input, defaults to 0
     */
    function updateCursorPosition(inputLength = 0) {
        if (!cursorElement) return;

        // Get current word element
        const wordElement = textDisplayElement.querySelector('.word.current');
        if (!wordElement) {
            // Hide cursor if no current word
            cursorElement.style.display = 'none';
            return;
        }
        
        // Calculate cursor position
        if (inputLength === 0) {
            // At the start of the word
            cursorElement.style.left = `${wordElement.offsetLeft}px`;
            cursorElement.style.top = `${wordElement.offsetTop}px`;
        } else if (inputLength <= wordElement.children.length) {
            // Within the word
            const charElement = wordElement.children[inputLength - 1];
            cursorElement.style.left = `${charElement.offsetLeft + charElement.offsetWidth}px`;
            cursorElement.style.top = `${charElement.offsetTop}px`;
        } else {
            // Beyond the word
            const lastChar = wordElement.children[wordElement.children.length - 1];
            cursorElement.style.left = `${lastChar.offsetLeft + lastChar.offsetWidth + 
                (inputLength - wordElement.children.length) * 10}px`;
            cursorElement.style.top = `${lastChar.offsetTop}px`;
        }
        
        // Show cursor
        cursorElement.style.display = 'block';
    }

    /**
     * Move cursor to next word
     * @param {boolean} updateFullDisplay - Whether to update the full display
     */
    function moveToNextWord(updateFullDisplay = false) {
        // Calculate current line before updating
        const currentLineBefore = Math.floor(currentWordIndex / wordsPerLine);
        
        // Calculate current line after updating
        const nextWordIndex = currentWordIndex + 1;
        const currentLineAfter = Math.floor(nextWordIndex / wordsPerLine);
        
        // Update state
        if (window.State) {
            State.update('typing.currentWordIndex', nextWordIndex);
        }
        
        // Handle line changes
        if (updateFullDisplay || currentLineAfter !== currentLineBefore || 
            nextWordIndex === 1 || 
            nextWordIndex >= words.length - 3) {
            // Full display update required
            updateDisplay();
        } else {
            // Just update current word highlighting
            const currentWordElem = textDisplayElement.querySelector('.word.current');
            if (currentWordElem) {
                currentWordElem.classList.remove('current');
            }
            
            // Find the new current word and highlight it
            const wordElements = textDisplayElement.querySelectorAll('.word');
            const wordIndexInView = nextWordIndex % (wordsPerLine * 3);
            
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
     * Show cursor
     */
    function showCursor() {
        if (cursorElement) {
            cursorElement.style.display = 'block';
        }
    }

    /**
     * Hide cursor
     */
    function hideCursor() {
        if (cursorElement) {
            cursorElement.style.display = 'none';
        }
    }

    /**
     * Reset the display
     */
    function reset() {
        if (window.State) {
            State.update('typing.currentWordIndex', 0);
        } else {
            currentWordIndex = 0;
            updateDisplay();
        }
    }

    // Public API
    return {
        initialize,
        updateDisplay,
        updateCharHighlighting,
        updateCursorPosition,
        moveToNextWord,
        showCursor,
        hideCursor,
        reset
    };
})();

// Export for use in other modules
window.TextDisplay = TextDisplay;