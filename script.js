const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const scoreElement = document.getElementById('score-value');
const livesElement = document.getElementById('lives-value');
const finalScoreElement = document.getElementById('final-score');
const player = document.getElementById('player');
const gameArea = document.getElementById('game-area');
const backgroundMusic = new Audio('background-music.mp3');
const collisionSound = new Audio('collision-sound.mp3');
const muteButton = document.getElementById('mute-button');
const pauseButton = document.getElementById('pause-button');

let score = 0;
let lives = 3;
let playerPosition = 50;
let obstacles = [];
let isMuted = false;
let isGameRunning = false;
let isPaused = false;
let lastTime = 0;
let obstacleInterval = 0;
let gameSpeed = 1;
let obstacleFrequency = 1500;
let lastTimestamp = 0;


backgroundMusic.loop = true;

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
document.addEventListener('keydown', movePlayer);
muteButton.addEventListener('click', toggleMute);
pauseButton.addEventListener('click', togglePause);

function startGame() {
    menuScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    score = 0;
    lives = 3;
    playerPosition = 50;
    obstacles = [];
    gameSpeed = 1;
    obstacleFrequency = 1500;
    updateScore();
    updateLives();
    player.style.left = `${playerPosition}%`;
    backgroundMusic.volume = 0.6;
    if (!isMuted) {
        backgroundMusic.play();
    }
    isGameRunning = true;
    isPaused = false;
    lastTime = 0;
    obstacleInterval = 0;
    pauseButton.textContent = 'Pause';
    lastTimestamp = performance.now();
    requestAnimationFrame(gameLoop);
}

function movePlayer(e) {
    if (!isGameRunning || isPaused) return;
    if (e.key === 'ArrowLeft' && playerPosition > 0) {
        playerPosition -= 5;
    } else if (e.key === 'ArrowRight' && playerPosition < 100) {
        playerPosition += 5;
    }
    player.style.left = `${playerPosition}%`;
}

function gameLoop(timestamp) {
    if (!isGameRunning) return;
    if (isPaused) {
      lastTimestamp = timestamp;
      requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    score++;
    updateScore();
    
    obstacleInterval += deltaTime;
    if (obstacleInterval > obstacleFrequency) {
        createObstacle();
        obstacleInterval = 0;
    }
    
    moveObstacles(deltaTime);
    checkCollision();
    increaseDifficulty();

    requestAnimationFrame(gameLoop);
}

function createObstacle() {
  const obstacle = document.createElement('img');
  obstacle.src = 'efa.jpg';
  obstacle.classList.add('obstacle');
  obstacle.style.left = `${Math.random() * 90}%`;
  obstacle.style.top = '-50px';
  gameArea.appendChild(obstacle);
  obstacles.push({ element: obstacle, position: -50 });
}

function moveObstacles(deltaTime) {
    obstacles.forEach((obstacle, index) => {
        obstacle.position += 0.2 * deltaTime * gameSpeed;
        obstacle.element.style.top = `${obstacle.position}px`;
        
        if (obstacle.position > window.innerHeight) {
            obstacle.element.remove();
            obstacles.splice(index, 1);
        }
    });
}

function checkCollision() {
    const playerRect = player.getBoundingClientRect();
    obstacles.forEach((obstacle, index) => {
        const obstacleRect = obstacle.element.getBoundingClientRect();
        if (
            playerRect.left < obstacleRect.right &&
            playerRect.right > obstacleRect.left &&
            playerRect.top < obstacleRect.bottom &&
            playerRect.bottom > obstacleRect.top
        ) {
            if (!isMuted) {
                duckBackgroundMusic();
                collisionSound.play();
            }
            lives--;
            updateLives();
            obstacle.element.remove();
            obstacles.splice(index, 1);
            if (lives <= 0) {
                endGame();
            }
        }
    });
}

function updateScore() {
    scoreElement.textContent = score;
}

function updateLives() {
    livesElement.textContent = lives;
}

function endGame() {
    isGameRunning = false;
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.textContent = score;
    obstacles.forEach(obstacle => obstacle.element.remove());
    obstacles = [];
}

function toggleMute() {
    isMuted = !isMuted;
    if (isMuted) {
        backgroundMusic.pause();
        muteButton.textContent = '🔇';
    } else {
        if (isGameRunning && !isPaused) {
            backgroundMusic.play();
            backgroundMusic.volume = 0.6;
        }
        muteButton.textContent = '🔊';
    }
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseButton.textContent = 'Resume';
        backgroundMusic.pause();
    } else {
        pauseButton.textContent = 'Pause';
        if (!isMuted) {
            backgroundMusic.play();
        }
        // Reset the lastTimestamp when unpausing to prevent a large delta time
        lastTimestamp = performance.now();
    }
}

function increaseDifficulty() {
    if (score % 500 === 0) {
        gameSpeed += 0.1;
    }
    
    if (score % 1000 === 0 && obstacleFrequency > 500) {
        obstacleFrequency -= 100;
    }
}


function duckBackgroundMusic() {
  backgroundMusic.volume = 0.2;  // Reduce volume to 20%
  setTimeout(() => {
      backgroundMusic.volume = 0.6;  // Restore volume after 1 second
  }, 1000);
}