// Zoro Mode Module
// An action-packed typing game mode

// Game state
const zoroState = {
    active: false,
    score: 0,
    level: 1,
    difficultyIndex: 0, // Index to track which difficulty tier we're on (0=East Blue, 1=Paradise, etc.)
    difficultyTiers: ["East Blue", "Paradise", "Warlord_Commander", "Yonko"], // Themed difficulty levels
    tierThresholds: [0, 3000, 8000, 15000], // Score thresholds to advance to next tier
    wordLists: null, // Will hold the loaded word lists from JSON
    lives: 3,
    combo: 0,
    maxCombo: 0,
    words: [],
    powerups: {
        onigiri: { available: false, cooldown: 0 },
        haki: { available: false, cooldown: 0, active: false },
        ashura: { available: false, cooldown: 0 }
    },
    startTime: null,
    gameLoop: null,
    canvas: null,
    ctx: null
};

// Word object class
class ZoroWord {
    constructor(word, speed, direction = 'down') {
        this.word = word;
        this.display = word;
        this.x = Math.random() * (window.innerWidth - 200) + 100;
        this.y = direction === 'down' ? -50 : window.innerHeight + 50;
        this.speed = speed;
        this.direction = direction; // 'down' or 'up'
        this.size = Math.max(16, Math.min(24, 18 + zoroState.level / 2));
        this.hit = false;
        this.opacity = 1;
        this.rotation = (Math.random() - 0.5) * 0.2;
        this.color = '#b19cd9'; 
    }

    update() {
        // Move word based on direction
        if (this.direction === 'down') {
            this.y += this.speed;
        } else {
            this.y -= this.speed;
        }
        
        // If word is hit, animate it disappearing
        if (this.hit) {
            this.opacity -= 0.1;
        }
        
        return this.opacity <= 0;
    }

