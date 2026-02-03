// ====================================
// Pokémon-Style Valentine Battle Game
// Dialogue System with Typewriter Effect
// ====================================

// DOM Elements
const battleMessage = document.getElementById('battle-message');
const playerHpBar = document.querySelector('.player-hp');
const enemyHpBar = document.querySelector('.enemy-hp');
const playerHpCurrent = document.getElementById('player-hp-current');
const playerHpMax = document.getElementById('player-hp-max');
const playerAvatar = document.getElementById('player-avatar');
const opponentAvatar = document.getElementById('opponent-avatar');

// Audio Elements
const bgm = document.getElementById('bgm');
const musicToggle = document.getElementById('music-toggle');
const startOverlay = document.getElementById('start-overlay');
const startButton = document.getElementById('start-button');

// Game State Object
const gameState = {
    player: {
        name: 'ISH',
        health: 100,
        maxHealth: 100,
        avatar: playerAvatar
    },
    enemy: {
        name: 'SURYA',
        health: 100,
        maxHealth: 100,
        avatar: opponentAvatar
    },
    turn: 'player',
    battleActive: false,
    dialogueActive: false,
    currentTypewriter: null,
    menuState: 'main', // 'main', 'fight', 'bag'
    canRun: true,
    musicStarted: false,
    musicMuted: false,
    defaultVolume: 0.4,
    confessionVolume: 0.2,
    buttonsLocked: false, // Prevent double-clicks
    heartFlurryActive: false // Prevent heart spam
};

// ====================================
// BACKGROUND MUSIC SYSTEM
// ====================================

/**
 * Start background music
 */
function startMusic() {
    if (!gameState.musicStarted && bgm) {
        bgm.volume = gameState.defaultVolume;
        bgm.play().then(() => {
            gameState.musicStarted = true;
            console.log('Background music started!');
        }).catch(error => {
            console.log('Could not autoplay music:', error);
        });
    }
}

/**
 * Toggle mute/unmute
 */
function toggleMute() {
    if (!bgm) return;
    
    gameState.musicMuted = !gameState.musicMuted;
    bgm.muted = gameState.musicMuted;
    
    if (musicToggle) {
        musicToggle.textContent = gameState.musicMuted ? '🔇' : '🔊';
    }
}

/**
 * Set music volume
 */
function setMusicVolume(volume) {
    if (bgm && !gameState.musicMuted) {
        bgm.volume = volume;
    }
}

/**
 * Lower volume for confession moment
 */
function lowerMusicVolume() {
    setMusicVolume(gameState.confessionVolume);
}

/**
 * Restore normal volume
 */
function restoreMusicVolume() {
    setMusicVolume(gameState.defaultVolume);
}

// ====================================
// DIALOGUE BOX SYSTEM
// ====================================

/**
 * Display text in dialogue box with typewriter effect
 * @param {string} text - The text to display
 * @param {number} speed - Speed in milliseconds per character (default: 50)
 * @returns {Promise} - Resolves when text is fully displayed
 */
function showDialogue(text, speed = 50) {
    return new Promise((resolve) => {
        // Clear any existing typewriter effect
        if (gameState.currentTypewriter) {
            clearTimeout(gameState.currentTypewriter);
        }
        
        // Clear dialogue box
        clearDialogue();
        
        gameState.dialogueActive = true;
        let index = 0;
        
        function typeNextCharacter() {
            if (index < text.length) {
                battleMessage.textContent += text.charAt(index);
                index++;
                gameState.currentTypewriter = setTimeout(typeNextCharacter, speed);
            } else {
                gameState.dialogueActive = false;
                gameState.currentTypewriter = null;
                resolve();
            }
        }
        
        typeNextCharacter();
    });
}

/**
 * Clear the dialogue box
 */
function clearDialogue() {
    if (battleMessage) {
        battleMessage.textContent = '';
    }
}

