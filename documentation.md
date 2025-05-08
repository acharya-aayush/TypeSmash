# TypeSmash Documentation 📓

## 😶‍🌫️ What's this whole thing?
TypeSmash is a typing test app that I built to help people improve their typing speed and accuracy. Clean UI, no distractions, just you and your keyboard fighting for those sweet WPM numbers. Oh, and as a last-minute addition, there's a weird One Piece-inspired mode where Zoro slashes words.

## 🧠 Architecture

```
                    +---------------+
                    |   index.html  |
                    | (where it starts) |
                    +-------+-------+
                            |
         +------------------+------------------+
         |                  |                  |
+--------v--------+ +-------v-------+ +--------v--------+
|    main.js      | |   zoromode.js | |     stats.js    |
| (core typing)   | | (late addition)| | (numbers & stats)|
+--------+--------+ +-------+-------+ +--------+--------+
         |                  |                  |
         +------------------v------------------+
                            |
                    +-------v-------+
                    |    utils.js   |
                    | (helper functions) |
                    +---------------+
```

## 🧃 Core Modules

### 1. main.js
The heart of TypeSmash:
- Text generation engine (random words and passages)
- Real-time typing verification
- WPM and accuracy calculation
- Mode switching (time vs word count)
- Character-by-character highlighting

### 2. stats.js
The brain that keeps track of everything:
- History storage and retrieval
- Graph rendering for performance visualization
- Mode filtering (time, word with various counts, and Zoro)
- Progress tracking over time

### 3. utils.js
Utility functions used throughout the app:
- Word generation helpers
- Text passage selection from JSON collection
- Time formatting functions
- Animation utilities
- DOM manipulation helpers
- Event handler utilities

### 4. zoromode.js
The last-minute experiment that became a feature:
- Word spawning and movement
- User input matching
- Power-up system
- Difficulty progression
- Visual effects for "slashing" words

## 👾 Game Modes

### Standard Mode (The Original Plan)
The traditional typing test with two variants:
- **Time Mode**: Type as many words as possible in 15 seconds
  - _Previously had 30s and 60s modes that were removed_
- **Word Mode**: Type passages of varying lengths
  - **20 words**: Quick speed tests
  - **50 words**: Short paragraphs
  - **100 words**: Medium-length passages
  - **200 words**: Extended passages
  - **500 words**: Long-form challenges
  - **1000 words**: Marathon sessions

### Zoro Mode (The Last-Minute Addition)
This was thrown together in the final days of development:
- Words fall from the top of screen
- Type them before they hit bottom
- Get power-ups as you combo
- Progress through One Piece themed difficulty levels

## 🔥 Key Features

### Real-time Feedback
- Character-by-character highlighting
- Error indicators in red
- Dynamic cursor movement
- Instant WPM calculation

### Performance Metrics
- Words per minute (WPM) calculation
- Accuracy percentage
- Error count
- Time tracking

### History System
- Saves tests to localStorage
- Visualization through bar/line charts
- Filtering by test mode and word count
- Tracks your last 100 tests

### Power-up System (Zoro Mode)
Added during the final development phase:
- **Onigiri**: Restores one life
- **Haki**: Temporary invincibility
- **Ashura**: Clears all words on screen

### Difficulty Progression (Zoro Mode)
- **East Blue**: Simple 3-letter words
- **Paradise**: Medium 4-6 letter words
- **Warlord_Commander**: Harder 7-8 letter words
- **Yonko**: Challenging long words

## 📁 File Structure

