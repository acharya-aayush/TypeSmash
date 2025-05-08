# TypeSmash: Meaningful Passages Implementation Plan

## Overview

This document outlines the implementation plan for enhancing TypeSmash's word mode to use meaningful passages (quotes, essays, monologues) from the words_collection.json file instead of random words.

## Current State

Currently, the word mode:
- Offers multiple word counts (20, 50, 100, 200, 500, 1000)
- Uses random word generation logic
- Displays the exact number of words as specified by the mode
- Tracks progress based on exact word counts

## Target State

After implementation:
- Word mode will use meaningful passages from words_collection.json
- UI will continue to show categories by word count (20w, 50w, etc.)
- Word count may vary slightly from the category name
- Progress tracking will adapt to actual word counts
- Statistics will still be categorized by nominal word count (e.g., "50w")

## Implementation Steps

### 1. Passage Selection and Loading

- **Create function**: `getRandomPassage(wordCountCategory)` in utils.js
  - Takes nominal word count (20, 50, 100, etc.)
  - Returns a randomly selected passage from that category
  - Handle edge case of empty/missing categories

- **Modify function**: `loadPassageWords(wordCount)` in main.js
  - Replace current implementation that uses `getPassageWords()`
  - Call `getRandomPassage()` to get complete passage text
  - Split the passage into words

- **Create function**: `getPassageWordCount(passage)` in utils.js
  - Accurately count words in a passage
  - Handle edge cases like multiple spaces, punctuation

### 2. Progress Tracking Updates

- **Modify**: Store both nominal word count and actual word count in game state
  ```javascript
  typingGame.wordModeCount = 50; // The selected category (50w)
  typingGame.actualWordCount = 53; // The actual number of words in passage
  ```

- **Update function**: `resetTest()` in main.js
  - Set word limit to actual word count after loading passage
  - Keep wordModeCount as the category identifier

- **Update function**: `updateLiveStats()` in main.js
  - Display progress as `${typingGame.wordCount}/${typingGame.actualWordCount}`
  - Keep nominal word count for mode identification

### 3. UI Enhancements

- **Update UI components**:
  - Word mode button text should still show nominal count (e.g., "50w")
  - Add tooltip or subtle indicator showing actual word count when hovering
  - Progress indicator should reflect actual count
  
- **Word display system**:
  - Ensure multiple lines of text can be displayed clearly
  - Handle longer words and proper punctuation display

### 4. Statistics Tracking

- **Modify function**: `saveToHistory()` in main.js
  ```javascript
  function saveToHistory(wpm, accuracy, modeIdentifier, chars, errors, timeDisplay) {
      // Modified version with actual word count
      window.statsModule.saveToHistory(
          wpm,
          accuracy,
          modeIdentifier,  // e.g., 'word-50'
          chars,
          errors,
          timeDisplay,
          typingGame.actualWordCount  // Add actual word count as new parameter
      );
  }
  ```

- **Update function**: `saveToHistory()` in stats.js
  ```javascript
  function saveToHistory(wpm, accuracy, mode, chars, errors, time, actualWordCount = null) {
      // Create new history entry with actual word count
      const newEntry = {
          wpm,
          accuracy,
          mode,
          chars,
          errors,
          time,
          timestamp: Date.now(),
          actualWordCount: actualWordCount  // Store actual word count if provided
      };
      
      // Rest of function remains the same
      // ...
  }
  ```

- **Update function**: `updateHistoryTable()` in stats.js
  ```javascript
  function updateHistoryTable(entries) {
      // Existing code...
      
      // Add rows for each history entry
      entries.forEach(entry => {
          // Existing code for row creation...
          
          // Mode column with actual word count if available
          const modeCell = document.createElement('td');
          modeCell.textContent = formatMode(entry.mode);
          
          // Add actual word count as tooltip or small text if different from nominal
          if (entry.actualWordCount && entry.mode.startsWith('word-')) {
              const nominalCount = parseInt(entry.mode.split('-')[1], 10);
              if (entry.actualWordCount !== nominalCount) {
                  // Add tooltip
                  modeCell.setAttribute('title', `Actual: ${entry.actualWordCount} words`);
                  
                  // Or add small text
                  const actualCountSpan = document.createElement('span');
                  actualCountSpan.className = 'actual-count';
                  actualCountSpan.textContent = ` (${entry.actualWordCount})`;
                  actualCountSpan.style.fontSize = '0.8em';
                  actualCountSpan.style.opacity = '0.7';
                  modeCell.appendChild(actualCountSpan);
              }
          }
          
          // Rest of the function remains the same
          // ...
      });
  }
  ```

- **Add CSS for actual word count display**:
  ```css
  .actual-count {
      font-size: 0.8em;
      opacity: 0.7;
      margin-left: 3px;
  }
  ```