/**
 * Display text immediately without typewriter effect
 * @param {string} text - The text to display
 */
function setDialogue(text) {
    if (gameState.currentTypewriter) {
        clearTimeout(gameState.currentTypewriter);
        gameState.currentTypewriter = null;
    }
    gameState.dialogueActive = false;
    
    if (battleMessage) {
        battleMessage.textContent = text;
    }
}

/**
 * Display multiple dialogue messages in sequence
 * @param {Array<string>} messages - Array of messages to display
 * @param {number} speed - Speed in milliseconds per character
 * @param {number} pauseBetween - Pause in milliseconds between messages (default: 800)
 * @returns {Promise} - Resolves when all messages are displayed
 */
async function showDialogueSequence(messages, speed = 50, pauseBetween = 800) {
    for (let i = 0; i < messages.length; i++) {
        await showDialogue(messages[i], speed);
        if (i < messages.length - 1) {
            await new Promise(resolve => setTimeout(resolve, pauseBetween));
        }
    }
}

// ====================================
// HELPER FUNCTIONS
// ====================================

// Legacy function for backwards compatibility
function updateBattleMessage(message) {
    setDialogue(message);
}

// Update Health Bar
function updateHealthBar(target, healthPercentage) {
    const healthBar = target === 'player' ? playerHpBar : enemyHpBar;
    if (healthBar) {
        healthBar.style.width = `${healthPercentage}%`;
        
        // Change color based on health
        if (healthPercentage > 50) {
            healthBar.style.background = '#10dc60';
        } else if (healthPercentage > 25) {
            healthBar.style.background = '#ffeb3b';
        } else {
            healthBar.style.background = '#ff4757';
        }
    }
}

// Update HP Text Display
function updateHpText(current, max) {
    if (playerHpCurrent) playerHpCurrent.textContent = current;
    if (playerHpMax) playerHpMax.textContent = max;
}

// Shake Animation for Sprite
function shakeSprite(target) {
    const sprite = target === 'player' ? playerAvatar : opponentAvatar;
    if (sprite) {
        sprite.style.animation = 'none';
        setTimeout(() => {
            sprite.style.animation = '';
        }, 10);
    }
}

/**
 * Screen shake effect
 * @param {string} intensity - 'normal' or 'intense'
 */
function shakeScreen(intensity = 'normal') {
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return;
    
    const shakeClass = intensity === 'intense' ? 'shake-intense' : 'shake';
    gameContainer.classList.add(shakeClass);
    
    setTimeout(() => {
        gameContainer.classList.remove(shakeClass);
    }, intensity === 'intense' ? 600 : 500);
}

/**
 * Add text emphasis effect
 */
function emphasizeDialogue() {
    if (battleMessage) {
        battleMessage.classList.add('emphasis');
        setTimeout(() => {
            battleMessage.classList.remove('emphasis');
        }, 500);
    }
}

/**
 * Add nervous text effect
 */
function makeDialogueNervous() {
    if (battleMessage) {
        battleMessage.classList.add('nervous');
    }
}

/**
 * Remove nervous text effect
 */
function removeNervousDialogue() {
    if (battleMessage) {
        battleMessage.classList.remove('nervous');
    }
}

// ====================================
// MENU SYSTEM
// ====================================

/**
 * Get all menu buttons
 */
function getMenuButtons() {
    return Array.from(document.querySelectorAll('.menu-button'));
}

/**
 * Show main menu (Fight, Bag, Run, Heart)
 */
