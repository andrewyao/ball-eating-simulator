/**
 * Handles power-up effects for balls
 * Manages speed boosts, size boosts, and temporary effects
 */
export class PowerUpEffects {
  constructor() {
    this.speedMultiplier = 1;
    this.sizeMultiplier = 1;
    this.targetRadius = null;
    this.baseRadius = null;
    this.growthSpeed = 0.1;
  }

  /**
   * Applies a speed boost effect
   * @param {number} multiplier - Speed multiplier (e.g., 2 for double speed)
   */
  setSpeedBoost(multiplier) {
    this.speedMultiplier = multiplier;
  }

  /**
   * Applies a size boost effect
   * @param {number} multiplier - Size multiplier (e.g., 1.2 for 20% larger)
   * @param {number} currentRadius - Current ball radius
   * @param {number} baseRadius - Base ball radius
   */
  setSizeBoost(multiplier, currentRadius, baseRadius) {
    if (multiplier === 1) {
      // Returning to normal size - shrink back
      const currentBoost = currentRadius / baseRadius;
      if (currentBoost > 1.1) {
        // Was boosted, shrink back
        this.targetRadius = baseRadius;
      }
    } else {
      // Growing to boosted size - immediate increase
      this.baseRadius = currentRadius; // Save current size as base
      this.targetRadius = currentRadius * multiplier;
    }
    this.sizeMultiplier = multiplier;
    this.growthSpeed = 0.1; // Faster transition
  }

  /**
   * Updates size animation towards target radius
   * @param {Object} ball - Ball object to update
   * @returns {boolean} True if size changed and mesh needs recreation
   */
  updateSizeAnimation(ball) {
    if (this.targetRadius !== null && Math.abs(ball.radius - this.targetRadius) > 0.01) {
      const diff = this.targetRadius - ball.radius;
      const growth = diff * this.growthSpeed;
      ball.radius += growth;
      
      // Check if we need to recreate the mesh for significant size changes
      return Math.abs(growth) > 0.01;
    }
    return false;
  }

  /**
   * Gets the current speed multiplier
   * @returns {number} Speed multiplier
   */
  getSpeedMultiplier() {
    return this.speedMultiplier;
  }

  /**
   * Gets the current size multiplier
   * @returns {number} Size multiplier
   */
  getSizeMultiplier() {
    return this.sizeMultiplier;
  }

  /**
   * Resets all power-up effects to default values
   */
  reset() {
    this.speedMultiplier = 1;
    this.sizeMultiplier = 1;
    this.targetRadius = null;
    this.baseRadius = null;
  }

  /**
   * Checks if any power-up effects are currently active
   * @returns {boolean} True if any effects are active
   */
  hasActiveEffects() {
    return this.speedMultiplier !== 1 || this.sizeMultiplier !== 1;
  }

  /**
   * Gets target radius for size animations
   * @returns {number|null} Target radius or null if no size effect
   */
  getTargetRadius() {
    return this.targetRadius;
  }

  /**
   * Sets target radius directly (used during ball recreation)
   * @param {number|null} radius - Target radius
   */
  setTargetRadius(radius) {
    this.targetRadius = radius;
  }

  /**
   * Updates base radius (used when ball grows naturally)
   * @param {number} radius - New base radius
   */
  updateBaseRadius(radius) {
    this.baseRadius = radius;
  }
}