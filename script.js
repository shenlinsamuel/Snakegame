// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRID_SIZE = 20;
const GRID_COUNT = canvas.width / GRID_SIZE;
const SPEED = 150; // milliseconds between moves

// Game state
let gameRunning = false;
let gameOver = false;
let score = 0;
let gameInterval = null;

// Snake object
let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };

// Food object
let food = { x: 5, y: 5 };

// DOM elements
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreValue = document.getElementById('scoreValue');
const finalScore = document.getElementById('finalScore');

// Initialize game
function init() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    score = 0;
    gameRunning = true;
    gameOver = false;
    gameOverScreen.classList.remove('show');
    scoreValue.textContent = '0';
    startBtn.disabled = true;
    spawnFood();
    
    // Clear any existing interval
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    // Start the game loop
    gameInterval = setInterval(gameLoop, SPEED);
}

// Spawn food at random location
function spawnFood() {
    let newFood;
    let isFoodOnSnake;

    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_COUNT),
            y: Math.floor(Math.random() * GRID_COUNT)
        };

        isFoodOnSnake = snake.some(segment =>
            segment.x === newFood.x && segment.y === newFood.y
        );
    } while (isFoodOnSnake);

    food = newFood;
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
}

// Update game state
function update() {
    // Calculate new head position
    const head = snake[0];
    let newHead = {
        x: (head.x + direction.x + GRID_COUNT) % GRID_COUNT,
        y: (head.y + direction.y + GRID_COUNT) % GRID_COUNT
    };

    // Check self-collision
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        endGame();
        return;
    }

    // Add new head
    snake.unshift(newHead);

    // Check if food eaten
    if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        scoreValue.textContent = score;
        spawnFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

// Draw game
function draw() {
    // Clear canvas with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }

    // Draw food with glow
    drawFood();

    // Draw snake with glow
    drawSnake();
}

// Draw snake with glow effect
function drawSnake() {
    snake.forEach((segment, index) => {
        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;

        // Glow effect
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Head is brighter
        if (index === 0) {
            ctx.fillStyle = '#ff5555';
            ctx.shadowBlur = 15;
        } else {
            ctx.fillStyle = '#ff0000';
            ctx.shadowBlur = 8;
        }

        ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    });

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

// Draw food with glow effect
function drawFood() {
    const x = food.x * GRID_SIZE;
    const y = food.y * GRID_SIZE;

    // Glow effect
    ctx.shadowColor = '#ff3333';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = '#ff3333';

    // Draw as a circle
    const centerX = x + GRID_SIZE / 2;
    const centerY = y + GRID_SIZE / 2;
    const radius = (GRID_SIZE - 4) / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

// End game
function endGame() {
    gameRunning = false;
    gameOver = true;
    
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    finalScore.textContent = score;
    gameOverScreen.classList.add('show');
    startBtn.disabled = false;
}

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    // Arrow key support
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (direction.y === 0) direction = { x: 0, y: -1 };
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (direction.y === 0) direction = { x: 0, y: 1 };
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (direction.x === 0) direction = { x: -1, y: 0 };
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (direction.x === 0) direction = { x: 1, y: 0 };
    }
});

// Button event listeners
startBtn.addEventListener('click', () => {
    init();
});

restartBtn.addEventListener('click', () => {
    init();
});

// Initial render
draw();

// Touch support for mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

canvas.addEventListener('touchend', (e) => {
    if (!gameRunning) return;

    const touch = e.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    const threshold = 50;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > threshold && direction.x === 0) {
            direction = { x: 1, y: 0 };
        } else if (diffX < -threshold && direction.x === 0) {
            direction = { x: -1, y: 0 };
        }
    } else {
        if (diffY > threshold && direction.y === 0) {
            direction = { x: 0, y: 1 };
        } else if (diffY < -threshold && direction.y === 0) {
            direction = { x: 0, y: -1 };
        }
    }
});