function showMainMenu() {
    gameState.menuState = 'main';
    gameState.buttonsLocked = false;
    const buttons = getMenuButtons();
    
    if (buttons.length >= 4) {
        buttons[0].textContent = 'FIGHT';
        buttons[0].onclick = handleFightClick;
        buttons[0].disabled = false;
        buttons[0].classList.remove('disabled');
        
        buttons[1].textContent = 'BAG';
        buttons[1].onclick = handleBagClick;
        buttons[1].disabled = false;
        buttons[1].classList.remove('disabled');
        
        buttons[2].textContent = 'RUN';
        buttons[2].onclick = handleRunClick;
        buttons[2].disabled = !gameState.canRun;
        buttons[2].classList.remove('disabled');
        if (!gameState.canRun) {
            buttons[2].classList.add('disabled');
        }
        
        buttons[3].textContent = '♥';
        buttons[3].onclick = handleHeartFlurry;
        buttons[3].disabled = false;
        buttons[3].classList.remove('empty-slot', 'disabled');
        buttons[3].classList.add('heart-slot');
    }
}

/**
 * Show fight menu with move options
 */
function showFightMenu() {
    gameState.menuState = 'fight';
    const buttons = getMenuButtons();
    
    // Only one move: Ask Her Out
    const moves = [
        { name: '💘 ASK HER OUT', action: 'ask-out', hoverText: 'It\'s risky... but feels right.' },
        { name: '← BACK', action: 'back', hoverText: null }
    ];
    
    buttons.forEach((button, index) => {
        button.classList.remove('empty-slot');
        button.classList.remove('disabled');
        button.disabled = false;
        
        if (index < moves.length) {
            const move = moves[index];
            button.textContent = move.name;
            
            // Add hover text functionality
            if (move.hoverText) {
                button.onmouseenter = () => {
                    if (!button.disabled && gameState.menuState === 'fight') {
                        setDialogue(move.hoverText);
                    }
                };
                button.onmouseleave = () => {
                    if (!button.disabled && gameState.menuState === 'fight') {
                        setDialogue('Choose your move!');
                    }
                };
            } else {
                button.onmouseenter = null;
                button.onmouseleave = null;
            }
            
            // Add click handler
            if (move.action === 'back') {
                button.onclick = () => {
                    showMainMenu();
                    setDialogue('What will ISH do?');
                };
            } else if (move.action === 'ask-out') {
                button.onclick = () => {
                    console.log('Ask Her Out button clicked!');
                    // Immediately remove hover handlers to prevent interference
                    button.onmouseenter = null;
                    button.onmouseleave = null;
                    handleAskOut();
                };
            }
        } else {
            // Empty slots
            button.textContent = '';
            button.onclick = null;
            button.onmouseenter = null;
            button.onmouseleave = null;
            button.classList.add('empty-slot');
        }
    });
}

/**
 * Handle Fight button click
 */
async function handleFightClick() {
    if (gameState.buttonsLocked) return;
    gameState.buttonsLocked = true;
    
    await showDialogue('Choose your move!');
    showFightMenu();
}

/**
 * Handle "Ask Her Out" move
 */
async function handleAskOut() {
    console.log('handleAskOut called!');
    
    try {
        // Lower music volume for confession moment
        lowerMusicVolume();
        
        // Disable all menu buttons
        const buttons = getMenuButtons();
        buttons.forEach(button => {
            button.disabled = true;
            button.classList.add('disabled');
        });
        
        // Animate player avatar (nervous shake)
        if (playerAvatar) {
            playerAvatar.classList.add('nervous-shake');
        }
        
        // Show initial dialogue (wait for typewriter to complete)
        console.log('Showing first dialogue...');
        await showDialogue('You gathered your courage...');
        emphasizeDialogue();
        
        // Remove animation after it completes
        setTimeout(() => {
            if (playerAvatar) {
                playerAvatar.classList.remove('nervous-shake');
            }
        }, 1000);
        
        // Wait to let user read
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Dialogue sequence with pauses
        console.log('Showing dialogue sequence...');
        await showDialogue('You took a deep breath...');
        await new Promise(resolve => setTimeout(resolve, 1800));
        
        makeDialogueNervous();
        await showDialogue('Your heart is racing...');
        await new Promise(resolve => setTimeout(resolve, 1800));
        removeNervousDialogue();
        
        await showDialogue('It\'s super effective!');
        shakeScreen('intense');
        emphasizeDialogue();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fade to black
        console.log('Fading to black...');
        await fadeToBlack();
        
        // Restore music volume after confession
        restoreMusicVolume();
        
        // Transition to new dialogue screen
        console.log('Transitioning to result screen...');
        transitionToResultScreen();
    } catch (error) {
        console.error('Error in handleAskOut:', error);
        restoreMusicVolume(); // Restore volume even on error
    }
}