    draw(ctx) {
        if (this.opacity <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Word shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.font = `${this.size}px "Roboto Mono", monospace`;
        ctx.fillText(this.display, 2, 2);
        
        // Actual word
        ctx.fillStyle = this.color;
        ctx.font = `${this.size}px "Roboto Mono", monospace`;
        ctx.fillText(this.display, 0, 0);
        
        ctx.restore();
    }

    isOffScreen() {
        return (
            (this.direction === 'down' && this.y > window.innerHeight + 100) ||
            (this.direction === 'up' && this.y < -100)
        );
    }
}

// DOM Elements
const zoroElements = {
    container: document.getElementById('zoro-container'),
    canvas: document.getElementById('zoro-canvas'),
    scoreElement: document.getElementById('zoro-score'),
    levelElement: document.getElementById('zoro-level'),
    input: document.getElementById('zoro-input'),
    exitBtn: document.getElementById('zoro-exit')
};

// Audio elements
const zoroAudio = {
    theme: new Audio('sounds/zorobattletheme.mp3'),
    slash1: new Audio('sounds/slash1.mp3'),
    slash2: new Audio('sounds/slash2.mp3'),
    onigiri: new Audio('sounds/onigiri.mp3'),
    haki: new Audio('sounds/haki.mp3'),
    ashura: new Audio('sounds/checkashura.mp3'),
    laugh: new Audio('sounds/evillaugh1.mp3'),
    ko: new Audio('sounds/KO.mp3'),
    gameover: new Audio('sounds/gameover.mp3')
};

// Set audio properties
function configureAudio() {
    zoroAudio.theme.loop = true;
    zoroAudio.theme.volume = 0.5;
    
    // Set shorter audio to lower volume
    const shortSounds = [zoroAudio.slash1, zoroAudio.slash2, zoroAudio.onigiri, 
                         zoroAudio.haki, zoroAudio.ashura, zoroAudio.laugh, 
                         zoroAudio.ko, zoroAudio.gameover];
                         
    shortSounds.forEach(sound => {
        sound.volume = 0.4;
    });
}

/**
 * Initialize Zoro Mode
 */
function initZoroMode() {
    // Set up canvas
    zoroElements.canvas.width = window.innerWidth;
    zoroElements.canvas.height = window.innerHeight;
    zoroState.canvas = zoroElements.canvas;
    zoroState.ctx = zoroElements.canvas.getContext('2d');
    
    // Set up event listeners
    zoroElements.input.addEventListener('input', handleZoroInput);
    zoroElements.exitBtn.addEventListener('click', exitZoroMode);
    
    // Handle resizing
    window.addEventListener('resize', handleZoroResize);
    
    // Configure audio
    configureAudio();
    
    // Load word lists
    loadZoroWordLists();
}

/**
 * Activate Zoro Mode
 */
function activateZoroMode() {
    // Only activate if not already active
    if (zoroState.active) return;
    
    // Reset game state
    resetZoroGameState();
    
    // Show Zoro container
    zoroElements.container.classList.remove('hidden');
    document.body.classList.add('zoro-active');
    
    // Get reference to the background video
    const bgVideo = document.getElementById('zoro-bg-video');
    
    // Play activation glitch effect
    playGlitchEffect();
    
    // Focus input and start game
    setTimeout(() => {
        zoroElements.input.focus();
        
        // Start theme music
        zoroAudio.theme.currentTime = 0;
        zoroAudio.theme.play().catch(err => console.error('Audio playback error:', err));
        
        // Play the background video
        bgVideo.currentTime = 0;
        bgVideo.play().catch(err => console.error('Video playback error:', err));
        
        // Start game loop
        startZoroGameLoop();
        
        // Record start time
        zoroState.startTime = Date.now();
        
        // Set active flag
        zoroState.active = true;
    }, 1000); // Start after glitch effect
}

/**
 * Exit Zoro Mode
 */
function exitZoroMode() {
    if (!zoroState.active) return;
    
    // Stop game loop
    cancelAnimationFrame(zoroState.gameLoop);
    
    // Fade out music
    const fadeInterval = setInterval(() => {
        if (zoroAudio.theme.volume > 0.05) {
            zoroAudio.theme.volume -= 0.05;
        } else {
            clearInterval(fadeInterval);
            zoroAudio.theme.pause();
            zoroAudio.theme.volume = 0.5;
        }
    }, 100);
    
    // Stop all other sounds
    Object.values(zoroAudio).forEach(audio => {
        if (audio !== zoroAudio.theme) {
            audio.pause();
            audio.currentTime = 0;
        }
    });
    
    // Save game stats to history
    const gameDuration = Math.round((Date.now() - zoroState.startTime) / 1000);
    
    if (window.statsModule && typeof window.statsModule.saveZoroGameToHistory === 'function') {
        window.statsModule.saveZoroGameToHistory(
            zoroState.score, 
            zoroState.level, 
            zoroState.maxCombo, 
            gameDuration
        );
    }
    
    // Hide Zoro container
    zoroElements.container.classList.add('hidden');
    document.body.classList.remove('zoro-active');
    
    // Reset active flag
    zoroState.active = false;
}

/**
 * Reset game state for a new game
 */
function resetZoroGameState() {
    zoroState.score = 0;
    zoroState.level = 1;
    zoroState.difficultyIndex = 0;
    zoroState.lives = 3;
    zoroState.combo = 0;
    zoroState.maxCombo = 0;
    zoroState.words = [];
    zoroState.powerups = {
        onigiri: { available: false, cooldown: 0 },
        haki: { available: false, cooldown: 0, active: false },
        ashura: { available: false, cooldown: 0 }
    };
    
    // Reset UI
    updateZoroUI();
    
    // Clear input
    zoroElements.input.value = '';
    
    // Remove any existing UI elements
    removeZoroUIElements();
}

/**
 * Handle Zoro Mode input
 * @param {Event} event - Input event
 */
function handleZoroInput(event) {
    const inputValue = event.target.value.trim().toLowerCase();
    
    // Skip empty input
    if (!inputValue) return;
    
    // Check for power-up activation
    if (activatePowerUp(inputValue)) {
        // Clear input if power-up was activated
        event.target.value = '';
        return;
    }
    
    // Look for matching word
    const matchedWordIndex = zoroState.words.findIndex(word => 
        word.word.toLowerCase() === inputValue && !word.hit
    );
    
    if (matchedWordIndex !== -1) {
        const matchedWord = zoroState.words[matchedWordIndex];
        
        // Mark word as hit
        matchedWord.hit = true;
        matchedWord.color = '#7aac7a'; // Success color
        
        // Play slash sound
        const slashSound = Math.random() > 0.5 ? zoroAudio.slash1 : zoroAudio.slash2;
        slashSound.currentTime = 0;
        slashSound.play().catch(err => console.error('Audio playback error:', err));
        
        // Create sword slash effect at word location
        createSlashEffect(matchedWord.x, matchedWord.y);
        
        // Increase score
        increaseScore(inputValue.length);
        
        // Increase combo
        increaseCombo();
        
        // Check for powerup unlocks based on combo
        checkPowerUpUnlocks();
        
        // Clear input
        event.target.value = '';
        return;
    }
    
    // If reaching here, no word was matched - keep the input for now
}

/**
 * Start the Zoro game loop
 */
function startZoroGameLoop() {
    // Variables to track time and spawning
    let lastTimestamp = 0;
    let lastWordSpawn = 0;
    let lastPowerUpCheck = 0;
    
    // Game loop function
    const gameLoop = (timestamp) => {
        // Calculate time elapsed since last frame
        const elapsed = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        
        // Clear canvas
        zoroState.ctx.clearRect(0, 0, zoroState.canvas.width, zoroState.canvas.height);
        
        // Spawn words
        if (timestamp - lastWordSpawn > getSpawnInterval()) {
            spawnWord();
            lastWordSpawn = timestamp;
        }
        
        // Update and draw words
        updateWords();
        
        // Update powerup cooldowns
        if (timestamp - lastPowerUpCheck > 1000) {
            updatePowerUps();
            lastPowerUpCheck = timestamp;
        }
        
        // Continue loop if game is still active
        if (zoroState.active) {
            zoroState.gameLoop = requestAnimationFrame(gameLoop);
        }
    };
    
    // Start the loop
    zoroState.gameLoop = requestAnimationFrame(gameLoop);
}

/**
 * Get the word spawn interval based on current level
 * @returns {number} - Milliseconds between word spawns
 */
function getSpawnInterval() {
    const baseInterval = 2000; // 2 seconds at level 1
    const minInterval = 400;   // Minimum spawn interval (ms)
    
    return Math.max(minInterval, baseInterval - (zoroState.level * 100));
}

/**
 * Get word speed based on current level
 * @returns {number} - Speed value
 */
function getWordSpeed() {
    const baseSpeed = 1.5;
    return baseSpeed + (zoroState.level * 0.2);
}

/**
 * Spawn a new word
 */
function spawnWord() {
    // Get a word from the appropriate difficulty tier
    const word = getZoroThemeWord();
    
    // Determine direction (chance for words to come from bottom increases with level)
    const directionChance = Math.min(0.3, zoroState.level * 0.02);
    const direction = Math.random() < directionChance ? 'up' : 'down';
    
    // Create word object with appropriate speed
    const speed = getWordSpeed() * (0.8 + Math.random() * 0.4);
    const zoroWord = new ZoroWord(word, speed, direction);
    
    // Add to words array
    zoroState.words.push(zoroWord);
}

/**
 * Update and draw all words
 */
function updateWords() {
    // Update each word and remove if necessary
    zoroState.words = zoroState.words.filter(word => {
        // Check if word is off screen and not hit
        if (word.isOffScreen() && !word.hit) {
            // Player loses life
            decreaseLife();
            return false;
        }
        
        // Update word position
        const shouldRemove = word.update();
        
        // Draw word if not removed
        if (!shouldRemove) {
            word.draw(zoroState.ctx);
        }
        
        return !shouldRemove;
    });
}

/**
 * Increase player score
 * @param {number} wordLength - Length of the hit word
 */
function increaseScore(wordLength) {
    // Base score is word length * 10
    let points = wordLength * 10;
    
    // Apply combo multiplier
    if (zoroState.combo > 1) {
        points *= (1 + (zoroState.combo * 0.1));
    }
    
    // Apply level multiplier
    points *= (1 + (zoroState.level * 0.05));
    
    // Round to integer
    points = Math.round(points);
    
    // Update score
    zoroState.score += points;
    
    // Update UI
    updateZoroUI();
    
    // Check for level increase
    checkLevelUp();
}

/**
 * Increase combo counter
 */
function increaseCombo() {
    zoroState.combo++;
    
    // Update max combo if current combo is higher
    if (zoroState.combo > zoroState.maxCombo) {
        zoroState.maxCombo = zoroState.combo;
    }
    
    // Create combo display
    updateComboDisplay();
}

/**
 * Update combo display with animation
 */
function updateComboDisplay() {
    // Remove existing combo display
    const existingCombo = document.querySelector('.zoro-combo');
    if (existingCombo) {
        existingCombo.remove();
    }
    
    // Create new combo display
    if (zoroState.combo > 1) {
        const comboElement = document.createElement('div');
        comboElement.className = 'zoro-combo';
        
        const comboCount = document.createElement('div');
        comboCount.className = 'combo-count combo-update';
        comboCount.textContent = `${zoroState.combo}x`;
        
        const comboLabel = document.createElement('div');
        comboLabel.className = 'combo-label';
        comboLabel.textContent = 'COMBO';
        
        comboElement.appendChild(comboCount);
        comboElement.appendChild(comboLabel);
        
        // Add to container
        zoroElements.container.appendChild(comboElement);
    }
}

/**
 * Reset combo
 */
function resetCombo() {
    zoroState.combo = 0;
    
    // Remove combo display
    const existingCombo = document.querySelector('.zoro-combo');
    if (existingCombo) {
        existingCombo.remove();
    }
}

/**
 * Check if level should increase
 */
function checkLevelUp() {
    const scoreThreshold = zoroState.level * 1000;
    
    // Check for numeric level up first
    if (zoroState.score >= scoreThreshold) {
        zoroState.level++;
        
        // Flash level indicator
        const levelElement = zoroElements.levelElement;
        levelElement.classList.add('flash');
        setTimeout(() => {
            levelElement.classList.remove('flash');
        }, 500);
        
        // Shake the screen slightly
        zoroElements.container.classList.add('shake-1');
        setTimeout(() => {
            zoroElements.container.classList.remove('shake-1');
        }, 300);
        
        // Check powerup unlocks again on level up
        checkPowerUpUnlocks();
    }
    
    // Check for difficulty tier advancement
    for (let i = zoroState.difficultyTiers.length - 1; i > zoroState.difficultyIndex; i--) {
        if (zoroState.score >= zoroState.tierThresholds[i]) {
            // Only trigger effects if this is a new tier
            if (zoroState.difficultyIndex < i) {
                zoroState.difficultyIndex = i;
                
                // Create difficulty transition effect
                showDifficultyTransition(zoroState.difficultyTiers[i]);
            }
            break;
        }
    }
    
    // Update UI after any changes
    updateZoroUI();
}

/**
 * Show difficulty transition effect
 * @param {string} newTier - New difficulty tier name
 */
function showDifficultyTransition(newTier) {
    // Create transition element
    const transitionElement = document.createElement('div');
    transitionElement.className = 'zoro-difficulty-transition';
    transitionElement.style.position = 'absolute';
    transitionElement.style.top = '50%';
    transitionElement.style.left = '50%';
    transitionElement.style.transform = 'translate(-50%, -50%)';
    transitionElement.style.textAlign = 'center';
    transitionElement.style.zIndex = '1025';
    transitionElement.style.pointerEvents = 'none';
    
    // Title text
    const titleElement = document.createElement('div');
    titleElement.textContent = 'ENTERING';
    titleElement.style.fontSize = '1.5rem';
    titleElement.style.color = '#d1d0c5';
    titleElement.style.marginBottom = '0.5rem';
    
    // Tier name text
    const tierElement = document.createElement('div');
    tierElement.textContent = newTier.toUpperCase();
    tierElement.style.fontSize = '3rem';
    tierElement.style.fontWeight = 'bold';
    tierElement.style.color = getTierColor(newTier);
    tierElement.style.textShadow = '0 0 15px ' + getTierColor(newTier) + '80';
    
    // Add elements to container
    transitionElement.appendChild(titleElement);
    transitionElement.appendChild(tierElement);
    
    // Add to container
    zoroElements.container.appendChild(transitionElement);
    
    // Create background flash effect
    zoroElements.container.classList.add('tier-transition');
    
    // Play sound effect
    const sound = zoroAudio.ashura;
    sound.currentTime = 0;
    sound.play().catch(err => console.error('Audio playback error:', err));
    
    // Shake screen
    zoroElements.container.classList.add('shake-3');
    setTimeout(() => {
        zoroElements.container.classList.remove('shake-3');
    }, 700);
    
    // Remove transition after animation
    setTimeout(() => {
        transitionElement.remove();
        zoroElements.container.classList.remove('tier-transition');
    }, 3000);
}

/**
 * Get color for a specific difficulty tier
 * @param {string} tierName - Tier name
 * @returns {string} - Color code for tier
 */
function getTierColor(tierName) {
    switch(tierName) {
        case 'East Blue': return '#7aac7a'; // Green
        case 'Paradise': return '#b19cd9'; // Lavender
        case 'Warlord_Commander': return '#e2b714'; // Gold
        case 'Yonko': return '#ca4754'; // Red
        default: return '#a88bfa'; // Default purple
    }
}

/**
 * Decrease player life
 */
function decreaseLife() {
    // Only decrease if not in haki mode
    if (zoroState.powerups.haki.active) return;
    
    zoroState.lives--;
    
    // Reset combo
    resetCombo();
    
    // Shake screen
    const shakeClass = zoroState.lives === 0 ? 'shake-3' : 'shake-2';
    zoroElements.container.classList.add(shakeClass);
    setTimeout(() => {
        zoroElements.container.classList.remove(shakeClass);
    }, shakeClass === 'shake-3' ? 700 : 500);
    
    // Update lives display
    updateLivesDisplay();
    
    // Play hit sound
    zoroAudio.laugh.currentTime = 0;
    zoroAudio.laugh.play().catch(err => console.error('Audio playback error:', err));
    
    // Check game over
    if (zoroState.lives <= 0) {
        // Game over!
        setTimeout(gameOver, 1000);
    }
}

/**
 * End the game
 */
function gameOver() {
    // Play game over sound
    zoroAudio.ko.currentTime = 0;
    zoroAudio.ko.play().catch(err => console.error('Audio playback error:', err));
    
    // Stop the game loop
    cancelAnimationFrame(zoroState.gameLoop);
    
    // Show game over screen
    showGameOverScreen();
    
    // Note: We've removed the automatic exit here so the player can choose to play again
}

/**
 * Restart Zoro game after game over
 */
function restartZoroGame() {
    // Remove game over screen and overlay
    if (zoroState.gameOverElement) {
        zoroState.gameOverElement.remove();
        zoroState.gameOverElement = null;
    }
    
    if (zoroState.gameOverOverlay) {
        zoroState.gameOverOverlay.remove();
        zoroState.gameOverOverlay = null;
    }
    
    // Save previous game stats to history
    const gameDuration = Math.round((Date.now() - zoroState.startTime) / 1000);
    
    console.log('Attempting to save Zoro game stats:', {
        score: zoroState.score,
        level: zoroState.level,
        maxCombo: zoroState.maxCombo,
        duration: gameDuration
    });
    
    if (window.statsModule && typeof window.statsModule.saveZoroGameToHistory === 'function') {
        try {
            window.statsModule.saveZoroGameToHistory(
                zoroState.score, 
                zoroState.level, 
                zoroState.maxCombo, 
                gameDuration
            );
            console.log('Successfully saved Zoro game stats');
        } catch (error) {
            console.error('Error saving Zoro game stats:', error);
        }
    } else {
        console.error('statsModule or saveZoroGameToHistory function not found');
    }
    
    // Reset the game state
    resetZoroGameState();
    
    // Reset audio
    zoroAudio.theme.currentTime = 0;
    
    // Reset video
    const bgVideo = document.getElementById('zoro-bg-video');
    if (bgVideo) {
        bgVideo.currentTime = 0;
        bgVideo.play().catch(err => console.error('Video playback error:', err));
    }
    
    // Focus input
    zoroElements.input.focus();
    
    // Record new start time
    zoroState.startTime = Date.now();
    
    // Set active flag to true
    zoroState.active = true;
    
    // Start a new game loop
    startZoroGameLoop();
}

/**
 * Show game over screen
 */
function showGameOverScreen() {
    // Create game over element
    const gameOverElement = document.createElement('div');
    gameOverElement.style.position = 'absolute';
    gameOverElement.style.top = '50%';
    gameOverElement.style.left = '50%';
    gameOverElement.style.transform = 'translate(-50%, -50%)';
    gameOverElement.style.display = 'flex';
    gameOverElement.style.flexDirection = 'column';
    gameOverElement.style.alignItems = 'center';
    gameOverElement.style.justifyContent = 'center';
    gameOverElement.style.zIndex = '1030';
    
    // Game over text
    const gameOverText = document.createElement('div');
    gameOverText.textContent = 'GAME OVER';
    gameOverText.style.color = '#ca4754';
    gameOverText.style.fontSize = '4rem';
    gameOverText.style.fontWeight = 'bold';
    gameOverText.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.7)';
    gameOverText.style.marginBottom = '1rem';
    
