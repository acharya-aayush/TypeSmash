// Zoro Mode Module - Enhanced Typing Game with Zoro Theme
window.zoroModule = (function() {
    // Game state
    const zoroState = {
        active: false,
        level: 1,
        score: 0,
        combo: 0,
        maxCombo: 0,
        lives: 3,
        words: [],
        currentWord: "",
        wordList: [],
        timer: null,
        gameSpeed: 1000, // Word spawn rate in ms
        wordSpeed: 1.5,  // Speed at which words fall
        spawnTimer: null,
        gameActive: false,
        audioContext: null,
        sounds: {},
        background: null,
        activePowerUp: null,
        powerUpTimers: {
            onigiri: null,
            haki: null
        },
        hakiActive: false,
        ashuraActive: false,
        lastSuccessTime: Date.now(),
        gameStartTime: 0,
        difficultyTier: 'East Blue'
    };

    // DOM Elements
    let zoroContainer, zoroCanvas, ctx, zoroInput, zoroLives, zoroPowerUps, zoroScoreDisplay, comboDisplay;
    
    // Constants
    const ZORO_TRIGGER = "zoro";
    const POWER_UP_THRESHOLD = {
        ONIGIRI: 100,  // Reduced from 150
        HAKI: 200,     // Reduced from 300
        ASHURA: 350    // Reduced from 500
    };
    const DIFFICULTY_TIERS = [
        {name: 'East Blue', threshold: 0, color: '#4a90e2'},
        {name: 'Alabasta', threshold: 500, color: '#e9c46a'},
        {name: 'Skypiea', threshold: 1000, color: '#f4a261'},
        {name: 'Water 7', threshold: 2000, color: '#2a9d8f'},
        {name: 'Enies Lobby', threshold: 3000, color: '#e76f51'},
        {name: 'Thriller Bark', threshold: 4000, color: '#6d597a'},
        {name: 'Sabaody', threshold: 5000, color: '#b56576'},
        {name: 'Marineford', threshold: 7500, color: '#e63946'},
        {name: 'Fish-Man Island', threshold: 10000, color: '#06d6a0'},
        {name: 'Dressrosa', threshold: 15000, color: '#bc6c25'},
        {name: 'Whole Cake Island', threshold: 20000, color: '#ff70a6'},
        {name: 'Wano', threshold: 25000, color: '#9b5de5'},
        {name: 'Laugh Tale', threshold: 30000, color: '#ffd700'}
    ];
    
    // ZoroWord class - for the falling words in Zoro Mode
    class ZoroWord {
        constructor(word, speed) {
            this.word = word;
            this.speed = speed;
            this.hit = false;
            this.hitAnimation = 0;
            this.fontSize = 20 + Math.floor(Math.random() * 10); // Randomize font size a bit
            
            // Position the word randomly
            this.x = Math.random() * (zoroCanvas.width - 200) + 100;
            this.y = -50; // Start above the screen
            
            // Random direction (slightly angled)
            this.angle = (Math.random() - 0.5) * 0.5;
            this.dx = Math.sin(this.angle) * this.speed;
            this.dy = Math.cos(this.angle) * this.speed;
            
            // Color based on word length (harder words are more dangerous)
            if (word.length <= 3) {
                this.color = '#4a90e2'; // Easy: Blue
            } else if (word.length <= 6) {
                this.color = '#e9c46a'; // Medium: Gold
            } else {
                this.color = '#e63946'; // Hard: Red
            }
        }
        
        update() {
            // If hit, do hit animation and return true to remove
            if (this.hit) {
                this.hitAnimation++;
                return this.hitAnimation > 10;
            }
            
            // Update position
            this.x += this.dx;
            this.y += this.dy;
            
            // Bounce off walls
            if (this.x < 0 || this.x > zoroCanvas.width - 100) {
                this.dx = -this.dx;
            }
            
            // Return false to keep in the array
            return false;
        }
        
        draw(ctx) {
            // Don't draw if hit animation is done
            if (this.hit && this.hitAnimation > 10) return;
            
            // Save context
            ctx.save();
            
            // Set font
            ctx.font = `${this.fontSize}px 'Helvetica', sans-serif`;
            ctx.fillStyle = this.hit ? '#ff0000' : this.color;
            ctx.textAlign = 'center';
            
            // Apply hit animation
            if (this.hit) {
                // Flash and fade out
                ctx.globalAlpha = 1 - (this.hitAnimation / 10);
                ctx.shadowColor = '#ff0000';
                ctx.shadowBlur = 10;
                
                // Scale up when hit
                const scale = 1 + (this.hitAnimation / 5);
                ctx.translate(this.x, this.y);
                ctx.scale(scale, scale);
                ctx.translate(-this.x, -this.y);
            } else if (zoroState.hakiActive) {
                // Add Haki effect (slight glow and slow-mo appearance)
                ctx.shadowColor = '#000000';
                ctx.shadowBlur = 5;
            }
            
            // Draw text
            ctx.fillText(this.word, this.x, this.y);
            
            // Restore context
            ctx.restore();
        }
        
        isOffScreen() {
            return this.y > zoroCanvas.height + 50;
        }
    }
    
    // Initialize the module
    function init() {
        preloadWordList();
        console.log("Zoro mode initialized and ready");
    }
    
    // Preload words for Zoro Mode
    function preloadWordList() {
        // Use available word collection or fetch words
        fetch('zorotypinggamewords.json')
            .then(response => response.json())
            .then(data => {
                zoroState.wordList = data;
                console.log("Zoro mode: Word collection loaded from zorotypinggamewords.json");
            })
            .catch(error => {
                console.error('Error loading word list for Zoro Mode:', error);
                // Default word list if fetch fails
                zoroState.wordList = {
                    "East Blue": [
                        "zoro", "sword", "cut", "hit", "run", "win", "tag", "rip"
                    ]
                };
                console.log("Zoro mode: Using fallback word list");
            });
    }
    
    // Check if input is the Zoro Mode trigger sequence
    function isZoroTriggerSequence(input) {
        return input.toLowerCase() === ZORO_TRIGGER;
    }

    // Activate Zoro Mode
    function activate() {
        console.log("Attempting to activate Zoro Mode...");
        
        if (zoroState.active) {
            console.log("Zoro Mode is already active");
            return;
        }
        
        zoroState.active = true;
        console.log("Zoro Mode activated!");
        
        // Create Zoro Mode container
        zoroContainer = document.createElement('div');
        zoroContainer.id = 'zoro-container';
        zoroContainer.className = 'zoro-container';
        
        // Add background video
        const bgVideo = document.createElement('video');
        bgVideo.className = 'zoro-bg-video';
        bgVideo.src = 'assets/zoro.mp4';
        bgVideo.autoplay = true;
        bgVideo.loop = true;
        bgVideo.muted = true;
        bgVideo.playsInline = true;
        
        // Add canvas for word rendering
        zoroCanvas = document.createElement('canvas');
        zoroCanvas.id = 'zoro-canvas';
        
        // Add score display in the bottom-right corner
        zoroScoreDisplay = document.createElement('div');
        zoroScoreDisplay.className = 'zoro-score-display';
        zoroScoreDisplay.innerHTML = `
            <div class="level-indicator">Level ${zoroState.level}</div>
            <div class="score-line">
                <span>Score:</span>
                <span class="stat-value" id="zoro-score">0</span>
            </div>
            <div class="score-line">
                <span>Combo:</span>
                <span class="stat-value" id="zoro-combo">0</span>
            </div>
            <div class="score-line">
                <span>Level:</span>
                <span class="stat-value" id="zoro-difficulty">East Blue</span>
            </div>
        `;
        
        // Add lives display
        zoroLives = document.createElement('div');
        zoroLives.className = 'zoro-lives';
        updateLives();
        
        // Add power-ups display
        zoroPowerUps = document.createElement('div');
        zoroPowerUps.className = 'zoro-power-ups';
        zoroPowerUps.innerHTML = `
            <div class="power-up" id="onigiri-power">
                <span class="power-icon">⚡</span>
                <span class="power-name">Onigiri (${POWER_UP_THRESHOLD.ONIGIRI})</span>
            </div>
            <div class="power-up" id="haki-power">
                <span class="power-icon">👁️</span>
                <span class="power-name">Haki (${POWER_UP_THRESHOLD.HAKI})</span>
            </div>
            <div class="power-up" id="ashura-power">
                <span class="power-icon">👹</span>
                <span class="power-name">Ashura (${POWER_UP_THRESHOLD.ASHURA})</span>
            </div>
        `;
        
        // Add combo display
        comboDisplay = document.createElement('div');
        comboDisplay.className = 'zoro-combo';
        comboDisplay.innerHTML = `
            <div class="combo-count" id="combo-count">0</div>
            <div class="combo-label">COMBO</div>
        `;
        
        // Add input area
        const inputArea = document.createElement('div');
        inputArea.className = 'zoro-ui';
        
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'zoro-input-area';
        
        zoroInput = document.createElement('input');
        zoroInput.id = 'zoro-input';
        zoroInput.type = 'text';
        zoroInput.placeholder = 'Type the words to slash them...';
        zoroInput.autocomplete = 'off';
        zoroInput.autofocus = true;
        
        const exitButton = document.createElement('button');
        exitButton.className = 'zoro-exit-btn';
        exitButton.textContent = 'Exit Zoro Mode';
        exitButton.addEventListener('click', deactivate);
        
        // Assemble the DOM structure
        inputWrapper.appendChild(zoroInput);
        inputArea.appendChild(inputWrapper);
        inputArea.appendChild(exitButton);
        
        zoroContainer.appendChild(bgVideo);
        zoroContainer.appendChild(zoroCanvas);
        zoroContainer.appendChild(zoroScoreDisplay);
        zoroContainer.appendChild(zoroLives);
        zoroContainer.appendChild(zoroPowerUps);
        zoroContainer.appendChild(comboDisplay);
        zoroContainer.appendChild(inputArea);
        
        document.body.appendChild(zoroContainer);
        document.body.classList.add('zoro-active');
        
        // Initialize canvas
        setupCanvas();
        
        // Set up event listeners
        setupEventListeners();
        
        // Start the game
        startGame();
        
        // Initialize audio
        initAudio();
        
        // Play background music
        playSound('zorobattletheme', true);
        
        // Debug info
        console.log("Zoro Mode UI elements created and added to document");
    }
    
    // Update lives UI
    function updateLives() {
        if (!zoroLives) return;
        
        // Create lives display
        let livesHTML = '';
        for (let i = 0; i < zoroState.lives; i++) {
            livesHTML += '<span class="zoro-life">🗡️</span>';
        }
        zoroLives.innerHTML = livesHTML;
    }
    
    // Deactivate Zoro Mode
    function deactivate() {
        if (!zoroState.active) return;
        
        // Stop all audio
        stopAllSounds();
        
        // Remove from DOM
        if (zoroContainer && zoroContainer.parentNode) {
            zoroContainer.parentNode.removeChild(zoroContainer);
        }
        
        // Clear timers
        if (zoroState.spawnTimer) {
            clearInterval(zoroState.spawnTimer);
            zoroState.spawnTimer = null;
        }
        
        document.body.classList.remove('zoro-active');
        
        // Reset state
        zoroState.active = false;
        zoroState.gameActive = false;
        
        console.log("Zoro Mode deactivated");
        
        // Refocus on main input
        setTimeout(() => {
            const mainInput = document.getElementById('hidden-input');
            if (mainInput) {
                mainInput.focus();
            }
        }, 100);
    }
    
    // Stop all sounds
    function stopAllSounds() {
        // Implementation would depend on your audio setup
        // This is a placeholder for the actual implementation
        if (zoroState.audioContext) {
            zoroState.audioContext.suspend();
        }
    }
    
    // Setup canvas and context
    function setupCanvas() {
        zoroCanvas.width = window.innerWidth;
        zoroCanvas.height = window.innerHeight;
        ctx = zoroCanvas.getContext('2d');
        
        // Handle resize
        window.addEventListener('resize', () => {
            zoroCanvas.width = window.innerWidth;
            zoroCanvas.height = window.innerHeight;
        });
    }
    
    // Set up event listeners for the game
    function setupEventListeners() {
        zoroInput.addEventListener('input', handleInput);
        
        // Handle key presses for power-ups
        document.addEventListener('keydown', (e) => {
            if (!zoroState.active) return;
            
            // Number keys for power-ups
            if (e.key === '1' && canActivatePowerUp('onigiri')) {
                activatePowerUp('onigiri');
            } else if (e.key === '2' && canActivatePowerUp('haki')) {
                activatePowerUp('haki');
            } else if (e.key === '3' && canActivatePowerUp('ashura')) {
                activatePowerUp('ashura');
            }
        });
        
        // Add click events for power-ups
        document.getElementById('onigiri-power').addEventListener('click', () => {
            if (canActivatePowerUp('onigiri')) {
                activatePowerUp('onigiri');
            }
        });
        
        document.getElementById('haki-power').addEventListener('click', () => {
            if (canActivatePowerUp('haki')) {
                activatePowerUp('haki');
            }
        });
        
        document.getElementById('ashura-power').addEventListener('click', () => {
            if (canActivatePowerUp('ashura')) {
                activatePowerUp('ashura');
            }
        });
    }
    
    // Initialize audio context and load sounds
    function initAudio() {
        try {
            zoroState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Load sound effects
            loadSound('slash1', 'sounds/slash1.mp3');
            loadSound('slash2', 'sounds/slash2.mp3');
            loadSound('gameover', 'sounds/gameover.mp3');
            loadSound('onigiri', 'sounds/onigiri.mp3');
            loadSound('haki', 'sounds/haki.mp3');
            loadSound('checkashura', 'sounds/checkashura.mp3');
            loadSound('evillaugh1', 'sounds/evillaugh1.mp3');
            loadSound('KO', 'sounds/KO.mp3');
            loadSound('zorobattletheme', 'sounds/zorobattletheme.mp3');
            loadSound('levelup', 'sounds/levelup.mp3');
        } catch (e) {
            console.error('Web Audio API is not supported in this browser');
        }
    }
    
    // Load a sound file
    function loadSound(id, url) {
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => zoroState.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                zoroState.sounds[id] = audioBuffer;
            })
            .catch(error => console.error('Error loading sound:', error));
    }
    
    // Play a sound
    function playSound(id, loop = false) {
        if (!zoroState.audioContext || !zoroState.sounds[id]) {
            console.log(`Could not play sound: ${id} - not loaded`);
            return;
        }
        
        const source = zoroState.audioContext.createBufferSource();
        source.buffer = zoroState.sounds[id];
        
        // Create a gain node to control volume
        const gainNode = zoroState.audioContext.createGain();
        
        // Set lower volume specifically for background music
        if (id === 'zorobattletheme') {
            gainNode.gain.value = 0.2; // 20% volume for background music
        } else {
            gainNode.gain.value = 1.0; // 100% volume for other sounds
        }
        
        // Connect the source to the gain node, and the gain node to the output
        source.connect(gainNode);
        gainNode.connect(zoroState.audioContext.destination);
        source.loop = loop;
        
        try {
            source.start(0);
            return source; // Return the source to stop it later if needed
        } catch (e) {
            console.error('Error playing sound:', e);
        }
    }
    
    // Start Zoro Mode game
    function startGame() {
        // Reset game state
        zoroState.level = 1;
        zoroState.score = 0;
        zoroState.combo = 0;
        zoroState.maxCombo = 0;
        zoroState.lives = 3;
        zoroState.words = [];
        zoroState.gameActive = true;
        zoroState.hakiActive = false;
        zoroState.ashuraActive = false;
        zoroState.gameSpeed = 1000;
        zoroState.wordSpeed = 1.5;
        zoroState.gameStartTime = Date.now();
        zoroState.difficultyTier = 'East Blue';
        
        // Initialize game loop
        gameLoop();
        
        // Start spawning words
        startSpawningWords();
        
        // Focus on input
        setTimeout(() => {
            zoroInput.focus();
        }, 100);
        
        // Update UI
        updateScoreDisplay();
        updateComboDisplay();
        checkPowerUps();
    }
    
    // Main game loop
    function gameLoop() {
        if (!zoroState.gameActive) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, zoroCanvas.width, zoroCanvas.height);
        
        // Update and draw words
        updateWords();
        
        // Check for game over conditions
        if (zoroState.lives <= 0) {
            gameOver();
            return;
        }
        
        // Request next animation frame
        requestAnimationFrame(gameLoop);
    }
    
    // Start spawning words
    function startSpawningWords() {
        // Clear previous timer if any
        if (zoroState.spawnTimer) {
            clearInterval(zoroState.spawnTimer);
        }
        
        // Set up new spawn timer
        zoroState.spawnTimer = setInterval(() => {
            if (zoroState.gameActive) {
                spawnWord();
            }
        }, zoroState.gameSpeed);
    }
    
    // Spawn a new word
    function spawnWord() {
        // Get a random word
        const randomWord = getRandomWord();
        
        // Create word object with random position and direction
        const word = new ZoroWord(
            randomWord,
            zoroState.wordSpeed + Math.random() * 0.5, // Add some randomness to speed
        );
        
        // Add to words array
        zoroState.words.push(word);
    }
    
    // Update words
    function updateWords() {
        // Update each word
        for (let i = zoroState.words.length - 1; i >= 0; i--) {
            const word = zoroState.words[i];
            
            // Update word position
            const shouldRemove = word.update();
            
            // Draw word
            word.draw(ctx);
            
            // Check if word is off screen
            if (shouldRemove || word.isOffScreen()) {
                // If word wasn't hit and fell to the floor, lose a life
                if (!word.hit && word.isOffScreen()) {
                    loseLife();
                    createFlashEffect();
                }
                
                // Remove word
                zoroState.words.splice(i, 1);
            }
        }
    }
    
    // Handle input
    function handleInput(e) {
        const input = zoroInput.value.trim().toLowerCase();
        
        // Check for power-up activation via typing with improved detection
        if (input === "onigiri" || input === "1") {
            if (canActivatePowerUp('onigiri')) {
                activatePowerUp('onigiri');
                zoroInput.value = '';
                return;
            }
        } else if (input === "haki" || input === "2") {
            if (canActivatePowerUp('haki')) {
                activatePowerUp('haki');
                zoroInput.value = '';
                return;
            }
        } else if (input === "ashura" || input === "3") {
            if (canActivatePowerUp('ashura')) {
                activatePowerUp('ashura');
                zoroInput.value = '';
                return;
            }
        }
        
        // Check if input matches any words
        for (let i = 0; i < zoroState.words.length; i++) {
            const word = zoroState.words[i];
            
            if (word.word.toLowerCase() === input && !word.hit) {
                // Mark word as hit
                word.hit = true;
                
                // Clear input
                zoroInput.value = '';
                
                // Increase score
                addScore(word.word.length * 10);
                
                // Increase combo
                increaseCombo();
                
                // Play slash sound
                const slashSound = Math.random() > 0.5 ? 'slash1' : 'slash2';
                playSound(slashSound);
                
                // Create slash effect at word position
                createSlashEffect(word.x, word.y);
                
                // Record successful hit time
                zoroState.lastSuccessTime = Date.now();
                
                return;
            }
        }
    }
    
    // Add score
    function addScore(points) {
        // Apply combo multiplier
        const comboMultiplier = 1 + (zoroState.combo / 10);
        const finalPoints = Math.floor(points * comboMultiplier);
        
        zoroState.score += finalPoints;
        
        // Update UI immediately to ensure score is displayed correctly
        document.getElementById('zoro-score').textContent = zoroState.score;
        
        // Check for level up
        checkLevelUp();
        
        // Check for difficulty tier change
        checkDifficultyTier();
        
        // Update UI
        updateScoreDisplay();
        
        // Check if power-ups are available
        checkPowerUps();
    }
    
    // Increase combo
    function increaseCombo() {
        zoroState.combo++;
        zoroState.maxCombo = Math.max(zoroState.maxCombo, zoroState.combo);
        
        // Update UI with animation
        updateComboDisplay(true);
        
        // Check power-ups after combo increases
        checkPowerUps();
    }
    
    // Reset combo if too much time has passed
    function checkComboTimeout() {
        // If more than 3 seconds since last hit, reset combo
        const now = Date.now();
        if (now - zoroState.lastSuccessTime > 3000 && zoroState.combo > 0) {
            zoroState.combo = 0;
            updateComboDisplay();
        }
    }
    
    // Check for level up
    function checkLevelUp() {
        // Level up every 500 points
        const newLevel = Math.floor(zoroState.score / 500) + 1;
        
        if (newLevel > zoroState.level) {
            // Level up
            zoroState.level = newLevel;
            
            // Keep speed constant until level 10, then start increasing
            if (newLevel >= 10) {
                // After level 10, gradually make the game harder
                zoroState.gameSpeed = Math.max(400, 1000 - (newLevel - 10) * 50);
                zoroState.wordSpeed = Math.min(4, 1.5 + (newLevel - 10) * 0.2);
            } else {
                // For early levels (1-10), maintain an easy, consistent speed
                zoroState.gameSpeed = 1500 - (newLevel * 30); // Gradually decrease spawn time (more words)
                zoroState.wordSpeed = 0.8 + (newLevel * 0.05); // Very gradually increase word fall speed
            }
            
            // Restart spawning with new speed
            startSpawningWords();
            
            // Update UI
            updateScoreDisplay();
            
            // Play level up sound
            playSound('slash2');
        }
    }
    
    // Check for difficulty tier change
    function checkDifficultyTier() {
        // Find the highest tier that the player has surpassed
        let newTier = null;
        let newTierColor = null;
        
        for (let i = DIFFICULTY_TIERS.length - 1; i >= 0; i--) {
            if (zoroState.score >= DIFFICULTY_TIERS[i].threshold) {
                newTier = DIFFICULTY_TIERS[i].name;
                newTierColor = DIFFICULTY_TIERS[i].color;
                break;
            }
        }
        
        // If tier changed, update and show animation
        if (newTier && newTier !== zoroState.difficultyTier) {
            zoroState.difficultyTier = newTier;
            
            // Update UI
            document.getElementById('zoro-difficulty').textContent = newTier;
            document.getElementById('zoro-difficulty').style.color = newTierColor;
            
            // Create tier transition effect
            showDifficultyTransition(newTier, newTierColor);
            
            // Play tier up sound
            playSound('levelup');
        }
    }
    
    // Show difficulty tier transition effect
    function showDifficultyTransition(tierName, color) {
        // Create transition element
        const transition = document.createElement('div');
        transition.className = 'zoro-difficulty-transition';
        transition.style.color = color;
        transition.textContent = tierName;
        
        // Style the transition
        transition.style.position = 'absolute';
        transition.style.top = '50%';
        transition.style.left = '50%';
        transition.style.transform = 'translate(-50%, -50%)';
        transition.style.fontSize = '5rem';
        transition.style.fontWeight = 'bold';
        transition.style.textShadow = `0 0 10px ${color}`;
        transition.style.zIndex = '1050';
        
        // Add to container
        zoroContainer.appendChild(transition);
        
        // Remove after animation completes
        setTimeout(() => {
            transition.remove();
        }, 3000);
    }
    
    // Update the score display
    function updateScoreDisplay() {
        if (!zoroScoreDisplay) return;
        
        // Make sure the score is visible and properly updated in all UI elements
        document.querySelector('.level-indicator').textContent = `Level ${zoroState.level}`;
        
        // Update all possible score elements to ensure consistency
        const scoreElements = document.querySelectorAll('#zoro-score, .stat-value[id="zoro-score"]');
        scoreElements.forEach(element => {
            if (element) element.textContent = zoroState.score;
        });
        
        document.getElementById('zoro-combo').textContent = zoroState.combo;
        document.getElementById('zoro-difficulty').textContent = zoroState.difficultyTier;
        
        // Force reflow to ensure UI updates are rendered
        zoroScoreDisplay.style.display = 'none';
        zoroScoreDisplay.offsetHeight; // Force reflow
        zoroScoreDisplay.style.display = 'block';
        
        // Also update the powerup display to reflect changes
        checkPowerUps();
    }
    
    // Update combo display
    function updateComboDisplay(animate = false) {
        if (!comboDisplay) return;
        
        const comboCountElement = document.getElementById('combo-count');
        comboCountElement.textContent = zoroState.combo;
        
        if (animate && zoroState.combo > 1) {
            comboCountElement.classList.add('combo-update');
            setTimeout(() => {
                comboCountElement.classList.remove('combo-update');
            }, 300);
        }
    }
    
    // Create slash effect
    function createSlashEffect(x, y) {
        const slash = document.createElement('div');
        slash.className = 'sword-slash';
        slash.style.left = `${x}px`;
        slash.style.top = `${y}px`;
        
        zoroContainer.appendChild(slash);
        
        // Remove after animation completes
        setTimeout(() => {
            slash.remove();
        }, 500);
    }
    
    // Create screen flash effect
    function createFlashEffect() {
        zoroCanvas.classList.add('flash');
        
        setTimeout(() => {
            zoroCanvas.classList.remove('flash');
        }, 500);
    }
    
    // Check if power-ups are available
    function checkPowerUps() {
        // Check Onigiri power-up
        const onigiriPower = document.getElementById('onigiri-power');
        if (zoroState.score >= POWER_UP_THRESHOLD.ONIGIRI) {
            onigiriPower.classList.add('available');
        } else {
            onigiriPower.classList.remove('available');
        }
        
        // Check Haki power-up
        const hakiPower = document.getElementById('haki-power');
        if (zoroState.score >= POWER_UP_THRESHOLD.HAKI) {
            hakiPower.classList.add('available');
        } else {
            hakiPower.classList.remove('available');
        }
        
        // Check Ashura power-up
        const ashuraPower = document.getElementById('ashura-power');
        if (zoroState.score >= POWER_UP_THRESHOLD.ASHURA) {
            ashuraPower.classList.add('available');
        } else {
            ashuraPower.classList.remove('available');
        }
    }
    
    // Check if a power-up can be activated
    function canActivatePowerUp(powerUp) {
        switch (powerUp) {
            case 'onigiri':
                return zoroState.score >= POWER_UP_THRESHOLD.ONIGIRI;
            case 'haki':
                return zoroState.score >= POWER_UP_THRESHOLD.HAKI && !zoroState.hakiActive;
            case 'ashura':
                return zoroState.score >= POWER_UP_THRESHOLD.ASHURA && !zoroState.ashuraActive;
            default:
                return false;
        }
    }
    
    // Activate a power-up
    function activatePowerUp(powerUp) {
        switch (powerUp) {
            case 'onigiri':
                activateOnigiri();
                break;
            case 'haki':
                activateHaki();
                break;
            case 'ashura':
                activateAshura();
                break;
        }
    }
    
    // Activate Onigiri power-up
    function activateOnigiri() {
        // Clear all words and add score
        const wordCount = zoroState.words.length;
        
        // Play onigiri sound
        playSound('onigiri');
        
        // Add score for each word
        zoroState.words.forEach(word => {
            addScore(word.word.length * 15);
            
            // Create slash effect at word position
            createSlashEffect(word.x, word.y);
        });
        
        // Clear words
        zoroState.words = [];
        
        // Add flash effect
        zoroCanvas.classList.add('onigiri-flash');
        setTimeout(() => {
            zoroCanvas.classList.remove('onigiri-flash');
        }, 500);
        
        // Use the power-up
        zoroState.score -= POWER_UP_THRESHOLD.ONIGIRI;
        updateScoreDisplay();
        
        // Check power-ups after using one
        checkPowerUps();
    }
    
    // Activate Haki power-up
    function activateHaki() {
        // Slow down all words
        zoroState.hakiActive = true;
        
        // Play haki sound
        playSound('haki');
        
        // Apply slow effect to all words
        zoroState.words.forEach(word => {
            word.speed *= 0.5;
        });
        
        // Add haki visual effect
        zoroCanvas.classList.add('haki-active');
        
        // Use the power-up
        zoroState.score -= POWER_UP_THRESHOLD.HAKI;
        updateScoreDisplay();
        
        // Reset after 10 seconds
        zoroState.powerUpTimers.haki = setTimeout(() => {
            zoroState.hakiActive = false;
            zoroCanvas.classList.remove('haki-active');
            checkPowerUps();
        }, 10000);
        
        // Check power-ups after using one
        checkPowerUps();
    }
    
    // Activate Ashura power-up
    function activateAshura() {
        // Create clones to help with typing
        zoroState.ashuraActive = true;
        
        // Play ashura sound
        playSound('checkashura');
        
        // Create visual effect for ashura activation
        createAshuraEffect();
        
        // Use the power-up
        zoroState.score -= POWER_UP_THRESHOLD.ASHURA;
        updateScoreDisplay();
        
        // Auto-complete words for 5 seconds
        const ashuraInterval = setInterval(() => {
            if (zoroState.words.length > 0 && zoroState.gameActive) {
                // Get a random word (more realistic behavior than just first word)
                const randomIndex = Math.floor(Math.random() * zoroState.words.length);
                const word = zoroState.words[randomIndex];
                
                // Mark as hit
                word.hit = true;
                
                // Add score
                addScore(word.word.length * 8);
                
                // Create slash effect
                createSlashEffect(word.x, word.y);
                
                // Increase combo
                increaseCombo();
                
                // Play slash sound
                const slashSound = Math.random() > 0.5 ? 'slash1' : 'slash2';
                playSound(slashSound);
            }
        }, 500);
        
        // Reset after 5 seconds
        setTimeout(() => {
            clearInterval(ashuraInterval);
            zoroState.ashuraActive = false;
            checkPowerUps();
            
            // Special sound effect when Ashura ends
            playSound('evillaugh1');
        }, 5000);
        
        // Check power-ups after using one
        checkPowerUps();
    }
    
    // Create Ashura effect
    function createAshuraEffect() {
        // Create ashura clones container
        const ashuraClones = document.createElement('div');
        ashuraClones.className = 'ashura-clones';
        
        // Add clone elements
        for (let i = 0; i < 9; i++) {
            const clone = document.createElement('div');
            clone.className = 'ashura-clone';
            
            // Randomize position slightly
            clone.style.transform = `translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 20}px)`;
            
            ashuraClones.appendChild(clone);
        }
        
        zoroContainer.appendChild(ashuraClones);
        
        // Remove after animation completes
        setTimeout(() => {
            ashuraClones.remove();
        }, 3000);
    }
    
    // Lose a life
    function loseLife() {
        zoroState.lives--;
        
        // Play hit sound
        playSound('KO');
        
        // Reset combo
        zoroState.combo = 0;
        updateComboDisplay();
        
        // Update UI
        updateLives();
        
        // Check game over
        if (zoroState.lives <= 0) {
            gameOver();
        }
    }
    
    // Game over
    function gameOver() {
        zoroState.gameActive = false;
        
        // Stop spawning words
        clearInterval(zoroState.spawnTimer);
        
        // Play game over sound
        playSound('gameover');
        
        // Show game over message
        showGameOverMessage();
        
        // Save score to history if stats module exists
        if (window.statsModule && window.statsModule.saveToHistory) {
            const playTime = Math.floor((Date.now() - zoroState.gameStartTime) / 1000);
            
            window.statsModule.saveToHistory(
                zoroState.score, // Use score as "WPM"
                Math.min(100, Math.floor((zoroState.maxCombo / 20) * 100)), // Use max combo for accuracy
                'zoro', // Special mode identifier
                zoroState.score, // Characters typed (use score)
                3 - zoroState.lives, // Error count
                formatTime(playTime), // Time played
                null // No word count
            );
        }
    }
    
    // Show game over message
    function showGameOverMessage() {
        // Create game over overlay
        const gameOverOverlay = document.createElement('div');
        gameOverOverlay.style.position = 'absolute';
        gameOverOverlay.style.top = '0';
        gameOverOverlay.style.left = '0';
        gameOverOverlay.style.width = '100%';
        gameOverOverlay.style.height = '100%';
        gameOverOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        gameOverOverlay.style.display = 'flex';
        gameOverOverlay.style.flexDirection = 'column';
        gameOverOverlay.style.alignItems = 'center';
        gameOverOverlay.style.justifyContent = 'center';
        gameOverOverlay.style.zIndex = '1100';
        
        // Game over text
        const gameOverText = document.createElement('h1');
        gameOverText.textContent = 'GAME OVER';
        gameOverText.style.color = '#ff3333';
        gameOverText.style.fontSize = '4rem';
        gameOverText.style.marginBottom = '2rem';
        gameOverText.style.textShadow = '0 0 10px #ff0000';
        
        // Score
        const scoreText = document.createElement('p');
        scoreText.textContent = `Final Score: ${zoroState.score}`;
        scoreText.style.color = '#ffffff';
        scoreText.style.fontSize = '2rem';
        scoreText.style.marginBottom = '1rem';
        
        // Max combo
        const comboText = document.createElement('p');
        comboText.textContent = `Max Combo: ${zoroState.maxCombo}`;
        comboText.style.color = '#ffffff';
        comboText.style.fontSize = '1.5rem';
        comboText.style.marginBottom = '1rem';
        
        // Difficulty reached
        const difficultyText = document.createElement('p');
        difficultyText.textContent = `Highest Tier: ${zoroState.difficultyTier}`;
        difficultyText.style.color = '#b19cd9';
        difficultyText.style.fontSize = '1.5rem';
        difficultyText.style.marginBottom = '3rem';
        
        // Retry button
        const retryButton = document.createElement('button');
        retryButton.textContent = 'Try Again';
        retryButton.style.backgroundColor = '#b19cd9';
        retryButton.style.color = '#000000';
        retryButton.style.border = 'none';
        retryButton.style.padding = '1rem 2rem';
        retryButton.style.fontSize = '1.2rem';
        retryButton.style.marginRight = '1rem';
        retryButton.style.cursor = 'pointer';
        retryButton.style.borderRadius = '4px';
        retryButton.onclick = () => {
            gameOverOverlay.remove();
            startGame();
        };
        
        // Exit button
        const exitButton = document.createElement('button');
        exitButton.textContent = 'Exit Zoro Mode';
        exitButton.style.backgroundColor = '#333333';
        exitButton.style.color = '#ffffff';
        exitButton.style.border = '1px solid #b19cd9';
        exitButton.style.padding = '1rem 2rem';
        exitButton.style.fontSize = '1.2rem';
        exitButton.style.cursor = 'pointer';
        exitButton.style.borderRadius = '4px';
        exitButton.onclick = () => {
            deactivate();
        };
        
        // Button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.appendChild(retryButton);
        buttonContainer.appendChild(exitButton);
        
        // Assemble overlay
        gameOverOverlay.appendChild(gameOverText);
        gameOverOverlay.appendChild(scoreText);
        gameOverOverlay.appendChild(comboText);
        gameOverOverlay.appendChild(difficultyText);
        gameOverOverlay.appendChild(buttonContainer);
        
        zoroContainer.appendChild(gameOverOverlay);
    }
    
    // Format time for display
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // Get a random word
    function getRandomWord() {
        if (!zoroState.wordList || Object.keys(zoroState.wordList).length === 0) {
            return "zoro"; // Default if no words are loaded
        }
        
        // Get appropriate tier based on current score
        let wordTier = 'East Blue'; // Default easiest tier
        
        // Find the appropriate tier based on score
        for (let i = DIFFICULTY_TIERS.length - 1; i >= 0; i--) {
            const tier = DIFFICULTY_TIERS[i];
            if (zoroState.score >= tier.threshold) {
                // Map game difficulty tier to word list tier
                if (tier.name === 'Alabasta' || tier.name === 'Skypiea' || tier.name === 'Water 7') {
                    wordTier = 'Paradise';
                } else if (tier.name === 'Enies Lobby' || tier.name === 'Thriller Bark' || tier.name === 'Sabaody') {
                    wordTier = 'Paradise';
                } else if (tier.name === 'Marineford' || tier.name === 'Fish-Man Island') {
                    wordTier = 'Warlord_Commander';
                } else if (tier.name === 'Dressrosa' || tier.name === 'Whole Cake Island') {
                    wordTier = 'Yonko';
                } else if (tier.name === 'Wano' || tier.name === 'Laugh Tale') {
                    wordTier = 'Yonko';
                } else {
                    wordTier = 'East Blue';
                }
                break;
            }
        }
        
        // If tier not available, use the first available tier
        if (!zoroState.wordList[wordTier]) {
            const availableTiers = Object.keys(zoroState.wordList);
            if (availableTiers.length > 0) {
                wordTier = availableTiers[0];
            } else {
                return "zoro"; // Fallback if no tiers available
            }
        }
        
        // Get the words for the selected tier
        const tierWords = zoroState.wordList[wordTier];
        
        if (!tierWords || tierWords.length === 0) {
            return "zoro"; // Fallback
        }
        
        // Filter words by length based on level
        let filteredWords = tierWords;
        
        // For early levels (1-3), use very short words (2-3 chars)
        if (zoroState.level <= 3) {
            filteredWords = tierWords.filter(word => word.length >= 2 && word.length <= 3);
        } 
        // For levels 4-6, use shorter words (3-4 chars)
        else if (zoroState.level <= 6) {
            filteredWords = tierWords.filter(word => word.length >= 3 && word.length <= 4);
        }
        // For levels 7-10, use medium length words (4-6 chars)
        else if (zoroState.level <= 10) {
            filteredWords = tierWords.filter(word => word.length >= 4 && word.length <= 6);
        }
        // For higher levels, use longer words (5+ chars)
        else {
            filteredWords = tierWords.filter(word => word.length >= 5);
        }
        
        // If filtering resulted in an empty array, use the original tier words
        if (filteredWords.length === 0) {
            filteredWords = tierWords;
        }
        
        // Return a random word from the filtered list
        return filteredWords[Math.floor(Math.random() * filteredWords.length)];
    }
    
    // Export public methods
    return {
        init: init,
        activate: activate,
        deactivate: deactivate,
        isZoroTriggerSequence: isZoroTriggerSequence
    };
})();