/**
 * Fade the screen to black
 */
async function fadeToBlack() {
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        gameContainer.classList.add('fade-to-black');
    }
    
    // Wait for fade animation to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
}

/**
 * Transition to result screen after fade
 */
function transitionToResultScreen() {
    console.log('Transitioning to result screen...');
    
    // Unlock buttons for the new screen
    gameState.buttonsLocked = false;
    
    const gameContainer = document.querySelector('.game-container');
    
    // Clear battle area content
    const battleArea = document.querySelector('.battle-area');
    const uiContainer = document.querySelector('.ui-container');
    
    if (battleArea) {
        battleArea.style.display = 'none';
    }
    
    if (uiContainer) {
        uiContainer.style.display = 'none';
    }
    
    // Remove fade overlay
    if (gameContainer) {
        gameContainer.classList.remove('fade-to-black');
        gameContainer.classList.add('result-screen');
    }
    
    // Create Valentine question screen
    const resultScreen = document.createElement('div');
    resultScreen.className = 'result-screen-content';
    resultScreen.innerHTML = `
        <div class="result-message">
            <h1 class="result-title valentine-question">Will you be my Valentine? 💖</h1>
            <div class="button-container">
                <button class="choice-button" id="yes-button">Yes 💕</button>
                <button class="choice-button" id="yes-cute-button">YES but cuter 💗</button>
            </div>
        </div>
    `;
    
    if (gameContainer) {
        gameContainer.appendChild(resultScreen);
    }
    
    // Fade in the result screen and attach event listeners
    setTimeout(() => {
        resultScreen.classList.add('fade-in');
    }, 100);
    
    // Attach event listeners after DOM update
    setTimeout(() => {
        const yesButton = document.getElementById('yes-button');
        const yesCuteButton = document.getElementById('yes-cute-button');
        
        console.log('Attaching button listeners...', yesButton, yesCuteButton);
        
        if (yesButton) {
            yesButton.onclick = () => {
                console.log('Yes button clicked!');
                handleValentineResponse();
            };
        }
        
        if (yesCuteButton) {
            yesCuteButton.onclick = () => {
                console.log('Yes but cuter button clicked!');
                handleValentineResponse();
            };
        }
    }, 200);
}

/**
 * Handle Valentine response (both buttons trigger this)
 */
function handleValentineResponse() {
    console.log('handleValentineResponse called!');
    
    // Prevent double-click
    if (gameState.buttonsLocked) {
        console.log('Buttons locked, ignoring click');
        return;
    }
    gameState.buttonsLocked = true;
    
    console.log('Valentine accepted!');
    
    // Disable buttons immediately
    const buttons = document.querySelectorAll('.choice-button');
    console.log('Found buttons:', buttons.length);
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.5';
    });
    
    const resultScreen = document.querySelector('.result-screen-content');
    
    // Screen shake on acceptance!
    shakeScreen('intense');
    
    // Fade out current screen
    if (resultScreen) {
        resultScreen.classList.add('fade-out');
    }
    
    // Wait for fade out, then show final message
    setTimeout(() => {
        showFinalMessage();
    }, 800);
}

/**
 * Show final Valentine message
 */