    // Final score
    const finalScore = document.createElement('div');
    finalScore.textContent = `Final Score: ${zoroState.score}`;
    finalScore.style.color = '#a88bfa';
    finalScore.style.fontSize = '2rem';
    finalScore.style.marginBottom = '0.5rem';
    
    // Get current difficulty tier
    const currentTier = zoroState.difficultyTiers[zoroState.difficultyIndex];
    const tierColor = getTierColor(currentTier);
    
    // Final level (showing tier instead of just numeric level)
    const finalLevel = document.createElement('div');
    finalLevel.textContent = currentTier;
    finalLevel.style.color = tierColor;
    finalLevel.style.fontSize = '1.5rem';
    finalLevel.style.marginBottom = '0.5rem';
    
    // Max combo
    const maxCombo = document.createElement('div');
    maxCombo.textContent = `Max Combo: ${zoroState.maxCombo}x`;
    maxCombo.style.color = '#7aac7a';
    maxCombo.style.fontSize = '1.5rem';
    maxCombo.style.marginBottom = '1.5rem';
    
    // Add play again button
    const playAgainButton = document.createElement('button');
    playAgainButton.textContent = 'PLAY AGAIN';
    playAgainButton.style.backgroundColor = '#a88bfa';
    playAgainButton.style.color = '#000';
    playAgainButton.style.border = 'none';
    playAgainButton.style.borderRadius = '4px';
    playAgainButton.style.padding = '1rem 2rem';
    playAgainButton.style.fontSize = '1.2rem';
    playAgainButton.style.fontWeight = 'bold';
    playAgainButton.style.cursor = 'pointer';
    playAgainButton.style.marginBottom = '1rem';
    playAgainButton.style.boxShadow = '0 0 10px rgba(168, 139, 250, 0.5)';
    