```
index.html              # Main HTML entry point
script.js               # Initialization script
style.css               # Global styles
words_collection.json   # Collection of passages for word modes
zorotypinggamewords.json # Word lists for Zoro mode
parse_words.py          # Python script for generating words_collection.json

assets/                 # Images and media files
  ├── mainlogo.png      # Main logo
  ├── zoromodelogo.png  # Zoro mode logo (added late)
  ├── ashura.png        # Ashura effect image
  ├── zoro.mp4          # Background video for Zoro mode
  └── [favicon files]   # Various favicon files

js/                     # Core JavaScript modules
  ├── main.js           # Main typing test logic
  ├── zoromode.js       # Zoro mode implementation (added late)
  ├── stats.js          # Statistics and history tracking
  └── utils.js          # Utility functions

sounds/                 # Audio files
  ├── zorobattletheme.mp3 # Added for Zoro mode
  ├── slash1.mp3        # Word hit sound effect
  ├── slash2.mp3        # Alternative word hit sound
  ├── onigiri.mp3       # Onigiri power-up sound
  ├── haki.mp3          # Haki power-up sound
  ├── checkashura.mp3   # Ashura power-up sound
  ├── evillaugh1.mp3    # Life loss sound
  ├── KO.mp3            # Game over sound
  └── gameover.mp3      # Alternative game over sound

styles/                 # CSS stylesheets
  └── main.css          # Main stylesheet
```

## 💻 Behind the Scenes

### Game State Management
The app uses separate state objects for different features:
- `gameState`: Handles the core typing test functionality
- `statsState`: Manages the statistics and history
- `zoroState`: Added late for the Zoro mode functionality

### Enhanced Word Modes
Word mode now offers multiple options using meaningful passages:
- Uses a structured JSON collection (words_collection.json)
- Provides real paragraphs instead of random words
- Implements different word counts (20, 50, 100, 200, 500, 1000)
- Tracks stats separately for each word count

### UI Elements
- Dynamic text display that updates as you type
- Word count dropdown selector in the UI
- Stats overlay that shows real-time performance
- History tables and graphs with filtering for various word counts
- Power-up indicators (added for Zoro mode)

### Scrapped Features
Several features were developed but ultimately removed:
- **Extended Time Tests**: 30s and 60s modes were fully implemented but removed
- **Code Mode**: A specialized mode for typing code snippets that was abandoned due to syntax highlighting complexities
- **Custom Text Mode**: Allowing users to paste their own text (removed due to formatting issues)
- **Account System**: Login functionality was planned but never implemented

### LocalStorage Data Structure
The app saves two types of history:
- `typingHistory`: Array of regular typing test results with mode identifiers
- `zoroHistory`: Added later for Zoro mode results

## ⚔️ Zoro Mode Details

### Game Loop
The late-addition Zoro mode uses a requestAnimationFrame loop:

```javascript
function startZoroGameLoop() {
    let lastTimestamp = 0;
    let lastWordSpawn = 0;
    let lastPowerUpCheck = 0;
    
    const gameLoop = (timestamp) => {
        // Calculate time diff
        const elapsed = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        
        // Clear canvas
        zoroState.ctx.clearRect(0, 0, zoroState.canvas.width, zoroState.canvas.height);
        
        // Spawn words based on interval
        if (timestamp - lastWordSpawn > getSpawnInterval()) {
            spawnWord();
            lastWordSpawn = timestamp;
        }
        
        // Update word positions and check collisions
        updateWords();
        
        // Update powerup availability
        if (timestamp - lastPowerUpCheck > 1000) {
            updatePowerUps();
            lastPowerUpCheck = timestamp;
        }
        
        // Loop if game is active
        if (zoroState.active) {
            zoroState.gameLoop = requestAnimationFrame(gameLoop);
        }
    };
    
    // Start the loop
    zoroState.gameLoop = requestAnimationFrame(gameLoop);
}
```

### Word Class
Each word in Zoro mode is represented by:

```javascript
class ZoroWord {
    constructor(word, speed, direction = 'down') {
        this.word = word;
        this.display = word;
        this.x = Math.random() * (window.innerWidth - 200) + 100; // Random position
        this.y = direction === 'down' ? -50 : window.innerHeight + 50; // Start offscreen
        this.speed = speed;
        this.direction = direction;
        this.size = Math.max(16, Math.min(24, 18 + zoroState.level / 2)); // Dynamic size
        this.hit = false;
        this.opacity = 1;
        this.rotation = (Math.random() - 0.5) * 0.2; // Slight random angle
        this.color = '#b19cd9';
    }

    // Other methods for updating and drawing
}
```

