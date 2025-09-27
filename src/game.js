import * as THREE from 'three';
import { Ball } from './Ball.js';
import { CameraController } from './Camera.js';
import { randomColor, randomPosition, randomSize, calculateSpawnRate, calculateMaxEnemies, generateAIName } from './utils.js';
import { PowerUpManager, PowerUpSpinner } from './PowerUp.js';

class Game {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.cameraController = null;
    
    this.player = null;
    this.enemies = [];
    
    this.score = 0;
    this.gameOver = false;
    this.lastSpawnTime = 0;
    this.keys = {};
    this.touchStartPos = null;
    this.touchCurrentPos = null;
    
    // Double tap detection for jump
    this.lastTapTime = 0;
    this.doubleTapThreshold = 300; // ms
    
    // Power-up system
    this.powerUpManager = new PowerUpManager();
    this.powerUpSpinner = null;
    this.spinCooldown = 0;
    this.isSpinning = false;
    
    this.init();
  }

  init() {
    this.setupScene();
    this.setupLights();
    this.createFloor();
    this.createPlayer();
    this.setupControls();
    
    this.powerUpSpinner = new PowerUpSpinner(this.scene);
    
    this.spawnInitialEnemies();
    this.updateUI();
    
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000000, 100, 500);
    this.scene.background = new THREE.Color(0x000000);
    
    const canvas = document.getElementById('gameCanvas');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.handleMobileLayout();
    });
    
    // Initial mobile layout check
    this.handleMobileLayout();
  }

  setupLights() {
    // Brighter ambient light to show terrain colors better
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);
    
    // Main directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(100, 150, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -300;
    directionalLight.shadow.camera.right = 300;
    directionalLight.shadow.camera.top = 300;
    directionalLight.shadow.camera.bottom = -300;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 800;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    
    // Secondary light from different angle for better terrain visibility
    const secondaryLight = new THREE.DirectionalLight(0xffffff, 0.3);
    secondaryLight.position.set(-50, 80, -50);
    this.scene.add(secondaryLight);
    
    // Hemisphere light for natural outdoor lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x362d1d, 0.3);
    this.scene.add(hemisphereLight);
  }

  createFloor() {
    const worldSize = 500;
    const segments = 50; // Grid resolution
    
    // Create completely flat ground plane with wireframe
    const groundGeometry = new THREE.PlaneGeometry(worldSize, worldSize, segments, segments);
    
    // Keep all vertices at Y = 0 (completely flat)
    // No height modifications
    
    // Create wireframe material
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00aa00,
      wireframe: true
    });
    
    // Create the wireframe mesh
    this.terrain = new THREE.Mesh(groundGeometry, wireframeMaterial);
    this.terrain.rotation.x = -Math.PI / 2; // Make it horizontal
    this.scene.add(this.terrain);
    
    // Store for calculations
    this.terrainGeometry = groundGeometry;
    this.worldSize = worldSize;
  }

  createPlayer() {
    const playerPos = { x: 0, y: 15, z: 0 }; // Y = radius for flat ground
    
    this.player = new Ball(playerPos.x, playerPos.y, playerPos.z, 15, 0x00ff00, this.scene, 'Player');
    this.player.isPlayer = true;
    
    this.cameraController = new CameraController(this.camera, this.player);
  }

  spawnInitialEnemies() {
    // Spawn 2 balls bigger than player to ensure player starts in top 5
    for (let i = 0; i < 2; i++) {
      const pos = randomPosition(150);
      if (Math.abs(pos.x) < 30 && Math.abs(pos.z) < 30) {
        pos.x = pos.x < 0 ? pos.x - 30 : pos.x + 30;
        pos.z = pos.z < 0 ? pos.z - 30 : pos.z + 30;
      }
      const size = randomSize(16, 25);
      const color = randomColor();
      const name = generateAIName();
      
      // Set Y position for flat ground
      pos.y = size; // Y = radius for flat ground
      
      const enemy = new Ball(pos.x, pos.y, pos.z, size, color, this.scene, name);
      this.enemies.push(enemy);
    }
    
    // Spawn fewer smaller balls for better performance
    for (let i = 0; i < 15; i++) {
      this.spawnEnemy();
    }
  }

  spawnEnemy() {
    const pos = randomPosition(200);
    // Make sure enemies spawn away from the player
    if (this.player && Math.abs(pos.x) < 20 && Math.abs(pos.z) < 20) {
      pos.x = pos.x < 0 ? pos.x - 20 : pos.x + 20;
      pos.z = pos.z < 0 ? pos.z - 20 : pos.z + 20;
    }
    
    const size = randomSize(1, 8);
    const color = randomColor();
    const name = generateAIName();
    
    // Set Y position for flat ground
    pos.y = size; // Y = radius for flat ground
    
    const enemy = new Ball(pos.x, pos.y, pos.z, size, color, this.scene, name);
    this.enemies.push(enemy);
  }

  setupControls() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      this.keys[e.key] = true;
    });
    
    window.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      this.keys[e.key] = false;
    });
    
    // Fullscreen toggle
    window.addEventListener('keydown', (e) => {
      if (e.key === 'f' || e.key === 'F') {
        this.toggleFullscreen();
      }
      // Space bar for jump (only when game is not over)
      if (e.key === ' ' && !this.gameOver && this.player) {
        e.preventDefault();
        this.playerJump();
      }
      // Direct power-up shortcuts (only when game is not over)
      if (e.key >= '1' && e.key <= '6' && !this.gameOver) {
        e.preventDefault();
        this.activatePowerUpDirect(parseInt(e.key) - 1);
      }
      // Restart game with Enter when game is over
      if (e.key === 'Enter' && this.gameOver) {
        e.preventDefault();
        this.restart();
      }
    });

    // Touch controls for iPad
    const canvas = document.getElementById('gameCanvas');
    
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.touchStartPos = {
        x: touch.clientX,
        y: touch.clientY
      };
      this.touchCurrentPos = { ...this.touchStartPos };
      
      // Double tap detection for jump
      const currentTime = Date.now();
      if (currentTime - this.lastTapTime < this.doubleTapThreshold) {
        // Double tap detected - trigger jump
        if (!this.gameOver && this.player) {
          this.playerJump();
        }
      }
      this.lastTapTime = currentTime;
    });
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.touchStartPos) {
        const touch = e.touches[0];
        this.touchCurrentPos = {
          x: touch.clientX,
          y: touch.clientY
        };
      }
    });
    
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.touchStartPos = null;
      this.touchCurrentPos = null;
    });
    
    document.getElementById('restartBtn').addEventListener('click', () => {
      this.restart();
    });
    
    document.getElementById('fullscreenBtn').addEventListener('click', () => {
      this.toggleFullscreen();
    });
    
    document.getElementById('spinBtn').addEventListener('click', () => {
      if (!this.isSpinning && this.spinCooldown <= 0 && !this.gameOver) {
        this.activateSpinner();
      }
    });
  }
  
  /**
   * Handle mobile layout - hide leaderboard and show mobile-specific instructions
   */
  handleMobileLayout() {
    const isMobile = window.innerHeight > window.innerWidth;
    const leaderboard = document.getElementById('leaderboard');
    const instructions = document.getElementById('instructions');
    
    if (leaderboard) {
      leaderboard.style.display = isMobile ? 'none' : 'block';
    }
    
    if (instructions) {
      if (isMobile) {
        instructions.innerHTML = `
          <p>📱 Touch: Swipe left/right to turn, double-tap to jump</p>
          <p>🎰 Tap SPIN button for power-ups</p>
          <p>Eat smaller balls to grow. Avoid larger balls!</p>
        `;
      } else {
        instructions.innerHTML = `
          <p>🎮 Keyboard: ↑ forward, ← → rotate, F fullscreen, Space jump</p>
          <p>🔢 Power-ups: 1 speed, 2 size, 3 PacMan, 4 Saturn, 5 Earth</p>
          <p>📱 Touch: Swipe up to move, left/right to turn</p>
          <p>Eat smaller balls to grow. Avoid larger balls!</p>
        `;
      }
    }
  }
  
  /**
   * Get terrain height at a specific x,z position
   */
  getTerrainHeight(x, z) {
    // Always return 0 for completely flat ground
    return 0;
  }
  
  /**
   * Calculate terrain slope at position
   */
  getTerrainSlope(x, z) {
    const delta = 1.0;
    const h = this.getTerrainHeight(x, z);
    const hx1 = this.getTerrainHeight(x + delta, z);
    const hx2 = this.getTerrainHeight(x - delta, z);
    const hz1 = this.getTerrainHeight(x, z + delta);
    const hz2 = this.getTerrainHeight(x, z - delta);
    
    const slopeX = (hx1 - hx2) / (2 * delta);
    const slopeZ = (hz1 - hz2) / (2 * delta);
    
    return new THREE.Vector3(slopeX, 0, slopeZ);
  }
  
  /**
   * Make the player ball jump
   */
  playerJump() {
    if (!this.player || this.player.isJumping) return;
    
    // Set jump velocity
    this.player.velocityY = 150; // Jump strength
    this.player.isJumping = true;
  }
  
  toggleFullscreen() {
    const elem = document.documentElement;
    
    if (!document.fullscreenElement && !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && !document.msFullscreenElement) {
      // Enter fullscreen
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        // Safari/iOS
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        // Firefox
        elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        // IE/Edge
        elem.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        // Safari/iOS
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        // Firefox
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        // IE/Edge
        document.msExitFullscreen();
      }
    }
  }

  handleInput() {
    if (this.gameOver || !this.player) return;
    
    const isMobile = window.innerHeight > window.innerWidth;
    const force = isMobile ? 8.0 : 2.0; // Increased mobile force for faster movement
    const rotationSpeed = 0.01;
    
    // Auto-move forward on mobile
    if (isMobile) {
      const forward = new THREE.Vector3(
        -Math.sin(this.cameraController.angle),
        0,
        -Math.cos(this.cameraController.angle)
      );
      forward.normalize().multiplyScalar(force);
      this.player.applyForce(forward);
    }
    
    // Handle touch input for rotation only
    if (this.touchStartPos && this.touchCurrentPos) {
      const deltaX = this.touchCurrentPos.x - this.touchStartPos.x;
      
      // Horizontal swipe for rotation
      if (Math.abs(deltaX) > 10) {
        this.cameraController.rotate(-deltaX * 0.001);
      }
    }
    
    // Keyboard controls (desktop only)
    if (!isMobile) {
      if (this.keys['ArrowLeft'] || this.keys['a']) {
        this.cameraController.rotate(rotationSpeed);
      }
      if (this.keys['ArrowRight'] || this.keys['d']) {
        this.cameraController.rotate(-rotationSpeed);
      }
      
      if (this.keys['ArrowUp'] || this.keys['w']) {
        const forward = new THREE.Vector3(
          -Math.sin(this.cameraController.angle),
          0,
          -Math.cos(this.cameraController.angle)
        );
        forward.normalize().multiplyScalar(force);
        this.player.applyForce(forward);
      }
    }
  }

  checkCollisions() {
    if (this.gameOver || !this.player) return;
    
    // Player vs enemies collisions
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      if (this.player.isColliding(enemy)) {
        if (this.player.canEat(enemy)) {
          const points = this.player.eat(enemy);
          this.score += points;
          enemy.destroy();
          this.enemies.splice(i, 1);
          this.updateUI();
          this.cameraController.shake(0.5, 100);
        } else if (enemy.canEat(this.player)) {
          this.endGame();
          return;
        }
      }
    }
    
    // Enemy vs enemy collisions (more aggressive)
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      for (let j = i - 1; j >= 0; j--) {
        const otherEnemy = this.enemies[j];
        
        if (enemy.isColliding(otherEnemy)) {
          if (enemy.canEat(otherEnemy)) {
            enemy.eat(otherEnemy);
            otherEnemy.destroy();
            this.enemies.splice(j, 1);
            i--; // Adjust index since we removed an enemy
          } else if (otherEnemy.canEat(enemy)) {
            otherEnemy.eat(enemy);
            enemy.destroy();
            this.enemies.splice(i, 1);
            break; // Exit inner loop since enemy is eaten
          }
          // Remove the separation push - let them compete more aggressively
        }
      }
    }
  }

  updateAI() {
    const allBalls = [this.player, ...this.enemies];
    
    this.enemies.forEach(enemy => {
      // Find nearest threat and ideal target
      const nearestThreat = enemy.findNearestThreat(allBalls);
      const idealTarget = enemy.findIdealTarget(allBalls);
      
      // Priority: Avoid threats first, then hunt ideal targets, then random walk
      if (nearestThreat) {
        enemy.avoidThreat(nearestThreat);
      } else if (idealTarget) {
        enemy.seekTarget(idealTarget);
      } else if (Math.random() < 0.2) {
        enemy.randomWalk();
      }
    });
  }

  spawnEnemies() {
    const now = Date.now();
    const spawnRate = calculateSpawnRate(this.score);
    const maxEnemies = calculateMaxEnemies(this.score);
    
    if (now - this.lastSpawnTime > spawnRate && this.enemies.length < maxEnemies) {
      this.spawnEnemy();
      this.lastSpawnTime = now;
    }
  }

  updateUI() {
    document.getElementById('scoreValue').textContent = this.score;
    document.getElementById('sizeValue').textContent = this.player.radius.toFixed(1);
    this.updateLeaderboard();
    this.updatePowerUpUI();
  }

  updateLeaderboard() {
    const allBalls = [this.player, ...this.enemies].filter(ball => ball);
    allBalls.sort((a, b) => b.radius - a.radius);
    
    // Find biggest non-player ball and make it look like the Sun
    const biggestNonPlayer = allBalls.find(ball => !ball.isPlayer);
    if (biggestNonPlayer && biggestNonPlayer.radius >= 25) {
      biggestNonPlayer.makeSun();
    }
    
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';
    
    const topTen = allBalls.slice(0, 10);
    topTen.forEach((ball, index) => {
      const entry = document.createElement('div');
      entry.className = `leaderboard-entry${ball.isPlayer ? ' player' : ''}`;
      
      entry.innerHTML = `
        <span class="rank">${index + 1}.</span>
        <span class="name">${ball.name}</span>
        <span class="size">${ball.radius.toFixed(1)}</span>
      `;
      
      leaderboardList.appendChild(entry);
    });
  }

  endGame() {
    this.gameOver = true;
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('gameOver').classList.remove('hidden');
    
    // Hide spinner and power-up UI when game is over
    document.getElementById('spinner-wheel').classList.add('hidden');
    document.getElementById('powerup-result').classList.add('hidden');
    document.getElementById('spinBtn').style.display = 'none';
  }

  addHeightMarkers() {
    // No markers needed for flat ground
  }
  
  restart() {
    this.enemies.forEach(enemy => enemy.destroy());
    this.enemies = [];
    
    if (this.player) {
      this.player.destroy();
    }
    
    this.score = 0;
    this.gameOver = false;
    this.lastSpawnTime = 0;
    this.spinCooldown = 0;
    this.isSpinning = false;
    this.powerUpManager.clearAll();
    
    this.createPlayer();
    this.spawnInitialEnemies();
    this.updateUI();
    
    document.getElementById('gameOver').classList.add('hidden');
    // Show spinner button again
    document.getElementById('spinBtn').style.display = 'block';
    document.getElementById('spinBtn').classList.remove('cooldown');
    document.getElementById('spinBtn').removeAttribute('data-cooldown');
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    if (!this.gameOver) {
      const deltaTime = 1 / 60;
      
      // Update power-ups
      this.updatePowerUps(deltaTime);
      
      this.handleInput();
      
      // Create terrain object for physics calculations
      const terrain = {
        getHeight: (x, z) => this.getTerrainHeight(x, z),
        getSlope: (x, z) => this.getTerrainSlope(x, z)
      };
      
      if (this.player) {
        this.player.terrain = terrain;
        this.player.update(deltaTime);
      }
      
      this.enemies.forEach(enemy => {
        enemy.terrain = terrain;
        enemy.update(deltaTime);
      });
      
      this.updateAI();
      this.checkCollisions();
      this.spawnEnemies();
      
      if (this.cameraController) {
        this.cameraController.update();
      }
      
      // Update leaderboard every 60 frames (1 second at 60fps)
      if (Math.floor(Date.now() / 1000) % 1 === 0) {
        this.updateLeaderboard();
      }
    }
    
    this.renderer.render(this.scene, this.camera);
  }
  
  activateSpinner() {
    this.isSpinning = true;
    this.spinCooldown = 10; // 10 second cooldown
    
    // Hide spin button and show spinner wheel
    document.getElementById('spinBtn').classList.add('cooldown');
    document.getElementById('spinner-wheel').classList.remove('hidden');
    document.getElementById('powerup-result').classList.add('hidden');
    
    // Start spinning animation
    const wheel = document.querySelector('.wheel');
    wheel.classList.add('spinning');
    
    // Get result
    const result = this.powerUpManager.spinForPowerUp();
    
    // Calculate rotation degrees based on result
    const segmentAngle = 60; // 360 / 6 segments
    const resultIndex = this.powerUpManager.powerUpTypes.findIndex(p => p.type === result.type);
    const targetDegrees = 1800 + (resultIndex * segmentAngle) + 30; // 5 rotations + segment position
    wheel.style.setProperty('--spin-degrees', `${targetDegrees}deg`);
    
    // Show result after spin completes
    setTimeout(() => {
      this.onSpinComplete(result);
    }, 4000);
  }
  
  activatePowerUpDirect(index) {
    if (this.gameOver || !this.player) return;
    
    const powerUpType = this.powerUpManager.powerUpTypes[index];
    if (!powerUpType) return;
    
    // Don't allow if same power-up is already active (except Try Again)
    if (powerUpType.type !== 'tryagain' && this.powerUpManager.hasActivePowerUp(powerUpType.type)) {
      return;
    }
    
    // Show result briefly
    const resultDiv = document.getElementById('powerup-result');
    resultDiv.classList.remove('hidden');
    const colorHex = '#' + powerUpType.color.toString(16).padStart(6, '0');
    resultDiv.innerHTML = `<span style="color: ${colorHex}">✨ ${powerUpType.name}! ✨</span>`;
    
    // Apply power-up
    if (powerUpType.type !== 'tryagain') {
      const powerUp = this.powerUpManager.addPowerUp(powerUpType.type);
      if (powerUp) {
        this.applyPowerUp(powerUp);
      }
    }
    
    // Hide result after 2 seconds
    setTimeout(() => {
      resultDiv.classList.add('hidden');
    }, 2000);
    
    this.updateUI();
  }
  
  onSpinComplete(result) {
    this.isSpinning = false;
    
    // Hide spinner wheel
    document.getElementById('spinner-wheel').classList.add('hidden');
    document.querySelector('.wheel').classList.remove('spinning');
    
    // Show result
    const resultDiv = document.getElementById('powerup-result');
    resultDiv.classList.remove('hidden');
    const colorHex = '#' + result.color.toString(16).padStart(6, '0');
    resultDiv.innerHTML = `<span style="color: ${colorHex}">✨ ${result.name}! ✨</span>`;
    
    // Apply power-up
    if (result.type !== 'tryagain') {
      const powerUp = this.powerUpManager.addPowerUp(result.type);
      if (powerUp) {
        this.applyPowerUp(powerUp);
      }
    } else {
      // Try again - reset cooldown faster
      this.spinCooldown = 2;
    }
    
    // Hide result after 3 seconds
    setTimeout(() => {
      resultDiv.classList.add('hidden');
    }, 3000);
    
    this.updateUI();
  }
  
  applyPowerUp(powerUp) {
    if (!this.player) return;
    
    switch(powerUp.type) {
      case 'speed':
        this.player.setSpeedBoost(2);
        break;
      case 'size':
        this.player.setSizeBoost(1.2);
        break;
      case 'pacman':
      case 'saturn':
      case 'earth':
        this.player.setSkin(powerUp.type);
        break;
    }
  }
  
  removePowerUp(powerUp) {
    if (!this.player) return;
    
    switch(powerUp.type) {
      case 'speed':
        this.player.setSpeedBoost(1);
        break;
      case 'size':
        this.player.setSizeBoost(1);
        break;
      case 'pacman':
      case 'saturn':
      case 'earth':
        this.player.setSkin('default');
        break;
    }
  }
  
  updatePowerUps(deltaTime) {
    // Update cooldown
    if (this.spinCooldown > 0) {
      this.spinCooldown -= deltaTime;
      
      // Update button with cooldown
      const spinBtn = document.getElementById('spinBtn');
      if (this.spinCooldown > 0) {
        spinBtn.setAttribute('data-cooldown', Math.ceil(this.spinCooldown) + 's');
        spinBtn.classList.add('cooldown');
      } else {
        spinBtn.removeAttribute('data-cooldown');
        spinBtn.classList.remove('cooldown');
      }
    }
    
    // Check for expired power-ups
    const expiredPowerUps = this.powerUpManager.activePowerUps.filter(p => p.isExpired());
    expiredPowerUps.forEach(powerUp => {
      this.removePowerUp(powerUp);
    });
    
    // Update manager
    this.powerUpManager.update();
  }
  
  updatePowerUpUI() {
    const container = document.getElementById('active-powerups');
    container.innerHTML = '';
    
    this.powerUpManager.activePowerUps.forEach(powerUp => {
      const indicator = document.createElement('div');
      indicator.className = 'powerup-indicator';
      
      const icon = {
        speed: '⚡',
        size: '🎈',
        pacman: '👾',
        saturn: '🪐',
        earth: '🌍'
      }[powerUp.type] || '✨';
      
      const name = {
        speed: 'Speed Boost',
        size: 'Size Boost',
        pacman: 'PacMan Skin',
        saturn: 'Saturn Skin',
        earth: 'Earth Skin'
      }[powerUp.type] || 'Power-Up';
      
      const remaining = Math.ceil(powerUp.getRemainingTime() / 1000);
      
      indicator.innerHTML = `
        <span>${icon} ${name}</span>
        <span class="powerup-timer">${remaining}s</span>
      `;
      
      container.appendChild(indicator);
    });
  }
}

const game = new Game();

// Attempt automatic fullscreen on page load
window.addEventListener('load', () => {
  // Small delay to ensure everything is initialized
  setTimeout(() => {
    // Try to click the fullscreen button automatically
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
      fullscreenBtn.click();
    }
  }, 100);
});