    // Hover effect
    playAgainButton.onmouseover = function() {
        this.style.backgroundColor = '#b19cd9';
        this.style.transform = 'scale(1.05)';
        this.style.transition = 'all 0.2s ease';
    };
    playAgainButton.onmouseout = function() {
        this.style.backgroundColor = '#a88bfa';
        this.style.transform = 'scale(1)';
    };
    
    // Add click event
    playAgainButton.onclick = function() {
        restartZoroGame();
    };
    
    // Exit button
    const exitButton = document.createElement('button');
    exitButton.textContent = 'EXIT';
    exitButton.style.backgroundColor = 'transparent';
    exitButton.style.color = '#d1d0c5';
    exitButton.style.border = '1px solid #646669';
    exitButton.style.borderRadius = '4px';
    exitButton.style.padding = '0.5rem 1.5rem';
    exitButton.style.fontSize = '1rem';
    exitButton.style.cursor = 'pointer';
    
    // Hover effect
    exitButton.onmouseover = function() {
        this.style.backgroundColor = 'rgba(255,255,255,0.1)';
        this.style.transition = 'all 0.2s ease';
    };
    exitButton.onmouseout = function() {
        this.style.backgroundColor = 'transparent';
    };
    
    // Add click event
    exitButton.onclick = function() {
        exitZoroMode();
    };
    
