import * as THREE from 'three';
import { BallRenderer } from './BallRenderer.js';
import { SkinManager } from './SkinManager.js';
import { AnimationController } from './AnimationController.js';
import { BallAI } from './BallAI.js';
import { CelestialBodyFactory } from './CelestialBodyFactory.js';
import { PowerUpEffects } from './PowerUpEffects.js';

/**
 * Core Ball class using composition pattern
 * Handles basic ball properties, physics, and coordinates with specialized components
 */
export class Ball {
  constructor(x, y, z, radius, color, scene, name = 'AI') {
    // Core properties
    this.position = new THREE.Vector3(x, y, z);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.velocityY = 0; // Vertical velocity for jumping
    this.isJumping = false;
    this.radius = radius;
    this.baseRadius = radius;
    this.color = color;
    this.scene = scene;
    this.isPlayer = false;
    this.mass = 1;
    this.name = name;
    this.id = Math.random().toString(36).substr(2, 9);
    this.isSun = false;
    this.terrain = null;
    
    // Composed components
    this.renderer = new BallRenderer(scene);
    this.skinManager = new SkinManager(scene);
    this.animationController = new AnimationController(scene);
    this.ai = new BallAI();
    this.celestialFactory = new CelestialBodyFactory(scene);
    this.powerUpEffects = new PowerUpEffects();
    
    // Initialize visual representation
    this.mesh = null;
    this.createMesh();
  }

  /**
   * Creates the visual mesh for this ball
   */
  createMesh() {
    const ballData = {
      radius: this.radius,
      isPlayer: this.isPlayer,
      currentSkin: this.skinManager.getCurrentSkin(),
      color: this.color,
      id: this.id
    };
    
    const { mesh, needsSaturnRing } = this.renderer.createMesh(ballData);
    this.mesh = mesh;
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
    
    // Add Saturn ring if needed
    if (needsSaturnRing) {
      this.saturnRing = this.renderer.createSaturnRing(this.radius, this.position);
    }
    
    // Add Mario character if this is the player
    if (this.isPlayer) {
      // this.animationController.createMarioCharacter(this);
    }
  }

  /**
   * Updates ball state each frame
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    // Apply physics first (this updates position based on terrain)
    this.applyPhysics(deltaTime, this.terrain);
    
    // Then update position from velocity (horizontal movement only)
    const horizontalVelocity = new THREE.Vector3(this.velocity.x, 0, this.velocity.z);
    this.position.add(horizontalVelocity.multiplyScalar(deltaTime));
    
    // Update mesh position to match ball position
    this.mesh.position.copy(this.position);
    
    // Add rotation to the ball mesh for visual effect
    if (this.mesh) {
      // Initialize rotation speed if not set (with small random variation)
      if (this.rotationSpeed === undefined) {
        // Base speed of 2 radians/sec with ±10% variation
        this.rotationSpeed = 2.0 + (Math.random() - 0.5) * 0.4;
      }
      
      // Rotate around Y axis (vertical) in one consistent direction
      this.mesh.rotation.y += deltaTime * this.rotationSpeed;
      
      // Add very small wobble for realism (±5 degrees max)
      const wobbleAmount = 0.05;
      this.mesh.rotation.x = Math.sin(Date.now() * 0.001) * wobbleAmount;
      this.mesh.rotation.z = Math.cos(Date.now() * 0.001) * wobbleAmount;
    }
    
    // Handle size boost animation
    if (this.powerUpEffects.updateSizeAnimation(this)) {
      this.recreateMesh();
    }
    
    // Update animations
    this.animationController.updateMarioAnimation(deltaTime, this);
    this.skinManager.updateAnimations(deltaTime, this);
    
    // Update component positions
    this.updateComponentPositions();
  }

  /**
   * Applies physics constraints and damping
   * @param {number} deltaTime - Time since last update
   * @param {Object} terrain - Optional terrain info with getHeight and getSlope methods
   */
  applyPhysics(deltaTime, terrain = null) {
    // Apply velocity damping
    const dampingFactor = this.isPlayer ? 0.97 : 0.95;
    this.velocity.multiplyScalar(dampingFactor);
    
    // Always keep ball on flat ground
    if (this.isJumping) {
      // Apply gravity
      this.velocityY -= 300 * deltaTime;
      this.position.y += this.velocityY * deltaTime;
      
      // Check if landed on flat ground
      if (this.position.y <= this.radius) {
        this.position.y = this.radius;
        this.velocityY = 0;
        this.isJumping = false;
      }
    } else {
      // Always stick to flat ground surface
      this.position.y = this.radius;
    }
    
    // Apply boundary constraints
    const boundaryLimit = 250;
    if (Math.abs(this.position.x) > boundaryLimit) {
      this.position.x = Math.sign(this.position.x) * boundaryLimit;
      this.velocity.x *= -0.8;
    }
    if (Math.abs(this.position.z) > boundaryLimit) {
      this.position.z = Math.sign(this.position.z) * boundaryLimit;
      this.velocity.z *= -0.8;
    }
    
    // Update mesh Y position
    this.mesh.position.y = this.position.y;
  }

  /**
   * Updates positions of all components
   */
  updateComponentPositions() {
    this.skinManager.updatePosition(this.position);
    this.animationController.updatePosition(this.position);
    
    // Update Saturn ring position if it exists
    if (this.saturnRing) {
      this.saturnRing.position.copy(this.position);
    }
  }

  /**
   * Grows the ball by a specified amount
   * @param {number} amount - Amount to grow
   */
  grow(amount) {
    this.radius += amount;
    this.mass = Math.pow(this.radius / this.baseRadius, 3);
    this.recreateMesh();
    
    // Update base radius when growing normally
    this.baseRadius = this.radius;
    this.powerUpEffects.updateBaseRadius(this.radius);
  }

