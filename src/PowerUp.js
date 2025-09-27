import * as THREE from 'three';

export class PowerUp {
  constructor(type, duration = 30000) {
    this.type = type;
    this.duration = duration;
    this.startTime = Date.now();
    this.active = true;
    this.id = Math.random().toString(36).substr(2, 9);
  }

  isExpired() {
    return Date.now() - this.startTime >= this.duration;
  }

  getRemainingTime() {
    const remaining = this.duration - (Date.now() - this.startTime);
    return Math.max(0, remaining);
  }
}

export class PowerUpManager {
  constructor() {
    this.activePowerUps = [];
    this.powerUpTypes = [
      { name: 'Speed Boost', type: 'speed', weight: 1, color: 0x00ff00 },
      { name: 'Size Boost', type: 'size', weight: 1, color: 0xffff00 },
      { name: 'PacMan Skin', type: 'pacman', weight: 1, color: 0xffff00 },
      { name: 'Saturn Skin', type: 'saturn', weight: 1, color: 0xffa500 },
      { name: 'Earth Skin', type: 'earth', weight: 1, color: 0x0066cc },
      { name: 'Try Again', type: 'tryagain', weight: 1, color: 0x888888 }
    ];
  }

  spinForPowerUp() {
    const totalWeight = this.powerUpTypes.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const powerUp of this.powerUpTypes) {
      random -= powerUp.weight;
      if (random <= 0) {
        return powerUp;
      }
    }
    
    return this.powerUpTypes[this.powerUpTypes.length - 1];
  }

  addPowerUp(type) {
    if (type === 'tryagain') {
      return null;
    }
    
    // Remove existing skin power-ups if adding a new skin
    if (['pacman', 'saturn', 'earth'].includes(type)) {
      this.activePowerUps = this.activePowerUps.filter(p => 
        !['pacman', 'saturn', 'earth'].includes(p.type)
      );
    }
    
    const powerUp = new PowerUp(type);
    this.activePowerUps.push(powerUp);
    return powerUp;
  }

  update() {
    this.activePowerUps = this.activePowerUps.filter(powerUp => {
      if (powerUp.isExpired()) {
        powerUp.active = false;
        return false;
      }
      return true;
    });
  }

  getActivePowerUp(type) {
    return this.activePowerUps.find(p => p.type === type);
  }

  hasActivePowerUp(type) {
    return this.activePowerUps.some(p => p.type === type);
  }

  clearAll() {
    this.activePowerUps.forEach(p => p.active = false);
    this.activePowerUps = [];
  }
}

export class PowerUpSpinner {
  constructor(scene) {
    this.scene = scene;
    this.spinning = false;
    this.currentRotation = 0;
    this.targetRotation = 0;
    this.spinSpeed = 0;
    this.result = null;
  }

  spin(powerUpManager, onComplete) {
    if (this.spinning) return;
    
    this.spinning = true;
    this.result = powerUpManager.spinForPowerUp();
    
    // Calculate target rotation (multiple full spins + final position)
    const baseSpins = 5 + Math.random() * 3; // 5-8 full rotations
    const segmentAngle = (Math.PI * 2) / powerUpManager.powerUpTypes.length;
    const resultIndex = powerUpManager.powerUpTypes.indexOf(this.result);
    const finalAngle = resultIndex * segmentAngle;
    
    this.targetRotation = this.currentRotation + (baseSpins * Math.PI * 2) + finalAngle;
    this.spinSpeed = 0.3; // Initial spin speed
    
    // Callback after spin completes
    this.onSpinComplete = onComplete;
  }

  update() {
    if (!this.spinning) return;
    
    const diff = this.targetRotation - this.currentRotation;
    
    if (Math.abs(diff) < 0.01) {
      this.spinning = false;
      this.currentRotation = this.targetRotation;
      if (this.onSpinComplete) {
        this.onSpinComplete(this.result);
      }
    } else {
      // Decelerate as we approach target
      this.spinSpeed *= 0.98;
      this.spinSpeed = Math.max(0.01, this.spinSpeed);
      this.currentRotation += diff * this.spinSpeed;
    }
  }
}