- **Update function**: `formatMode()` in stats.js
  ```javascript
  function formatMode(mode, actualWordCount = null) {
      if (mode === 'timed') return '15s';
      if (mode === 'zoro') return 'Zoro';
      
      // Handle word modes with optional actual count display
      if (mode.startsWith('word-')) {
          const wordCount = mode.split('-')[1];
          return actualWordCount && actualWordCount !== parseInt(wordCount, 10)
              ? `${wordCount}w (${actualWordCount})` 
              : `${wordCount}w`;
      }
      
      return mode; // Fallback
  }
  ```

### 5. Handling Word Count Variations

- **For passages with fewer words than nominal**:
  - Simply end the test when the actual words are completed
  - Display final stats based on actual word count
  - Categorize by nominal count

- **For passages with more words than nominal**:
  - Option 1: Truncate to exact count (less ideal)
  - Option 2: Use entire passage and update UI to reflect actual count (preferred)
  - Option 3: Find passages that are closest to the nominal count

### 6. Edge Case Handling

- **Empty categories**: Fallback to random word generation
- **Failed JSON loading**: Graceful degradation to current system
- **Very long passages**: Ensure UI can handle without breaking layout
- **Special characters/formatting**: Properly sanitize input

## Testing Strategy

1. **Unit Tests**:
   - Verify passage selection logic
   - Confirm word counting function accuracy
   - Test edge cases with unusual text formats

2. **Integration Tests**:
   - Ensure mode selection works properly
   - Verify progress tracking adapts to actual word counts
   - Check statistics properly categorize tests

3. **User Acceptance Tests**:
   - Confirm UI clearly communicates word counts
   - Verify typing experience remains smooth with varied text

## Rollout Plan

1. **Phase 1**: Update utils.js to load and parse passages
2. **Phase 2**: Modify main.js to use passages instead of random words
3. **Phase 3**: Enhance UI to properly display text and progress
4. **Phase 4**: Update stats.js to handle word count variations
5. **Final Phase**: Complete testing and documentation updates

## Specific File Updates

### utils.js Changes

```javascript
/**
 * Gets a random text passage of the specified word count category
 * @param {number} wordCount - Nominal word count (20, 50, 100, 200, 500, or 1000)
 * @returns {Object} Object containing { text, actualWordCount }
 */
function getRandomPassage(wordCount) {
    // Get valid word count (closest match)
    const validWordCounts = [20, 50, 100, 200, 500, 1000];
    const closestWordCount = validWordCounts.reduce((prev, curr) => {
        return (Math.abs(curr - wordCount) < Math.abs(prev - wordCount) ? curr : prev);
    });
    
    // Check if words collection is loaded and has passages for this word count
    if (!wordsCollection || 
        !wordsCollection[`${closestWordCount}_words`] || 
        wordsCollection[`${closestWordCount}_words`].length === 0) {
        
        // Fall back to random words
        const randomWords = generateWordList(wordCount).join(' ');
        return {
            text: randomWords,
            actualWordCount: wordCount
        };
    }
    
    // Get all passages for the requested word count
    const passages = wordsCollection[`${closestWordCount}_words`];
    
    // Select a random passage
    const randomIndex = Math.floor(Math.random() * passages.length);
    const passage = passages[randomIndex];
    
    // Calculate actual word count
    const actualWordCount = getPassageWordCount(passage);
    
    return {
        text: passage,
        actualWordCount: actualWordCount
    };
}

/**
 * Count words in a passage accurately
 * @param {string} passage - Text passage
 * @returns {number} Word count
 */
function getPassageWordCount(passage) {
    if (!passage) return 0;
    
    // Split by whitespace and filter out empty strings
    const words = passage.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
}
```

### main.js Changes

```javascript
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
 * Reset typing test to start a new one
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
    typingGame.actualWordCount = typingGame.wordModeCount; // Default to nominal count
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
    elements.timeDisplay.textContent = typingGame.timeMode ? '15s' : `0/${typingGame.actualWordCount}`;
    
    // Remove typing-active class to show social icons again
    document.body.classList.remove('typing-active');
    
    // Focus input
    elements.hiddenInput.focus();
}
```

## Success Criteria

The implementation will be considered successful when:
1. TypeSmash consistently uses meaningful passages for all word counts
2. UI accurately reflects both nominal category and actual word counts
3. Progress tracking and statistics function correctly with varied text
4. User experience remains smooth across all word modes

## Future Enhancements

- **Category tags**: Label passages by type (quote, essay, poem, etc.)
- **Difficulty ratings**: Mark passages by complexity/difficulty
- **Language options**: Support multiple languages
- **User contributions**: Allow users to submit their own passages