  /**
   * Recreates the mesh after size changes
   */
  recreateMesh() {
    // Store current skin state
    const currentSkin = this.skinManager.getCurrentSkin();
    
    // Remove old mesh
    if (this.mesh) {
      this.renderer.disposeMesh(this.mesh);
    }
    
    // Dispose of old Saturn ring if it exists
    if (this.saturnRing) {
      this.scene.remove(this.saturnRing);
      this.saturnRing.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.saturnRing = null;
    }
    
    // Remove and recreate Mario
    this.animationController.removeMario();
    
    // Remove current skin elements
    this.skinManager.removeSkin(this);
    
    // Create new mesh
    this.createMesh();
    
    // Restore skin if it was active
    if (currentSkin !== 'default') {
      this.skinManager.setSkin(currentSkin, this);
    }
    
    // Scale Mario for new size
    this.animationController.scaleMario(this.radius);
  }

  /**
   * Applies a force to the ball
   * @param {THREE.Vector3} force - Force vector to apply
   */
  applyForce(force) {
    // Apply speed multiplier for power-ups
    const speedMultiplier = this.powerUpEffects.getSpeedMultiplier();
    const adjustedForce = force.clone().multiplyScalar(speedMultiplier);
    this.velocity.add(adjustedForce);
    
    // Apply speed limits
    const baseMaxSpeed = this.isPlayer ? 30 : 20;
    const maxSpeed = baseMaxSpeed * speedMultiplier;
    if (this.velocity.length() > maxSpeed) {
      this.velocity.normalize().multiplyScalar(maxSpeed);
    }
  }

  /**
   * Checks if this ball can eat another ball
   * @param {Ball} otherBall - Ball to check
   * @returns {boolean} True if can eat
   */
  canEat(otherBall) {
    return this.radius > otherBall.radius * 1.0;
  }

  /**
   * Eats another ball and grows
   * @param {Ball} otherBall - Ball to eat
   * @returns {number} Points gained
   */
  eat(otherBall) {
    const volumeGained = Math.pow(otherBall.radius, 3) * 0.5;
    const newVolume = Math.pow(this.radius, 3) + volumeGained;
    const newRadius = Math.cbrt(newVolume);
    
    this.grow(newRadius - this.radius);
    
    return Math.floor(otherBall.radius * 10);
  }

  /**
   * Calculates distance to another ball
   * @param {Ball} otherBall - Other ball
   * @returns {number} Distance
   */
  distanceTo(otherBall) {
    return this.position.distanceTo(otherBall.position);
  }

  /**
   * Checks collision with another ball
   * @param {Ball} otherBall - Other ball
   * @returns {boolean} True if colliding
   */
  isColliding(otherBall) {
    return this.distanceTo(otherBall) < (this.radius + otherBall.radius);
  }

  /**
   * Applies a skin to the ball
   * @param {string} skinType - Type of skin to apply
   */
  setSkin(skinType) {
    this.skinManager.setSkin(skinType, this);
  }

  /**
   * Sets speed boost multiplier
   * @param {number} multiplier - Speed multiplier
   */
  setSpeedBoost(multiplier) {
    this.powerUpEffects.setSpeedBoost(multiplier);
  }

  /**
   * Sets size boost multiplier
   * @param {number} multiplier - Size multiplier
   */
  setSizeBoost(multiplier) {
    this.powerUpEffects.setSizeBoost(multiplier, this.radius, this.baseRadius);
  }

  /**
   * Transforms this ball into a Sun
   */
  makeSun() {
    this.celestialFactory.makeSun(this);
  }

  /**
   * AI behavior methods - delegate to AI component
   */
  randomWalk() {
    this.ai.randomWalk(this);
  }

  seekTarget(target) {
    this.ai.seekTarget(this, target);
  }

  avoidThreat(threat) {
    this.ai.avoidThreat(this, threat);
  }

  findNearestTarget(allBalls) {
    return this.ai.findNearestTarget(this, allBalls);
  }

  findIdealTarget(allBalls) {
    return this.ai.findIdealTarget(this, allBalls);
  }

  findNearestThreat(allBalls) {
    return this.ai.findNearestThreat(this, allBalls);
  }

  /**
   * Cleans up all resources
   */
  destroy() {
    if (this.mesh) {
      this.renderer.disposeMesh(this.mesh);
    }
    
    // Dispose of Saturn ring if it exists
    if (this.saturnRing) {
      this.scene.remove(this.saturnRing);
      this.saturnRing.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.saturnRing = null;
    }
    
    this.animationController.removeMario();
    this.skinManager.removeSkin(this);
  }

  /**
   * Gets Mario group for external access
   * @returns {THREE.Group|null} Mario group
   */
  get marioGroup() {
    return this.animationController.getMarioGroup();
  }

  /**
   * Gets current skin for external access
   * @returns {string} Current skin type
   */
  get currentSkin() {
    return this.skinManager.getCurrentSkin();
  }

  /**
   * Gets speed multiplier for external access
   * @returns {number} Speed multiplier
   */
  get speedMultiplier() {
    return this.powerUpEffects.getSpeedMultiplier();
  }

  /**
   * Gets target radius for external access
   * @returns {number} Target radius
   */
  get targetRadius() {
    return this.powerUpEffects.getTargetRadius() || this.radius;
  }

  set targetRadius(value) {
    this.powerUpEffects.setTargetRadius(value);
  }

  /**
   * Gets growth speed for external access
   * @returns {number} Growth speed
   */
  get growthSpeed() {
    return 0.1; // Constant for now
  }
}