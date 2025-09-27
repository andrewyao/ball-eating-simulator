import * as THREE from 'three';

/**
 * Handles AI behavior logic for enemy balls
 * Manages decision making, pathfinding, and behavioral patterns
 */
export class BallAI {
  constructor() {
    // AI behavior parameters
    this.seekForce = 2.2;
    this.avoidForce = 2.0;
    this.randomForce = 1.0;
    this.randomWalkChance = 0.2;
    
    // Behavior ranges
    this.threatRange = 60;
    this.targetRange = 80;
    this.idealTargetRange = 100;
  }

  /**
   * Executes AI behavior for a ball
   * @param {Object} ball - The AI-controlled ball
   * @param {Array} allBalls - Array of all balls in the game
   */
  executeBehavior(ball, allBalls) {
    if (ball.isPlayer) return; // Don't apply AI to player
    
    // Find nearest threat and ideal target
    const nearestThreat = this.findNearestThreat(ball, allBalls);
    const idealTarget = this.findIdealTarget(ball, allBalls);
    
    // Priority: Avoid threats first, then hunt ideal targets, then random walk
    if (nearestThreat) {
      this.avoidThreat(ball, nearestThreat);
    } else if (idealTarget) {
      this.seekTarget(ball, idealTarget);
    } else if (Math.random() < this.randomWalkChance) {
      this.randomWalk(ball);
    }
  }

  /**
   * Makes the ball move randomly
   * @param {Object} ball - The ball to move
   */
  randomWalk(ball) {
    const force = new THREE.Vector3(
      (Math.random() - 0.5) * this.randomForce,
      0,
      (Math.random() - 0.5) * this.randomForce
    );
    ball.applyForce(force);
  }

  /**
   * Makes the ball seek towards a target
   * @param {Object} ball - The ball that seeks
   * @param {Object} target - The target ball
   */
  seekTarget(ball, target) {
    const direction = target.position.clone().sub(ball.position).normalize();
    const force = direction.multiplyScalar(this.seekForce);
    ball.applyForce(force);
  }

  /**
   * Makes the ball avoid a threat
   * @param {Object} ball - The ball that avoids
   * @param {Object} threat - The threatening ball
   */
  avoidThreat(ball, threat) {
    const direction = ball.position.clone().sub(threat.position).normalize();
    const force = direction.multiplyScalar(this.avoidForce);
    ball.applyForce(force);
  }

  /**
   * Finds the nearest target that the ball can eat
   * @param {Object} ball - The hunting ball
   * @param {Array} allBalls - Array of all balls
   * @returns {Object|null} Nearest eatable target or null
   */
  findNearestTarget(ball, allBalls) {
    let nearestTarget = null;
    let nearestDistance = Infinity;
    
    for (const otherBall of allBalls) {
      if (otherBall === ball || !ball.canEat(otherBall)) continue;
      
      const distance = ball.distanceTo(otherBall);
      if (distance < nearestDistance && distance < this.targetRange) {
        nearestDistance = distance;
        nearestTarget = otherBall;
      }
    }
    
    return nearestTarget;
  }

  /**
   * Finds the ideal target (largest eatable ball within range)
   * @param {Object} ball - The hunting ball
   * @param {Array} allBalls - Array of all balls
   * @returns {Object|null} Ideal target or null
   */
  findIdealTarget(ball, allBalls) {
    let idealTarget = null;
    let largestEatableSize = 0;
    let shortestDistance = Infinity;
    
    for (const otherBall of allBalls) {
      if (otherBall === ball || !ball.canEat(otherBall)) continue;
      
      const distance = ball.distanceTo(otherBall);
      if (distance > this.idealTargetRange) continue; // Too far away
      
      // Prioritize larger eatable balls first, then closer ones
      if (otherBall.radius > largestEatableSize || 
          (Math.abs(otherBall.radius - largestEatableSize) < 0.1 && distance < shortestDistance)) {
        largestEatableSize = otherBall.radius;
        shortestDistance = distance;
        idealTarget = otherBall;
      }
    }
    
    return idealTarget;
  }

  /**
   * Finds the nearest threat that can eat this ball
   * @param {Object} ball - The ball looking for threats
   * @param {Array} allBalls - Array of all balls
   * @returns {Object|null} Nearest threat or null
   */
  findNearestThreat(ball, allBalls) {
    let nearestThreat = null;
    let nearestDistance = Infinity;
    
    for (const otherBall of allBalls) {
      if (otherBall === ball || !otherBall.canEat(ball)) continue;
      
      const distance = ball.distanceTo(otherBall);
      if (distance < nearestDistance && distance < this.threatRange) {
        nearestDistance = distance;
        nearestThreat = otherBall;
      }
    }
    
    return nearestThreat;
  }

  /**
   * Calculates the danger level for a ball based on nearby threats
   * @param {Object} ball - The ball to assess
   * @param {Array} allBalls - Array of all balls
   * @returns {number} Danger level (0-1, where 1 is most dangerous)
   */
  calculateDangerLevel(ball, allBalls) {
    let dangerLevel = 0;
    let threatCount = 0;
    
    for (const otherBall of allBalls) {
      if (otherBall === ball || !otherBall.canEat(ball)) continue;
      
      const distance = ball.distanceTo(otherBall);
      if (distance < this.threatRange) {
        // Closer threats and larger threats are more dangerous
        const proximityFactor = 1 - (distance / this.threatRange);
        const sizeFactor = otherBall.radius / ball.radius;
        dangerLevel += proximityFactor * sizeFactor;
        threatCount++;
      }
    }
    
    return Math.min(dangerLevel / Math.max(threatCount, 1), 1);
  }

  /**
   * Updates AI behavior parameters based on ball size and game state
   * @param {Object} ball - The ball to update AI for
   */
  updateBehaviorParameters(ball) {
    // Larger balls are more aggressive, smaller balls more cautious
    const sizeRatio = ball.radius / ball.baseRadius;
    
    if (sizeRatio > 1.5) {
      // Large balls are more aggressive
      this.seekForce = 2.5;
      this.randomWalkChance = 0.1;
      this.targetRange = 100;
    } else if (sizeRatio < 0.8) {
      // Small balls are more cautious
      this.seekForce = 1.8;
      this.avoidForce = 2.5;
      this.randomWalkChance = 0.3;
      this.threatRange = 80;
    } else {
      // Reset to default values
      this.seekForce = 2.2;
      this.avoidForce = 2.0;
      this.randomWalkChance = 0.2;
      this.threatRange = 60;
      this.targetRange = 80;
    }
  }

  /**
   * Determines if a ball should be aggressive or defensive
   * @param {Object} ball - The ball to assess
   * @param {Array} allBalls - Array of all balls
   * @returns {string} Behavior mode: 'aggressive', 'defensive', or 'neutral'
   */
  determineBehaviorMode(ball, allBalls) {
    const dangerLevel = this.calculateDangerLevel(ball, allBalls);
    const availableTargets = allBalls.filter(b => b !== ball && ball.canEat(b)).length;
    
    if (dangerLevel > 0.7) {
      return 'defensive';
    } else if (dangerLevel < 0.3 && availableTargets > 0) {
      return 'aggressive';
    } else {
      return 'neutral';
    }
  }
}