// Game configuration
const gameConfig = {
    gravity: 0.2,
    initialLives: 3,
    initialSpawnRate: 1500, // milliseconds
    minSpawnRate: 500, // fastest spawn rate
    spawnRateDecrease: 50, // decrease spawn rate by this amount after each item
    basketSpeed: 7,
    itemTypes: [
        { type: 'apple', points: 10, color: '#FF0000', radius: 15, speed: 2 },
        { type: 'orange', points: 15, color: '#FFA500', radius: 15, speed: 2.5 },
        { type: 'banana', points: 20, color: '#FFFF00', radius: 20, speed: 3 },
        { type: 'bomb', points: -30, color: '#000000', radius: 15, speed: 3.5 }
    ]
};

// Game state
const gameState = {
    canvas: null,
    ctx: null,
    basket: {
        x: 0,
        y: 0,
        width: 80,
        height: 50,
        color: '#8B4513'
    },
    fallingItems: [],
    score: 0,
    lives: gameConfig.initialLives,
    gameActive: false,
    spawnRate: gameConfig.initialSpawnRate,
    lastSpawnTime: 0,
    keysPressed: {
        left: false,
        right: false
    },
    touchX: null,
    canvasRect: null
};

// Initialize the game
function initGame() {
    // Get canvas and context
    gameState.canvas = document.getElementById('gameCanvas');
    gameState.ctx = gameState.canvas.getContext('2d');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Set up event listeners
    setupEventListeners();

    // Show start screen
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
}

// Resize canvas to fit container
function resizeCanvas() {
    const gameArea = document.querySelector('.game-area');
    gameState.canvas.width = gameArea.clientWidth;
    gameState.canvas.height = gameArea.clientHeight;
    gameState.canvasRect = gameState.canvas.getBoundingClientRect();
    
    // Position basket at the bottom center
    resetBasketPosition();
}

// Reset basket position
function resetBasketPosition() {
    gameState.basket.x = (gameState.canvas.width - gameState.basket.width) / 2;
    gameState.basket.y = gameState.canvas.height - gameState.basket.height - 10;
}

// Set up event listeners
function setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') gameState.keysPressed.left = true;
        if (e.key === 'ArrowRight') gameState.keysPressed.right = true;
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') gameState.keysPressed.left = false;
        if (e.key === 'ArrowRight') gameState.keysPressed.right = false;
    });

    // Touch controls
    gameState.canvas.addEventListener('touchstart', handleTouch);
    gameState.canvas.addEventListener('touchmove', handleTouch);
    gameState.canvas.addEventListener('touchend', () => { gameState.touchX = null; });

    // Mobile control buttons
    document.getElementById('leftBtn').addEventListener('mousedown', () => { gameState.keysPressed.left = true; });
    document.getElementById('leftBtn').addEventListener('mouseup', () => { gameState.keysPressed.left = false; });
    document.getElementById('leftBtn').addEventListener('touchstart', () => { gameState.keysPressed.left = true; });
    document.getElementById('leftBtn').addEventListener('touchend', () => { gameState.keysPressed.left = false; });

    document.getElementById('rightBtn').addEventListener('mousedown', () => { gameState.keysPressed.right = true; });
    document.getElementById('rightBtn').addEventListener('mouseup', () => { gameState.keysPressed.right = false; });
    document.getElementById('rightBtn').addEventListener('touchstart', () => { gameState.keysPressed.right = true; });
    document.getElementById('rightBtn').addEventListener('touchend', () => { gameState.keysPressed.right = false; });

    // Game buttons
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', startGame);
}

// Handle touch events
function handleTouch(e) {
    e.preventDefault();
    
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        gameState.touchX = touch.clientX - gameState.canvasRect.left;
    }
}

// Start the game
function startGame() {
    gameState.gameActive = true;
    gameState.score = 0;
    gameState.lives = gameConfig.initialLives;
    gameState.fallingItems = [];
    gameState.spawnRate = gameConfig.initialSpawnRate;
    gameState.lastSpawnTime = Date.now();

    // Update UI
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;

    // Hide screens
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');

    // Reset basket position
    resetBasketPosition();

    // Start game loop
    requestAnimationFrame(gameLoop);
}