## 📊 Stats System

### Data Structure
Two separate arrays for tracking different game types:
- `statsState.history`: Standard typing test results
- `statsState.zoroHistory`: Added later for Zoro mode results

### Visualization Options
- Bar charts (default view)
- Line charts (toggle option)
- Filterable by game mode and word count
- Color coding for different test modes

### Stats Display
- Stats section must be manually opened via the stats toggle button
- Manual stats viewing allows for better user control over the interface
- Deliberate decision to avoid automatic popups that might disrupt user flow
- Technical limitation: DOM event timing conflicts with stats rendering prevented reliable auto-display

### Calculation Methods
Key metric calculations:
- WPM = (characters / 5) / (time in minutes)
- Accuracy = (correct keystrokes / total keystrokes) * 100
- Error Rate = (errors / total keystrokes) * 100

## 🎵 Audio System

### Sound Management
- Dedicated audio context for handling all game sounds
- Volume controls for different sound types:
  - Background music plays at 40% volume (increased from 20%)
  - Sound effects play at 100% volume for maximum impact
- Audio suspension when game is exited to prevent memory leaks
- Preloading of audio files to ensure smooth gameplay

### Sound Effects
- Typing feedback: Two different slash sounds for variety
- Power-up activations: Unique sounds for each ability (Onigiri, Haki, Ashura)
- Game events: Level-up, difficulty tier change, game over

## 🎮 Easter Eggs

Several hidden Easter eggs have been implemented to surprise and delight users:

### Performance-Based Easter Eggs
- **Nice**: When achieving exactly 69 WPM or 69% accuracy, a special sound plays
- **Speed Demon**: Triggered when reaching 100-149 WPM with "impressive.mp3" sound
- **Godlike**: Activated at 150+ WPM with special sound effect
- **Suspicious Speed**: When reaching 200+ WPM with 98%+ accuracy, questions if you're a robot
- **Perfect Accuracy**: Plays a special sound for 100% accuracy (with substantial text)
- **Luffy Laugh**: For typing under 20 WPM, Luffy laughs at you with animation and sound

### Word-Based Easter Eggs
- **Gomu Gomu**: Typing "gomu" or "gomugomu" triggers animation and sound effect
- **Nami-swan**: Typing "nami" or "namiswan" displays Nami with berry effects

### Technical Implementation
- Easter eggs use a combination of CSS animations and JavaScript timeouts
- Animations are synchronized with sound effect durations for seamless experience
- Custom notification system displays messages when Easter eggs are triggered
- All images and animations are preloaded to ensure smooth performance

## 🏗️ Upcoming Refactoring

The codebase is being prepared for restructuring to improve maintainability:

- Breaking down large files (main.js, zoromode.js) into smaller modules
- Improving code organization with proper namespacing
- Separating concerns more effectively (UI, game logic, audio handling)
- Implementing better module loading/dependency management

This refactoring will not change functionality but will make the code more maintainable long-term.

---

## 🖤 About Me

Hey, I'm Aayush Acharya, the dev behind TypeSmash. This started as a simple typing test inspired by MonkeyType, but I got sidetracked and added a One Piece-themed game mode at the last minute (which ended up being pretty fun).

### My Tech Stack:
- HTML/CSS/JS (the classics)
- Learning React and Node
- Exploring game development concepts
- Canvas animations

### What I'm Working On:
- Improving TypeSmash (maybe adding that mobile support)
- Other web projects that may or may not see completion
- Learning new frameworks when I'm not distracted

