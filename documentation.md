# TypeSmash Documentation 📓

## 😶‍🌫️ What's this whole thing?
Just a typing game I built to prove I could make something cool without sleeping for 3 days straight. Got bored of regular typing tests so I threw in a Zoro mode where you can slash words and feel like you're not wasting time on the internet.

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
| (boring part)   | | (cool part)   | | (numbers & stuff)|
+--------+--------+ +-------+-------+ +--------+--------+
         |                  |                  |
         +------------------v------------------+
                            |
                    +-------v-------+
                    |    utils.js   |
                    | (random helper stuff) |
                    +---------------+
```

Yeah I drew that ASCII diagram myself... time well spent.

## 🧃 Core Modules

### 1. main.js
Basic typing test stuff:
- Shows words
- Checks if you typed them right
- Calculates WPM and accuracy
- Nothing fancy, just the minimum viable product

### 2. zoromode.js
The fun stuff:
- Words falling across the screen
- Type them = Zoro slashes them
- Power-ups because regular typing is boring
- Difficulty gets harder as you go - just like training arcs

### 3. stats.js
For tryhards who care about their progress:
- Saves your scores to localStorage
- Makes pretty graphs of your typing speed
- Lets you filter between normal mode and Zoro mode
- Shows your history (or lack thereof)

### 4. utils.js
Random helper functions that didn't fit anywhere else:
- Word generation
- Time formatting
- Animation stuff
- DOM manipulation that I was too lazy to put in the main files

## 👾 Game Modes

### Normie Mode
Your standard typing test:
- **Time Mode**: Type for 15 seconds, see your WPM
- **Word Mode**: Type 20 words, see how fast you did it

### Zoro Mode
The actually fun part:
- Words fall from the top of screen
- Type them before they hit bottom
- Get power-ups as you combo
- Progress through One Piece themed difficulty levels
- Miss too many = game over, go train more

## 🔥 Key Features

### Real-time Feedback
- Letters highlight as you type
- Cursor moves along
- Mistakes show up in red because shame is a great motivator

### Stats Tracking
- WPM calculation
- Accuracy percentage
- Error counting
- Time tracking for the speedrun enthusiasts

### History Storage
- Saves your games so you can see if you're improving
- Graphs that make it look like I know what I'm doing
- Filter between modes to see where you suck least

### Power-up System (Zoro Mode)
- **Onigiri**: Heal one life because everyone deserves second chances
- **Haki**: Temporary invincibility because I'm feeling generous
- **Ashura**: Clear screen when you're about to rage quit

### Difficulty Tiers (Zoro Mode)
- **East Blue**: Baby mode, 3-letter words max
- **Paradise**: Medium, 4-6 letters
- **Warlord_Commander**: Hard mode, 7-8 letter monsters 
- **Yonko**: Keyboard destroyer mode, words that make you question your life choices

## 📁 File Structure

```
index.html              # The main HTML file, duh
script.js               # Starter script
style.css               # Some global styles
zorotypinggamewords.json # Where all the words live

assets/                 # Images and stuff
  ├── mainlogo.png      # Main logo
  ├── zoromodelogo.png  # Zoro mode logo
  ├── ashura.png        # For the Ashura effect
  ├── zoro.mp4          # Background video because static backgrounds are boring
  └── [favicon files]   # All those annoying browser icons

js/                    
  ├── main.js           # Basic typing test
  ├── zoromode.js       # The cool Zoro mode
  ├── stats.js          # Stats tracking
  └── utils.js          # Random helper functions

sounds/                 # Audio because silent games are depressing
  ├── zorobattletheme.mp3 # Epic background music
  ├── slash1.mp3        # Slash sound
  ├── slash2.mp3        # Alternative slash sound because variety
  ├── onigiri.mp3       # Onigiri power-up sound
  ├── haki.mp3          # Haki power-up sound
  ├── checkashura.mp3   # Ashura power-up sound
  ├── evillaugh1.mp3    # When you lose life
  ├── KO.mp3            # Game over sound
  └── gameover.mp3      # Alternative game over sound

styles/                 # CSS files
  └── main.css          # Main styles