function showFinalMessage() {
    const resultScreen = document.querySelector('.result-screen-content');
    
    if (resultScreen) {
        resultScreen.innerHTML = `
            <div class="win-screen">
                <!-- Floating Hearts Background - LOTS OF THEM! -->
                <div class="floating-hearts">
                    <span class="heart heart-1">💕</span>
                    <span class="heart heart-2">💖</span>
                    <span class="heart heart-3">💗</span>
                    <span class="heart heart-4">💘</span>
                    <span class="heart heart-5">💝</span>
                    <span class="heart heart-6">💕</span>
                    <span class="heart heart-7">💖</span>
                    <span class="heart heart-8">💗</span>
                    <span class="heart heart-9">💘</span>
                    <span class="heart heart-10">💝</span>
                    <span class="heart heart-11">💕</span>
                    <span class="heart heart-12">💖</span>
                    <span class="heart heart-13">💗</span>
                    <span class="heart heart-14">💘</span>
                    <span class="heart heart-15">💝</span>
                    <span class="heart heart-16">💕</span>
                    <span class="heart heart-17">💖</span>
                    <span class="heart heart-18">💗</span>
                    <span class="heart heart-19">💘</span>
                    <span class="heart heart-20">💝</span>
                </div>
                
                <!-- Sparkles -->
                <div class="sparkles">
                    <span class="sparkle sparkle-1">✨</span>
                    <span class="sparkle sparkle-2">⭐</span>
                    <span class="sparkle sparkle-3">✨</span>
                    <span class="sparkle sparkle-4">⭐</span>
                    <span class="sparkle sparkle-5">✨</span>
                    <span class="sparkle sparkle-6">⭐</span>
                </div>
                
                <!-- Premi Image (No Background) -->
                <div class="premi-container">
                    <img src="assets/premi.png" alt="Valentine Pair" class="premi-image">
                </div>
                
                <!-- Victory Text -->
                <div class="victory-text">
                    <h1 class="victory-title">You and Surya are now a Valentine pair!</h1>
                    <p class="quest-unlock">✨ New quest unlocked: A Beautiful Life Together 💘</p>
                </div>
            </div>
        `;
        
        // Remove fade-out class and add fade-in
        resultScreen.classList.remove('fade-out');
        resultScreen.classList.add('fade-in');
    }
}

/**
 * Handle Bag button click
 */
async function handleBagClick() {
    if (gameState.buttonsLocked) {
        console.log('Bag click ignored - buttons locked');
        return;
    }
    
    console.log('Bag clicked - starting...');
    gameState.buttonsLocked = true;
    
    try {
        console.log('Showing bag dialogue...');
        await showDialogue('BAG: Chatpati Baatein 🌶️ | Ma ka bhosda AAAG 🔥 | Gehra Pyaar 💖');
        
        console.log('Waiting for user to read...');
        // Wait to let user read the message
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('Returning to prompt...');
        // Return to prompt
        setDialogue('What will ISH do?');
        
        console.log('Bag action complete!');
    } catch (error) {
        console.error('Error in handleBagClick:', error);
        setDialogue('What will ISH do?');
    } finally {
        // Always unlock buttons, even if there's an error
        gameState.buttonsLocked = false;
        console.log('Buttons unlocked');
    }
}

/**
 * Handle Heart button click - Unleash heart flurry!
 */