    // Add all elements
    gameOverElement.appendChild(gameOverText);
    gameOverElement.appendChild(finalScore);
    gameOverElement.appendChild(finalLevel);
    gameOverElement.appendChild(maxCombo);
    gameOverElement.appendChild(playAgainButton);
    gameOverElement.appendChild(exitButton);
    
    // Add to container
    zoroElements.container.appendChild(gameOverElement);
    
    // Add animation
    gameOverElement.animate([
        { opacity: 0, transform: 'translate(-50%, -70%)' },
        { opacity: 1, transform: 'translate(-50%, -50%)' }
    ], {
        duration: 800,
        easing: 'cubic-bezier(0.2, 0, 0.2, 1)'
    });
    
    // Dim the background by adding semi-transparent overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.zIndex = '1020';
    
    zoroElements.container.appendChild(overlay);
    
    // Fade in overlay
    overlay.animate([
        { opacity: 0 },
        { opacity: 1 }
    ], {
        duration: 800,
        easing: 'cubic-bezier(0.2, 0, 0.2, 1)'
    });
    
    // Store reference to the overlay for later removal
    zoroState.gameOverOverlay = overlay;
    zoroState.gameOverElement = gameOverElement;
}

/**
 * Update the lives display
 */
function updateLivesDisplay() {
    // Remove existing lives display
    const existingLives = document.querySelector('.zoro-lives');
    if (existingLives) {
        existingLives.remove();
    }
    
    // Create lives container
    const livesContainer = document.createElement('div');
    livesContainer.className = 'zoro-lives';
    
    // Add hearts for each life
    for (let i = 0; i < zoroState.lives; i++) {
        const heart = document.createElement('div');
        heart.className = 'zoro-heart';
        heart.textContent = '❤️';
        livesContainer.appendChild(heart);
    }
    
    // Add to container
    zoroElements.container.appendChild(livesContainer);
}

