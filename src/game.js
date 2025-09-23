import * as THREE from 'three';
import { Ball } from './Ball.js';
import { CameraController } from './Camera.js';
import { randomColor, randomPosition, randomSize, calculateSpawnRate, calculateMaxEnemies, generateAIName } from './utils.js';

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
    
    this.init();
  }

  init() {
    this.setupScene();
    this.setupLights();
    this.createFloor();
    this.createPlayer();
    this.setupControls();
    
    this.spawnInitialEnemies();
    this.updateUI();
    
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x87CEEB, 100, 500);
    this.scene.background = new THREE.Color(0x87CEEB);
    
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
    });
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    this.scene.add(directionalLight);
    
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x545454, 0.4);
    this.scene.add(hemisphereLight);
  }

  createFloor() {
    const worldSize = 500;
    const gridHelper = new THREE.GridHelper(worldSize, 100, 0x666666, 0x444444);
    this.scene.add(gridHelper);
    
    const floorGeometry = new THREE.PlaneGeometry(worldSize, worldSize);
    const floorMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x90EE90, 
      side: THREE.DoubleSide 
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  createPlayer() {
    const playerPos = { x: 0, y: 0, z: 0 };
    this.player = new Ball(playerPos.x, playerPos.y, playerPos.z, 15, 0x00ff00, this.scene, 'Player');
    this.player.isPlayer = true;
    
    this.cameraController = new CameraController(this.camera, this.player);
  }

  spawnInitialEnemies() {
    // Spawn 4 balls bigger than player to ensure player starts in top 5
    for (let i = 0; i < 4; i++) {
      const pos = randomPosition(150);
      if (Math.abs(pos.x) < 30 && Math.abs(pos.z) < 30) {
        pos.x = pos.x < 0 ? pos.x - 30 : pos.x + 30;
        pos.z = pos.z < 0 ? pos.z - 30 : pos.z + 30;
      }
      const size = randomSize(16, 25);
      const color = randomColor();
      const name = generateAIName();
      
      const enemy = new Ball(pos.x, pos.y, pos.z, size, color, this.scene, name);
      this.enemies.push(enemy);
    }
    
    // Spawn many smaller balls
    for (let i = 0; i < 40; i++) {
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
    
    const force = 2.0;
    const rotationSpeed = 0.01;
    
    // Handle touch input for iPad
    if (this.touchStartPos && this.touchCurrentPos) {
      const deltaX = this.touchCurrentPos.x - this.touchStartPos.x;
      const deltaY = this.touchCurrentPos.y - this.touchStartPos.y;
      
      // Horizontal swipe for rotation
      if (Math.abs(deltaX) > 10) {
        this.cameraController.rotate(-deltaX * 0.001);
      }
      
      // Vertical swipe or tap for forward movement
      if (deltaY < -30 || Math.abs(deltaX) < 30) {
        const forward = new THREE.Vector3(
          -Math.sin(this.cameraController.angle),
          0,
          -Math.cos(this.cameraController.angle)
        );
        forward.normalize().multiplyScalar(force);
        this.player.applyForce(forward);
      }
    }
    
    // Keyboard controls (existing)
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
  }

  updateLeaderboard() {
    const allBalls = [this.player, ...this.enemies].filter(ball => ball);
    allBalls.sort((a, b) => b.radius - a.radius);
    
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
    
    this.createPlayer();
    this.spawnInitialEnemies();
    this.updateUI();
    
    document.getElementById('gameOver').classList.add('hidden');
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    if (!this.gameOver) {
      const deltaTime = 1 / 60;
      
      this.handleInput();
      
      if (this.player) {
        this.player.update(deltaTime);
      }
      
      this.enemies.forEach(enemy => enemy.update(deltaTime));
      
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