### Find me online:
- GitHub: [github.com/acharya-aayush](https://github.com/acharya-aayush)
- LinkedIn: [linkedin.com/in/acharyaaayush](https://www.linkedin.com/in/acharyaaayush/)
- Email: acharyaaayush2k4@gmail.com

---

*Documentation last updated May 8, 2025*

## 🔄 Planned Improvement: Meaningful Passages

The next major update (v0.8.0) plans to enhance the word mode by using the actual passages from words_collection.json rather than random words. This change will:

### Concept
- Replace random word generation with meaningful, coherent passages
- Maintain nominal word count categories (20w, 50w, 100w, etc.) for UI consistency
- Handle variations between nominal and actual word counts gracefully

### Technical Implementation
- A new `getRandomPassage()` function will select complete passages from words_collection.json
- The system will track both nominal category (e.g., "50w") and actual word count
- Progress indicators will adapt to the actual number of words in the selected passage
- Statistics will categorize by nominal count while tracking actual words typed

### User Experience Improvements
- More engaging content with coherent passages instead of random words
- Realistic typing practice with proper sentences, paragraphs, and punctuation
- Dynamic progress tracking that reflects the actual text being typed
- Better preparation for real-world typing scenarios

### Edge Case Handling
- For passages shorter than their category: Tests will end at actual passage completion
- For passages longer than their category: The entire passage will be used with updated counters
- Where JSON loading fails: System will gracefully fall back to random word generation

See the [implementation_plan.md](implementation_plan.md) for detailed technical specifications of this planned update.

## 🔄 Planned Improvement: Zoro Mode Balancing (v0.8.1)

The upcoming v0.8.1 update will focus on addressing several balance and usability issues in Zoro Mode:

### Power-Up System Refinement
- **Cooldown System**: Implement time-based cooldowns for all power-ups to prevent spamming
- **Visual Indicators**: Add clear visual feedback showing cooldown status and availability
- **Balance Adjustments**: Fine-tune the effects and availability of power-ups based on game difficulty

### Ashura & Onigiri Improvements
- **Ashura Rebalance**: Modify the screen-clearing functionality to have appropriate cooldown and usage limitations
- **Onigiri Implementation**: Improve the health restoration logic to prevent exploits while maintaining usefulness
- **Visual Effects**: Enhance the visual feedback when using these abilities for better user experience

### Difficulty Progression Adjustments
- **Speed Balancing**: Adjust word falling speed in higher difficulty tiers, especially Marineford and above
- **Word Selection**: Refine the word difficulty curve to ensure a more gradual progression
- **Dynamic Difficulty**: Implement a more responsive difficulty adjustment system based on player performance

### Dedicated Statistics System
- **Separate Statistics**: Create a dedicated statistics section specifically for Zoro Mode
- **Custom Metrics**: Track specialized metrics relevant to Zoro Mode:
  - Highest combo achieved
  - Total score (separate from WPM)
  - Words destroyed count
  - Power-ups used (by type)
  - Highest level reached
  - Average survival time
- **Statistics Segregation**: Properly separate Zoro Mode data from standard typing test data in the "All" section
- **Visual Representation**: Develop unique visual charts specifically for Zoro Mode metrics

### Technical Implementation
```javascript
// Example of planned power-up cooldown system
function activatePowerUp(type) {
  const now = Date.now();
  
  // Check cooldown status
  if (now - zoroState.lastPowerUpUse[type] < zoroState.powerUpCooldowns[type]) {
    // Power-up still on cooldown
    showCooldownIndicator(type);
    return false;
  }
  
  // Activate power-up based on type
  switch(type) {
    case 'ashura':
      clearScreen();
      break;
    case 'onigiri':
      restoreHealth(1); // Limited to restore only 1 health
      break;
    case 'haki':
      activateInvincibility(5); // 5 seconds of invincibility
      break;
  }
  
  // Update cooldown timer
  zoroState.lastPowerUpUse[type] = now;
  startCooldownAnimation(type);
  
  return true;
}
```

These improvements aim to address the current imbalances in Zoro Mode while enhancing the overall gameplay experience with more refined mechanics and dedicated statistics tracking.

---

*Documentation last updated May 8, 2025*