/**
 * Update Zoro UI with current stats
 */
function updateZoroUI() {
    zoroElements.scoreElement.textContent = zoroState.score;
    
    // Show current difficulty tier instead of just numeric level
    const currentTier = zoroState.difficultyTiers[zoroState.difficultyIndex];
    zoroElements.levelElement.textContent = currentTier;
    zoroElements.levelElement.style.color = getTierColor(currentTier);
    
    // Update lives display
    updateLivesDisplay();
    
    // Update power-ups display
    updatePowerUpDisplay();
}

/**
 * Check if any power-up should be unlocked
 */
function checkPowerUpUnlocks() {
    // Onigiri (health) becomes available at combo 5 or level 3
    if (!zoroState.powerups.onigiri.available && 
        (zoroState.combo >= 5 || zoroState.level >= 3) && 
        zoroState.powerups.onigiri.cooldown === 0) {
        zoroState.powerups.onigiri.available = true;
        updatePowerUpDisplay();
    }
    
    // Haki becomes available at combo 10 or level 5
    if (!zoroState.powerups.haki.available && 
        (zoroState.combo >= 10 || zoroState.level >= 5) && 
        zoroState.powerups.haki.cooldown === 0) {
        zoroState.powerups.haki.available = true;
        updatePowerUpDisplay();
    }
    
    // Ashura becomes available at combo 15 or level 7
    if (!zoroState.powerups.ashura.available && 
        (zoroState.combo >= 15 || zoroState.level >= 7) && 
        zoroState.powerups.ashura.cooldown === 0) {
        zoroState.powerups.ashura.available = true;
        updatePowerUpDisplay();
    }
}

/**
 * Update power-up cooldowns
 */
function updatePowerUps() {
    // Update Onigiri cooldown
    if (zoroState.powerups.onigiri.cooldown > 0) {
        zoroState.powerups.onigiri.cooldown--;
        if (zoroState.powerups.onigiri.cooldown === 0 && 
            (zoroState.combo >= 5 || zoroState.level >= 3)) {
            zoroState.powerups.onigiri.available = true;
        }
    }
    
    // Update Haki cooldown and active state
    if (zoroState.powerups.haki.cooldown > 0) {
        zoroState.powerups.haki.cooldown--;
        if (zoroState.powerups.haki.cooldown === 0 && 
            (zoroState.combo >= 10 || zoroState.level >= 5)) {
            zoroState.powerups.haki.available = true;
        }
    }
    
    // Disable Haki after 15 seconds of activity (changed from 3 seconds)
    if (zoroState.powerups.haki.active && Date.now() - zoroState.powerups.haki.activatedAt > 15000) {
        zoroState.powerups.haki.active = false;
        zoroElements.container.classList.remove('haki-active');
    }
    
    // Update Ashura cooldown
    if (zoroState.powerups.ashura.cooldown > 0) {
        zoroState.powerups.ashura.cooldown--;
        if (zoroState.powerups.ashura.cooldown === 0 && 
            (zoroState.combo >= 15 || zoroState.level >= 7)) {
            zoroState.powerups.ashura.available = true;
        }
    }
    
    // Update power-ups display
    updatePowerUpDisplay();
}

/**
 * Update power-ups display
 */