// End the game
function endGame() {
    gameState.gameActive = false;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

// Spawn a new item
function spawnItem() {
    const itemTypeIdx = Math.floor(Math.random() * gameConfig.itemTypes.length);
    const itemType = gameConfig.itemTypes[itemTypeIdx];
    
    const item = {
        x: Math.random() * (gameState.canvas.width - 2 * itemType.radius) + itemType.radius,
        y: -itemType.radius,
        speedY: itemType.speed,
        ...itemType
    };
    
    gameState.fallingItems.push(item);
    
    // Decrease spawn rate (increase difficulty)
    if (gameState.spawnRate > gameConfig.minSpawnRate) {
        gameState.spawnRate -= gameConfig.spawnRateDecrease;
    }
}

// Update basket position
function updateBasket() {
    const basket = gameState.basket;
    
    // Keyboard control
    if (gameState.keysPressed.left) {
        basket.x -= gameConfig.basketSpeed;
    }
    if (gameState.keysPressed.right) {
        basket.x += gameConfig.basketSpeed;
    }
    
    // Touch control
    if (gameState.touchX !== null) {
        const targetX = gameState.touchX - basket.width / 2;
        const diffX = targetX - basket.x;
        
        // Smooth movement
        if (Math.abs(diffX) > 5) {
            basket.x += Math.sign(diffX) * Math.min(gameConfig.basketSpeed, Math.abs(diffX));
        }
    }
    
    // Keep basket within boundaries
    if (basket.x < 0) {
        basket.x = 0;
    } else if (basket.x + basket.width > gameState.canvas.width) {
        basket.x = gameState.canvas.width - basket.width;
    }
}

// Update falling items
function updateItems() {
    const now = Date.now();
    
    // Spawn new items
    if (now - gameState.lastSpawnTime > gameState.spawnRate) {
        spawnItem();
        gameState.lastSpawnTime = now;
    }
    
    // Update items positions
    for (let i = gameState.fallingItems.length - 1; i >= 0; i--) {
        const item = gameState.fallingItems[i];
        
        // Apply gravity
        item.y += item.speedY;
        
        // Check if item is caught
        if (checkCollision(item, gameState.basket)) {
            // Update score
            gameState.score += item.points;
            document.getElementById('score').textContent = gameState.score;
            
            // Remove caught item
            gameState.fallingItems.splice(i, 1);
            
            // Play sound effect (implement this later)
            // playSound(item.type);
            
        } 
        // Check if item is missed
        else if (item.y > gameState.canvas.height + item.radius) {
            if (item.type !== 'bomb') { // Don't penalize for missing bombs
                gameState.lives--;
                document.getElementById('lives').textContent = gameState.lives;
            }
            
            // Remove missed item
            gameState.fallingItems.splice(i, 1);
            
            // Check game over condition
            if (gameState.lives <= 0) {
                endGame();
                return;
            }
        }
    }
}

// Check collision between item and basket
function checkCollision(item, basket) {
    // Simple rectangular collision detection
    const itemBottom = item.y + item.radius;
    const itemLeft = item.x - item.radius;
    const itemRight = item.x + item.radius;
    
    const basketTop = basket.y;
    const basketLeft = basket.x;
    const basketRight = basket.x + basket.width;
    
    return (
        itemBottom >= basketTop &&
        itemBottom <= basketTop + basket.height &&
        itemRight >= basketLeft &&
        itemLeft <= basketRight
    );
}

// Draw the game
function drawGame() {
    const ctx = gameState.ctx;
    
    // Clear canvas
    ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    
    // Draw background
    ctx.fillStyle = '#e9f5ff';
    ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    
    // Draw basket
    ctx.fillStyle = gameState.basket.color;
    ctx.fillRect(
        gameState.basket.x, 
        gameState.basket.y, 
        gameState.basket.width, 
        gameState.basket.height
    );
    
    // Add basket details
    ctx.strokeStyle = '#5D3600';
    ctx.lineWidth = 3;
    ctx.strokeRect(
        gameState.basket.x, 
        gameState.basket.y, 
        gameState.basket.width, 
        gameState.basket.height
    );
    
    // Draw basket handle
    ctx.beginPath();
    ctx.arc(
        gameState.basket.x + gameState.basket.width / 2,
        gameState.basket.y,
        gameState.basket.width / 2,
        Math.PI, 2 * Math.PI
    );
    ctx.stroke();
    
    // Draw falling items
    gameState.fallingItems.forEach(item => {
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius, 0, 2 * Math.PI);
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw item details based on type
        if (item.type === 'apple') {
            // Draw apple stem
            ctx.beginPath();
            ctx.moveTo(item.x, item.y - item.radius);
            ctx.lineTo(item.x + 3, item.y - item.radius - 5);
            ctx.strokeStyle = '#5D3600';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (item.type === 'bomb') {
            // Draw fuse
            ctx.beginPath();
            ctx.moveTo(item.x, item.y - item.radius);
            ctx.lineTo(item.x, item.y - item.radius - 8);
            ctx.strokeStyle = '#5D3600';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw spark
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(item.x - 3, item.y - item.radius - 8, 6, 6);
        }
    });
}

// Game loop
function gameLoop() {
    if (!gameState.gameActive) return;
    
    updateBasket();
    updateItems();
    drawGame();
    
    requestAnimationFrame(gameLoop);
}

// Initialize game when page loads
window.addEventListener('load', initGame);