```

## 💻 Behind the Scenes

### Game State
I separated the state into different objects because I'm a clean code advocate (sometimes):
- `gameState`: For the boring typing test
- `zoroState`: For the cool Zoro mode
- `statsState`: For all the numbers and graphs

### UI Elements
Everything gets created dynamically because I'm too lazy to write all that HTML:
- Text display
- Stats overlay
- History tables
- Power-up indicators

### Event Listeners
- Keyboard listeners for typing
- Button clicks for switching modes
- Custom events because I wanted to overcomplicate things

### LocalStorage
Everything gets saved locally so you can close the tab without losing progress:
- Typing history
- Zoro mode scores
- Preferences (if I ever add them)

## ⚔️ Zoro Mode Details

### Game Loop
Here's how the Zoro mode runs:

```javascript
function startZoroGameLoop() {
    let lastTimestamp = 0;
    let lastWordSpawn = 0;
    let lastPowerUpCheck = 0;
    
    const gameLoop = (timestamp) => {
        // Calculate time stuff
        const elapsed = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        
        // Clear canvas because we're not savages
        zoroState.ctx.clearRect(0, 0, zoroState.canvas.width, zoroState.canvas.height);
        
        // Spawn words at intervals
        if (timestamp - lastWordSpawn > getSpawnInterval()) {
            spawnWord();
            lastWordSpawn = timestamp;
        }
        
        // Update and draw words
        updateWords();
        
        // Check powerups every second
        if (timestamp - lastPowerUpCheck > 1000) {
            updatePowerUps();
            lastPowerUpCheck = timestamp;
        }
        
        // Keep the loop going if game is still active
        if (zoroState.active) {
            zoroState.gameLoop = requestAnimationFrame(gameLoop);
        }
    };
    
    // Start the loop
    zoroState.gameLoop = requestAnimationFrame(gameLoop);
}
```

### Word Objects
Each word in Zoro mode is its own little entity:

```javascript
class ZoroWord {
    constructor(word, speed, direction = 'down') {
        this.word = word;
        this.display = word;
        this.x = Math.random() * (window.innerWidth - 200) + 100; // Random horizontal position
        this.y = direction === 'down' ? -50 : window.innerHeight + 50; // Start above or below screen
        this.speed = speed;
        this.direction = direction; // 'down' or 'up'
        this.size = Math.max(16, Math.min(24, 18 + zoroState.level / 2)); // Size based on level
        this.hit = false;
        this.opacity = 1;
        this.rotation = (Math.random() - 0.5) * 0.2; // Slight random rotation
        this.color = '#b19cd9'; // Purple because it looks cool
    }

    // Rest of the methods...
}
```

### Difficulty Progression
Four tiers of pain:
1. **East Blue**: Training wheels mode
2. **Paradise**: Getting somewhat serious
3. **Warlord_Commander**: Now we're talking
4. **Yonko**: Pain and suffering

Score thresholds: 0, 3000, 8000, 15000 (I totally balanced these... trust me)

### Power-ups
Because typing the same way for too long gets boring:
- **Onigiri**: Get a life (literally)
- **Haki**: Become invincible for 15 seconds
- **Ashura**: Destroy all words on screen when you're overwhelmed

## 📊 Stats System

### Data Structure
Two arrays for different game modes:
- `statsState.history`: For normal typing tests
- `statsState.zoroHistory`: For Zoro mode games

### Visualization
Two ways to look at your data:
- Bar charts (default)
- Line charts (for people who prefer lines)

### Storage
All saved to localStorage:
- `typingHistory`: Normal mode history
- `zoroHistory`: Zoro mode history

## 🔧 Utils and Helpers

### Word Generation
Words come from:
- Default list for normal mode
- JSON file with themed words for Zoro mode

### WPM Calculation
```javascript
// WPM = (characters / 5) / (time in minutes)
// Because 5 characters = 1 word, apparently
```

### Animations
- CSS animations for UI
- Canvas animations for Zoro mode
- Custom effects that I spent way too long on

## 😤 Development Notes

### Adding New Features
If you want to add stuff:
1. Figure out which module it belongs in
2. Update the state object
3. Write the feature
4. Update UI
5. Add event handlers
6. Update this doc (or don't, I'm not your boss)

### Browser Support
Works on modern browsers because I'm not supporting IE11 in 2025:
- Chrome/Edge/Firefox/Safari should work
- If you're using something else, why?

### Performance
Some tips if you're optimizing:
- Use requestAnimationFrame
- Don't go crazy with DOM updates
- Canvas is pretty fast
- Fonts are render-expensive (learned that the hard way)

---

## 🖤 About Me

Hey, I'm Aayush Acharya, the sleep-deprived dev who built this while binging One Piece for the third time. TypeSmash started as a "I bet I could build that" project and somehow turned into an actual thing with working code.

### My Tech Stack:
- HTML/CSS/JS (because idk, Am getting called out here soyeah)
- Currently learning React (when I'm not distracted by side projects or exams)
- Some backend stuff with Node (but frontend is where the fun is)
- Excessive amounts of caffeine

### What I'm Working On:
- Making this typing game not crash on mobile
- Adding more features to Zoro mode (maybe other character modes?)
- Learning enough to get a job that pays more than my current one
- Balancing sleep and coding (failing at this one)

### Find me online:
- GitHub: [github.com/acharya-aayush](https://github.com/acharya-aayush)
- LinkedIn: [linkedin.com/in/acharyaaayush](https://www.linkedin.com/in/acharyaaayush/)
- Or just email me if you found that somewhere

---

*Last updated May 6, 2025 while procrastinating on other projects*