function updatePowerUpDisplay() {
    // Remove existing power-ups display
    const existingPowerUps = document.querySelector('.zoro-power-ups');
    if (existingPowerUps) {
        existingPowerUps.remove();
    }
    
    // Create power-ups container
    const powerUpsContainer = document.createElement('div');
    powerUpsContainer.className = 'zoro-power-ups';
    
    // Create Onigiri power-up
    const onigiriPowerUp = createPowerUpElement('onigiri', '🍙', 'Onigiri - Restore 1 life');
    powerUpsContainer.appendChild(onigiriPowerUp);
    
    // Create Haki power-up
    const hakiPowerUp = createPowerUpElement('haki', '⚡', 'Haki - Temporary invincibility');
    powerUpsContainer.appendChild(hakiPowerUp);
    
    // Create Ashura power-up
    const ashuraPowerUp = createPowerUpElement('ashura', '👹', 'Ashura - Clear screen');
    powerUpsContainer.appendChild(ashuraPowerUp);
    
    // Add to container
    zoroElements.container.appendChild(powerUpsContainer);
}

/**
 * Create a power-up element
 * @param {string} name - Power-up name
 * @param {string} icon - Power-up icon
 * @param {string} tooltip - Power-up tooltip text
 */
function createPowerUpElement(name, icon, tooltip) {
    const powerUp = zoroState.powerups[name];
    
    const element = document.createElement('div');
    element.className = `power-up ${powerUp.available ? 'available' : ''}`;
    element.title = tooltip + (powerUp.cooldown > 0 ? ` (Cooldown: ${powerUp.cooldown}s)` : '');
    
    const iconElement = document.createElement('div');
    iconElement.className = 'power-icon';
    iconElement.textContent = icon;
    
    const nameElement = document.createElement('div');
    nameElement.className = 'power-name';
    nameElement.textContent = powerUp.cooldown > 0 ? `${name} (${powerUp.cooldown}s)` : name;
    
    element.appendChild(iconElement);
    element.appendChild(nameElement);
    
    return element;
}

/**
 * Activate a power-up
 * @param {string} input - Input text
 * @returns {boolean} - True if a power-up was activated
 */
function activatePowerUp(input) {
    const lowerInput = input.toLowerCase();
    
    // Check for Onigiri activation
    if (lowerInput === 'onigiri' && zoroState.powerups.onigiri.available) {
        activateOnigiri();
        return true;
    }
    
    // Check for Haki activation
    if (lowerInput === 'haki' && zoroState.powerups.haki.available) {
        activateHaki();
        return true;
    }
    
    // Check for Ashura activation
    if (lowerInput === 'ashura' && zoroState.powerups.ashura.available) {
        activateAshura();
        return true;
    }
    
    return false;
}

/**
 * Activate Onigiri power-up (restore 1 life)
 */
function activateOnigiri() {
    // Restore 1 life up to max of 3
    if (zoroState.lives < 3) {
        zoroState.lives++;
        
        // Play sound
        zoroAudio.onigiri.currentTime = 0;
        zoroAudio.onigiri.play().catch(err => console.error('Audio playback error:', err));
        
        // Flash effect
        zoroElements.container.classList.add('onigiri-flash');
        setTimeout(() => {
            zoroElements.container.classList.remove('onigiri-flash');
        }, 500);
        
        // Update lives display
        updateLivesDisplay();
    }
    
    // Set cooldown
    zoroState.powerups.onigiri.available = false;
    zoroState.powerups.onigiri.cooldown = 30; // 30 second cooldown
    
    // Update power-ups display
    updatePowerUpDisplay();
}

/**
 * Activate Haki power-up (temporary invincibility)
 */
function activateHaki() {
    // Set active state and record activation time
    zoroState.powerups.haki.active = true;
    zoroState.powerups.haki.activatedAt = Date.now();
    
    // Play sound
    zoroAudio.haki.currentTime = 0;
    zoroAudio.haki.play().catch(err => console.error('Audio playback error:', err));
    
    // Add haki effect to container
    zoroElements.container.classList.add('haki-active');
    
    // Set cooldown
    zoroState.powerups.haki.available = false;
    zoroState.powerups.haki.cooldown = 45; // 45 second cooldown
    
    // Update power-ups display
    updatePowerUpDisplay();
}

/**
 * Activate Ashura power-up (clear screen)
 */
function activateAshura() {
    // Play sound
    zoroAudio.ashura.currentTime = 0;
    zoroAudio.ashura.play().catch(err => console.error('Audio playback error:', err));
    
    // Mark all on-screen words as hit
    zoroState.words.forEach(word => {
        if (!word.hit) {
            word.hit = true;
            word.color = '#7aac7a'; // Success color
            createSlashEffect(word.x, word.y);
            
            // Award points for each word
            increaseScore(word.word.length);
        }
    });
    
    // Create Ashura visual effect
    createAshuraEffect();
    
    // Set cooldown
    zoroState.powerups.ashura.available = false;
    zoroState.powerups.ashura.cooldown = 60; // 60 second cooldown
    
    // Update power-ups display
    updatePowerUpDisplay();
}

