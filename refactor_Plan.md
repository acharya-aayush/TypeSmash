# TypeSmash Refactoring Plan

## Overview

This document outlines the plan to refactor the TypeSmash codebase to improve maintainability, readability, and extensibility. The current implementation has grown organically with several large files that handle multiple concerns. This refactoring will break these files into smaller, focused modules with clear responsibilities.

## Current State Analysis

The TypeSmash application currently consists of four main JavaScript files:

1. **main.js (~1000+ lines)**: Core typing test functionality
   - Text generation and display
   - User input handling
   - WPM and accuracy calculations
   - Mode switching (timed vs. word count)
   - Progress tracking
   - Easter eggs

2. **zoromode.js (~1300+ lines)**: Arcade/game mode
   - Canvas-based word rendering
   - Game loop
   - Power-up system
   - Difficulty progression
   - Score tracking
   - Word collision
   - Visual effects

3. **stats.js (~450 lines)**: Statistics tracking
   - History storage and retrieval
   - Chart generation
   - Data filtering
   - Table rendering

4. **utils.js (~400 lines)**: Utility functions
   - Random word generation
   - Text passage loading
   - Sound management
   - Time formatting
   - Animation utilities

## Goals of Refactoring

1. **Separation of concerns**: Isolate distinct functionalities into separate modules
2. **Improved maintainability**: Smaller files that are easier to understand and modify
3. **Better organization**: Clearer code structure with proper namespacing
4. **Reduced duplication**: Consolidate shared functionality
5. **Better testability**: Modules with clear inputs and outputs
6. **Easier extension**: Ability to add new features without major changes to existing code
7. **Code reusability**: Components that can be reused across the application

## Module Structure Plan

### Directory Structure

```
js/
├── core/                   # Core application functionality
│   ├── app.js              # Main application initialization
│   ├── state.js            # Centralized state management
│   ├── events.js           # Event handling and delegation
│   └── config.js           # Configuration and constants
│
├── typing/                 # Typing test functionality
│   ├── typing-engine.js    # Core typing test logic
│   ├── text-display.js     # Text rendering and styling
│   ├── input-handler.js    # Keyboard input processing
│   ├── word-provider.js    # Word generation and management
│   ├── test-timer.js       # Timer functionality
│   ├── cursor.js           # Cursor positioning and animation
│   ├── metrics.js          # Performance calculations (WPM, accuracy)
│   └── mode-manager.js     # Test mode selection and configuration
│
├── zoro/                   # Zoro arcade mode
│   ├── zoro-engine.js      # Main game controller
│   ├── word-spawner.js     # Word generation and spawning
│   ├── render.js           # Canvas rendering
│   ├── collision.js        # Collision detection
│   ├── power-ups.js        # Power-up system
│   ├── difficulty.js       # Level progression and scaling
│   ├── score-manager.js    # Score tracking and display
│   └── effects.js          # Visual and audio effects
│
├── stats/                  # Statistics functionality
│   ├── stats-manager.js    # Core stats functionality
│   ├── history.js          # History management
│   ├── charts.js           # Chart visualization
│   ├── tables.js           # History table rendering
│   └── filters.js          # Data filtering and processing
│
├── utils/                  # Utility functions
│   ├── dom.js              # DOM manipulation helpers
│   ├── audio.js            # Audio management
│   ├── text.js             # Text processing utilities
│   ├── animation.js        # Animation helpers
│   ├── storage.js          # LocalStorage management
│   └── formatters.js       # Data formatting helpers
│
└── easter-eggs/            # Easter egg functionality
    ├── easter-egg-manager.js # Main Easter egg controller
    ├── triggers.js         # Trigger detection
    └── effects.js          # Easter egg effects
```

## Module Definitions and Responsibilities

### Core Modules

#### app.js
- Application initialization
- Module loading and coordination
- High-level event handling

#### state.js
- Centralized state management
- State updates and notifications
- State persistence

#### events.js
- Custom event system
- Event subscription and publishing
- Event delegation

#### config.js
- Global configuration options
- Feature flags
- Constants

### Typing Modules

#### typing-engine.js
- Core typing test controller
- Test initialization and reset
- Test state management

#### text-display.js
- Text rendering
- Word highlighting
- Line management

#### input-handler.js
- Keyboard event handling
- Character verification
- Input processing

#### word-provider.js
- Word generation and selection
- Passage management
- Word queue

#### test-timer.js
- Timer management
- Time tracking
- Countdown functionality

#### cursor.js
- Cursor positioning
- Cursor animation
- Character targeting

#### metrics.js
- WPM calculation
- Accuracy calculation
- Performance statistics

#### mode-manager.js
- Mode selection (timed, word count)
- Mode-specific configurations
- Word count selection

### Zoro Modules

#### zoro-engine.js
- Game initialization
- Game loop
- Game state management

#### word-spawner.js
- Word generation for game mode
- Word positioning
- Spawn timing

#### render.js
- Canvas rendering
- Animation frame management
- Visual layers

#### collision.js
- Collision detection
- Boundary checking
- Hit testing

#### power-ups.js
- Power-up definitions
- Activation logic
- Cooldown management

#### difficulty.js
- Level progression
- Difficulty scaling
- Tier transitions

#### score-manager.js
- Score calculation
- Combo system
- Score display

#### effects.js
- Visual effects (slashes, flashes)
- Screen transitions
- Animation coordination

