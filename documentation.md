# TypeSmash Documentation 📓

## 😶‍🌫️ What's this whole thing?
TypeSmash is a typing test app that I built to help people improve their typing speed and accuracy. Clean UI, no distractions, just you and your keyboard fighting for those sweet WPM numbers. Oh, and as a last-minute addition, there's a weird One Piece-inspired mode where Zoro slashes words.

## 🧠 Architecture (fancy word for "how I organized this mess")

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
- Text generation engine (random words from dictionary)
- Real-time typing verification
- WPM and accuracy calculation
- Mode switching (time vs word count)
- Character-by-character highlighting

### 2. stats.js
The brain that keeps track of everything:
- History storage and retrieval
- Graph rendering for performance visualization
- Mode filtering (time, word, and eventually Zoro)
- Progress tracking over time

### 3. utils.js
Utility functions used throughout the app:
- Word generation helpers
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
- **Word Mode**: Type 20 words as fast as possible
  - _Previously had 10, 50, and 100 word modes that were cut_

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
- Filtering by test mode
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
zorotypinggamewords.json # Word lists for Zoro mode (added late)

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

### UI Elements
- Dynamic text display that updates as you type
- Stats overlay that shows real-time performance
- History tables and graphs
- Power-up indicators (added for Zoro mode)

### Scrapped Features
Several features were developed but ultimately removed:
- **Extended Time Tests**: 30s and 60s modes were fully implemented but removed
- **Additional Word Counts**: 10, 50, and 100 word tests were cut
- **Code Mode**: A specialized mode for typing code snippets that was abandoned due to syntax highlighting complexities
- **Custom Text Mode**: Allowing users to paste their own text (removed due to formatting issues)
- **Account System**: Login functionality was planned but never implemented

### LocalStorage Data Structure
The app saves two types of history:
- `typingHistory`: Array of regular typing test results
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
- Filterable by game mode

### Calculation Methods
Key metric calculations:
- WPM = (characters / 5) / (time in minutes)
- Accuracy = (correct keystrokes / total keystrokes) * 100
- Error Rate = (errors / total keystrokes) * 100

## 🔧 Development Notes

### Known Issues
- Mobile support is limited
- Word difficulty balance in Zoro mode needs refinement
- Stats page UI could use improvement
- Some users might experience performance issues with many falling words

### Browser Compatibility
- Works on modern browsers (Chrome, Firefox, Edge, Safari)
- Not tested on IE (because why would you?)

### Performance Considerations
- RequestAnimationFrame for smooth animations
- Limited DOM updates to prevent layout thrashing
- Canvas rendering for Zoro mode for better performance
- LocalStorage for lightweight data persistence

### Future Development Ideas
- Mobile optimization
- Custom themes
- Additional languages
- More game modes
- Account system for cross-device sync
- Multiplayer racing

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

*Documentation last updated May 6, 2025*