/**
 * Create a sword slash effect at x, y coordinates
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
function createSlashEffect(x, y) {
    // Create slash element
    const slashElement = document.createElement('div');
    slashElement.className = 'sword-slash';
    slashElement.style.left = `${x}px`;
    slashElement.style.top = `${y}px`;
    
    // Add to container
    zoroElements.container.appendChild(slashElement);
    
    // Remove after animation
    setTimeout(() => {
        slashElement.remove();
    }, 300);
}

/**
 * Create Ashura effect with clones
 */
function createAshuraEffect() {
    // Create clones container
    const clonesContainer = document.createElement('div');
    clonesContainer.className = 'ashura-clones';
    
    // Create 9 clones positioned randomly
    for (let i = 0; i < 9; i++) {
        const clone = document.createElement('div');
        clone.className = 'ashura-clone';
        clone.style.transform = `translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px)`;
        
        // Use ashura.png instead of zoromodelogo.png
        clone.style.backgroundImage = 'url("../assets/ashura.png")';
        
        // Add purple and red color scheme
        clone.style.filter = 'hue-rotate(320deg) saturate(2.5)'; // Creates a purple-red effect
        
        clonesContainer.appendChild(clone);
    }
    
    // Add to container
    zoroElements.container.appendChild(clonesContainer);
    
    // Change container theme temporarily
    const originalBg = zoroElements.container.style.backgroundColor;
    zoroElements.container.style.boxShadow = 'inset 0 0 200px rgba(128, 0, 128, 0.5)'; // Purple glow
    zoroElements.container.classList.add('ashura-active');
    
    // Create a red/purple overlay
    const ashuraOverlay = document.createElement('div');
    ashuraOverlay.className = 'ashura-overlay';
    ashuraOverlay.style.position = 'absolute';
    ashuraOverlay.style.top = '0';
    ashuraOverlay.style.left = '0';
    ashuraOverlay.style.width = '100%';
    ashuraOverlay.style.height = '100%';
    ashuraOverlay.style.backgroundColor = 'rgba(128, 0, 80, 0.15)'; // Purple-red tint
    ashuraOverlay.style.pointerEvents = 'none';
    ashuraOverlay.style.zIndex = '1005';
    ashuraOverlay.style.mixBlendMode = 'color-burn';
    zoroElements.container.appendChild(ashuraOverlay);
    
    // Remove after animation
    setTimeout(() => {
        clonesContainer.remove();
        ashuraOverlay.remove();
        zoroElements.container.style.boxShadow = '';
        zoroElements.container.classList.remove('ashura-active');
    }, 3000);
}

/**
 * Play glitch effect for Zoro Mode activation
 */
function playGlitchEffect() {
    // Create glitch overlays
    const overlays = [];
    
    for (let i = 1; i <= 3; i++) {
        const overlay = document.createElement('div');
        overlay.className = `glitch-overlay glitch-${i}`;
        document.body.appendChild(overlay);
        overlays.push(overlay);
    }
    
    // Play evil laugh
    zoroAudio.laugh.currentTime = 0;
    zoroAudio.laugh.play().catch(err => console.error('Audio playback error:', err));
    
    // Remove overlays after effect
    setTimeout(() => {
        overlays.forEach(overlay => overlay.remove());
    }, 1000);
}

/**
 * Handle window resize for Zoro Mode
 */
function handleZoroResize() {
    if (!zoroState.active) return;
    
    // Resize canvas
    zoroElements.canvas.width = window.innerWidth;
    zoroElements.canvas.height = window.innerHeight;
}

/**
 * Remove all Zoro UI elements
 */
function removeZoroUIElements() {
    const elements = [
        '.zoro-lives',
        '.zoro-power-ups',
        '.zoro-combo',
        '.sword-slash',
        '.ashura-clones'
    ];
    
    elements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });
}

// Check if a string is the Konami code-like sequence to trigger Zoro Mode
function isZoroTriggerSequence(str) {
    return str.toLowerCase() === 'zoro';
}

// Export Zoro Mode module
window.zoroModule = {
    init: initZoroMode,
    activate: activateZoroMode,
    exit: exitZoroMode,
    isZoroTriggerSequence
};

/**
 * Load word lists from JSON file
 */
function loadZoroWordLists() {
    fetch('zorotypinggamewords.json')
        .then(response => response.json())
        .then(data => {
            zoroState.wordLists = data;
            console.log('Zoro word lists loaded successfully');
        })
        .catch(error => {
            console.error('Error loading Zoro word lists:', error);
            // Fallback to default random words if JSON can't be loaded
        });
}

/**
 * Get a word from the current difficulty tier
 * @returns {string} A random word appropriate for current difficulty
 */
function getZoroThemeWord() {
    // If word lists haven't been loaded yet, use a fallback
    if (!zoroState.wordLists) {
        return getRandomWord(4); // Fallback to default random word
    }
    
    // Get the current difficulty tier name
    const currentTier = zoroState.difficultyTiers[zoroState.difficultyIndex];
    
    // Get the word list for current tier
    const wordList = zoroState.wordLists[currentTier];
    
    // Return random word from the list
    return wordList[Math.floor(Math.random() * wordList.length)];
}