### Stats Modules

#### stats-manager.js
- Statistics tracking
- Stats calculations
- Stats display coordination

#### history.js
- History storage
- History retrieval
- Data persistence

#### charts.js
- Chart generation
- Data visualization
- Chart updates

#### tables.js
- Table rendering
- Data formatting for display
- Table interactions

#### filters.js
- Data filtering
- Search functionality
- Category management

### Utils Modules

#### dom.js
- Element creation
- Element selection
- DOM manipulation

#### audio.js
- Sound loading
- Audio playback
- Volume control

#### text.js
- Text processing
- String manipulation
- Passage handling

#### animation.js
- Animation utilities
- Timing functions
- Transitions

#### storage.js
- LocalStorage access
- Data serialization
- Cache management

#### formatters.js
- Date formatting
- Number formatting
- Text formatting

### Easter Egg Modules

#### easter-egg-manager.js
- Easter egg detection
- Coordination between triggers and effects

#### triggers.js
- Trigger conditions
- Input pattern matching
- Special condition detection

#### effects.js
- Visual effect implementations
- Sound effect coordination
- Animation timing

## Implementation Plan

### Phase 1: Setup and Core Structure (Days 1-2)
- Create directory structure
- Set up module loading system
- Implement central state management
- Extract configuration values

### Phase 2: Typing Test Refactoring (Days 3-7)
- Extract word management
- Refactor text display system
- Create input handling module
- Implement metrics calculation
- Extract timer functionality

### Phase 3: Zoro Mode Refactoring (Days 8-12)
- Extract game loop
- Refactor word spawning
- Create rendering system
- Implement power-up system
- Extract difficulty management

### Phase 4: Stats and Utils Refactoring (Days 13-16)
- Create utility modules
- Extract stats visualization
- Refactor history management
- Implement filtering system

### Phase 5: Easter Eggs (Days 17-18)
- Extract Easter egg functionality
- Implement trigger detection
- Create effect system

### Phase 6: Integration and Testing (Days 19-21)
- Ensure modules work together correctly
- Fix any integration issues
- Verify all features work as expected

## Migration Strategy

To ensure minimal disruption during refactoring:

1. **One module at a time**: Refactor one module at a time while maintaining the existing functionality
2. **Feature parity**: Ensure each refactored module provides the same functionality as the original
3. **Incremental integration**: Integrate new modules incrementally rather than all at once
4. **Thorough testing**: Test each module individually and when integrated
5. **Fallback options**: Keep original files as backups until refactoring is complete

## Pattern Implementation

### Module Pattern
```javascript
// Example module structure
const TextDisplay = (function() {
  // Private variables
  let textContainer;
  let wordElements = [];
  
  // Private functions
  function renderWord(word, index) {
    // Implementation
  }
  
  // Public API
  return {
    initialize: function(container) {
      textContainer = container;
    },
    displayWords: function(words) {
      // Implementation
    },
    updateCurrentWord: function(index) {
      // Implementation
    }
  };
})();
```

### Event System
```javascript
// Example event system
const EventBus = (function() {
  const events = {};
  
  return {
    subscribe: function(event, callback) {
      if (!events[event]) events[event] = [];
      events[event].push(callback);
    },
    publish: function(event, data) {
      if (!events[event]) return;
      events[event].forEach(callback => callback(data));
    }
  };
})();
```

### State Management
```javascript
// Example state management
const State = (function() {
  let state = {
    typing: {
      active: false,
      timeMode: true,
      wordCount: 0,
      // Other properties...
    }
    // Other state sections...
  };
  
  return {
    get: function(path) {
      // Implementation to retrieve state by path
    },
    update: function(path, value) {
      // Implementation to update state and notify subscribers
    }
  };
})();
```

## Dependency Management

The refactored system will use a simple dependency injection approach to avoid tight coupling:

```javascript
// Example dependency injection
function initializeTypingModule(dom, audio, state) {
  const typingEngine = TypeEngine(state);
  const textDisplay = TextDisplay(dom);
  const inputHandler = InputHandler(dom, typingEngine);
  
  // Configure and connect modules
  return {
    start: function() {
      // Implementation
    },
    reset: function() {
      // Implementation
    }
  };
}
```

## Testing Strategy

1. **Unit Tests**: Test individual modules in isolation
2. **Integration Tests**: Test how modules work together
3. **Functional Tests**: Test complete features from a user perspective
4. **Regression Tests**: Ensure existing functionality continues to work

## Success Criteria

The refactoring will be considered successful if:

1. All features work exactly as they did before
2. Code is organized into smaller, focused modules
3. Files have clear responsibilities
4. Duplication is minimized
5. New features can be added more easily
6. Code is more maintainable and comprehensible

## Future Extensibility

This refactoring will make it easier to:

1. Add new typing test modes
2. Implement additional power-ups in Zoro mode
3. Create new visualization options for statistics
4. Add additional Easter eggs
5. Implement user account functionality
6. Add multiplayer capabilities

## Estimated Timeline

- **Phase 1**: May 9-10, 2025
- **Phase 2**: May 11-15, 2025
- **Phase 3**: May 16-20, 2025
- **Phase 4**: May 21-24, 2025
- **Phase 5**: May 25-26, 2025
- **Phase 6**: May 27-29, 2025

Total estimated time: **21 days**

---

Document created: May 8, 2025
Last updated: May 8, 2025
Author: Aayush Acharya