function handleHeartFlurry() {
    // Prevent spam clicking
    if (gameState.heartFlurryActive) return;
    gameState.heartFlurryActive = true;
    
    console.log('Heart flurry activated! 💕');
    
    // Screen shake on activation
    shakeScreen('normal');
    
    // Create heart container
    const gameContainer = document.querySelector('.game-container');
    const heartContainer = document.createElement('div');
    heartContainer.className = 'heart-flurry-container';
    gameContainer.appendChild(heartContainer);
    
    // Generate multiple hearts
    const heartEmojis = ['💕', '💖', '💗', '💘', '💝', '💞', '💓', '💟'];
    const numHearts = 30;
    
    for (let i = 0; i < numHearts; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'flurry-heart';
            heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
            
            // Random starting position (from center)
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const angle = (Math.PI * 2 * i) / numHearts;
            const distance = 50 + Math.random() * 100;
            
            heart.style.left = `${centerX + Math.cos(angle) * distance}px`;
            heart.style.top = `${centerY + Math.sin(angle) * distance}px`;
            
            // Random animation properties
            heart.style.setProperty('--tx', `${(Math.random() - 0.5) * 400}px`);
            heart.style.setProperty('--ty', `${-200 - Math.random() * 200}px`);
            heart.style.setProperty('--rotate', `${Math.random() * 720 - 360}deg`);
            heart.style.animationDelay = `${Math.random() * 0.3}s`;
            
            heartContainer.appendChild(heart);
        }, i * 30);
    }
    
    // Cleanup and re-enable
    setTimeout(() => {
        heartContainer.remove();
        gameState.heartFlurryActive = false;
    }, 2500);
}

/**
 * Handle Run button click
 */
async function handleRunClick() {
    if (!gameState.canRun || gameState.buttonsLocked) return;
    gameState.buttonsLocked = true;
    
    const runButton = getMenuButtons()[2];
    
    // Add shake animation
    runButton.classList.add('shake');
    
    // Show message (wait for typewriter to complete)
    await showDialogue('You can\'t run from love.');
    
    // Disable run button permanently
    gameState.canRun = false;
    runButton.disabled = true;
    runButton.classList.add('disabled');
    
    // Remove shake animation after it completes
    setTimeout(() => {
        runButton.classList.remove('shake');
    }, 500);
    
    // Wait to let user read the message
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return to prompt
    setDialogue('What will ISH do?');
    gameState.buttonsLocked = false;
}

// ====================================
// GAME INITIALIZATION
// ====================================

/**
 * Initialize the game (called after start button)
 */
async function initGame() {
    console.log('Pokémon-Style Battle System Initialized!');
    console.log('Game State:', gameState);
    
    // Setup menu buttons
    showMainMenu();
    
    // Show opening dialogue with typewriter effect (wait for it to complete)
    await showDialogue('A wild Valentine appeared!');
    
    // Wait a moment to let user read, then show prompt
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setDialogue('What will ISH do?');
    
    console.log('Battle system ready!');
}

/**
 * Handle start button click
 */
function handleStartButton() {
    // Start music
    startMusic();
    
    // Hide start overlay
    if (startOverlay) {
        startOverlay.classList.add('fade-out-overlay');
        setTimeout(() => {
            startOverlay.style.display = 'none';
        }, 800);
    }
    
    // Initialize game
    initGame();
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
    setupEventListeners();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Start button
    if (startButton) {
        startButton.addEventListener('click', handleStartButton);
    }
    
    // Music toggle button
    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMute);
    }
    
    console.log('Event listeners ready. Click Start to begin!');
}

// ====================================
// EXPORT FUNCTIONS FOR EXTERNAL USE
// ====================================

window.gameState = gameState;
window.showDialogue = showDialogue;
window.clearDialogue = clearDialogue;
window.setDialogue = setDialogue;
window.showDialogueSequence = showDialogueSequence;
window.updateBattleMessage = updateBattleMessage;
window.updateHealthBar = updateHealthBar;
window.updateHpText = updateHpText;
window.shakeSprite = shakeSprite;
window.shakeScreen = shakeScreen;
window.emphasizeDialogue = emphasizeDialogue;
window.makeDialogueNervous = makeDialogueNervous;
window.removeNervousDialogue = removeNervousDialogue;
window.showMainMenu = showMainMenu;
window.showFightMenu = showFightMenu;
window.fadeToBlack = fadeToBlack;
window.transitionToResultScreen = transitionToResultScreen;
window.handleValentineResponse = handleValentineResponse;
window.showFinalMessage = showFinalMessage;
window.startMusic = startMusic;
window.toggleMute = toggleMute;
window.setMusicVolume = setMusicVolume;