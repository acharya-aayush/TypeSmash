/**
 * cursor.js - Cursor management for typing tests
 * Handles cursor positioning, visibility, and animations
 */

const Cursor = (function() {
    // Private variables
    let cursorElement = null;
    let blinkInterval = null;
    let isVisible = true;
    
    /**
     * Initialize the cursor manager
     * @param {HTMLElement} cursor - Cursor element
     */
    function initialize(cursor) {
        cursorElement = cursor;
        
        if (!cursorElement) {
            console.error('Cursor element not provided to Cursor module');
            return;
        }
        
        // Start cursor blinking
        startBlink();
        
        // Subscribe to events
        if (window.EventBus) {
            EventBus.subscribe('typing:start', () => {
                stopBlink();
                show();
            });
            
            EventBus.subscribe('typing:complete', () => {
                stopBlink();
                hide();
            });
            
            EventBus.subscribe('typing:reset', () => {
                startBlink();
                show();
            });
        }
    }
    
    /**
     * Start cursor blinking
     */
    function startBlink() {
        // Clear any existing interval
        stopBlink();
        
        // Start new blink interval
        isVisible = true;
        if (cursorElement) {
            cursorElement.style.display = 'block';
            blinkInterval = setInterval(() => {
                isVisible = !isVisible;
                cursorElement.style.opacity = isVisible ? '1' : '0';
            }, 530); // Slightly over 500ms for more natural feel
        }
    }
    
    /**
     * Stop cursor blinking
     */
    function stopBlink() {
        if (blinkInterval) {
            clearInterval(blinkInterval);
            blinkInterval = null;
        }
        
        // Ensure cursor is visible when not blinking
        if (cursorElement) {
            cursorElement.style.opacity = '1';
        }
    }
    
    /**
     * Show the cursor
     */
    function show() {
        if (cursorElement) {
            cursorElement.style.display = 'block';
            cursorElement.style.opacity = '1';
            isVisible = true;
        }
    }
    
    /**
     * Hide the cursor
     */
    function hide() {
        if (cursorElement) {
            cursorElement.style.display = 'none';
            isVisible = false;
        }
    }
    
    /**
     * Update cursor position
     * @param {Object} position - Position object with left and top properties
     */
    function updatePosition(position) {
        if (!cursorElement) return;
        
        if (position.left !== undefined) {
            cursorElement.style.left = `${position.left}px`;
        }
        
        if (position.top !== undefined) {
            cursorElement.style.top = `${position.top}px`;
        }
    }
    
    /**
     * Calculate and update cursor position based on current word and input length
     * @param {HTMLElement} wordElement - Current word element
     * @param {number} inputLength - Length of current input
     */
    function updatePositionFromWord(wordElement, inputLength) {
        if (!cursorElement || !wordElement) return;
        
        let left, top;
        
        // Calculate cursor position
        if (inputLength === 0) {
            // At the start of the word
            left = wordElement.offsetLeft;
            top = wordElement.offsetTop;
        } else if (inputLength <= wordElement.children.length) {
            // Within the word
            const charElement = wordElement.children[inputLength - 1];
            left = charElement.offsetLeft + charElement.offsetWidth;
            top = charElement.offsetTop;
        } else {
            // Beyond the word
            const lastChar = wordElement.children[wordElement.children.length - 1];
            left = lastChar.offsetLeft + lastChar.offsetWidth + 
                (inputLength - wordElement.children.length) * 10;
            top = lastChar.offsetTop;
        }
        
        // Update cursor position
        updatePosition({ left, top });
        
        // Ensure cursor is visible
        show();
    }
    
    /**
     * Toggle cursor visibility
     * @returns {boolean} - New visibility state
     */
    function toggle() {
        isVisible = !isVisible;
        if (cursorElement) {
            cursorElement.style.display = isVisible ? 'block' : 'none';
        }
        return isVisible;
    }
    
    /**
     * Check if cursor is visible
     * @returns {boolean} - True if cursor is visible
     */
    function isShown() {
        return isVisible;
    }
    
    // Public API
    return {
        initialize,
        show,
        hide,
        toggle,
        updatePosition,
        updatePositionFromWord,
        startBlink,
        stopBlink,
        isShown
    };
})();

// Export for use in other modules
window.Cursor = Cursor;