import * as THREE from 'three';

/**
 * Handles character animations and visual effects for balls
 * Manages Mario character creation and animation
 */
export class AnimationController {
  constructor(scene) {
    this.scene = scene;
    this.marioGroup = null;
    this.animationTime = 0;
  }

  /**
   * Creates Mario character inside the player ball
   * @param {Object} ball - Ball object with radius and position
   * @returns {THREE.Group} Mario character group
   */
  createMarioCharacter(ball) {
    this.marioGroup = new THREE.Group();
    
    // Mario's body (red shirt)
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -0.2;
    this.marioGroup.add(body);
    
    // Mario's head (peach color)
    const headGeometry = new THREE.SphereGeometry(0.35);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.4;
    this.marioGroup.add(head);
    
    // Mario's hat (red)
    const hatGeometry = new THREE.CylinderGeometry(0.4, 0.35, 0.2);
    const hatMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const hat = new THREE.Mesh(hatGeometry, hatMaterial);
    hat.position.y = 0.6;
    this.marioGroup.add(hat);
    
    // Mario's hat brim
    const brimGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.05);
    const brimMaterial = new THREE.MeshPhongMaterial({ color: 0xcc0000 });
    const brim = new THREE.Mesh(brimGeometry, brimMaterial);
    brim.position.y = 0.5;
    this.marioGroup.add(brim);
    
    // Mario's overalls (blue)
    const overallsGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.3);
    const overallsMaterial = new THREE.MeshPhongMaterial({ color: 0x0066ff });
    const overalls = new THREE.Mesh(overallsGeometry, overallsMaterial);
    overalls.position.y = -0.1;
    this.marioGroup.add(overalls);
    
    // Mario's arms
    const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5);
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.5, 0, 0);
    leftArm.rotation.z = Math.PI / 4;
    this.marioGroup.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.5, 0, 0);
    rightArm.rotation.z = -Math.PI / 4;
    this.marioGroup.add(rightArm);
    
    // Mario's legs
    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x0066ff });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.15, -0.7, 0);
    this.marioGroup.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.15, -0.7, 0);
    this.marioGroup.add(rightLeg);
    
    // Scale Mario to fit inside the ball
    const scale = ball.radius * 0.2;
    this.marioGroup.scale.set(scale, scale, scale);
    this.marioGroup.position.copy(ball.position);
    
    this.scene.add(this.marioGroup);
    this.animationTime = 0;
    
    return this.marioGroup;
  }

  /**
   * Updates Mario character animations
   * @param {number} deltaTime - Time since last update
   * @param {Object} ball - Ball object with position and velocity
   */
  updateMarioAnimation(deltaTime, ball) {
    if (!this.marioGroup || !ball.isPlayer) return;
    
    this.marioGroup.position.copy(ball.position);
    
    // Animate Mario (running motion)
    this.animationTime += deltaTime * 10;
    const bobAmount = Math.sin(this.animationTime) * 0.1;
    this.marioGroup.position.y += bobAmount;
    
    // Rotate Mario slightly while moving
    if (ball.velocity.length() > 0.1) {
      const rotationSpeed = ball.velocity.length() * 0.1;
      this.marioGroup.rotation.y += rotationSpeed * deltaTime;
      
      // Make arms swing
      const leftArm = this.marioGroup.children[4]; // Left arm
      const rightArm = this.marioGroup.children[5]; // Right arm
      if (leftArm && rightArm) {
        leftArm.rotation.x = Math.sin(this.animationTime * 2) * 0.3;
        rightArm.rotation.x = -Math.sin(this.animationTime * 2) * 0.3;
      }
      
      // Make legs move
      const leftLeg = this.marioGroup.children[6]; // Left leg
      const rightLeg = this.marioGroup.children[7]; // Right leg
      if (leftLeg && rightLeg) {
        leftLeg.rotation.x = Math.sin(this.animationTime * 2) * 0.2;
        rightLeg.rotation.x = -Math.sin(this.animationTime * 2) * 0.2;
      }
    }
  }

  /**
   * Updates position of animated elements
   * @param {THREE.Vector3} position - New position
   */
  updatePosition(position) {
    if (this.marioGroup) {
      this.marioGroup.position.copy(position);
    }
  }

  /**
   * Sets visibility of Mario character
   * @param {boolean} visible - Whether Mario should be visible
   */
  setMarioVisibility(visible) {
    if (this.marioGroup) {
      this.marioGroup.visible = visible;
    }
  }

  /**
   * Scales Mario character based on ball size
   * @param {number} radius - Ball radius
   */
  scaleMario(radius) {
    if (this.marioGroup) {
      const scale = radius * 0.2;
      this.marioGroup.scale.set(scale, scale, scale);
    }
  }

  /**
   * Removes Mario character and cleans up resources
   */
  removeMario() {
    if (this.marioGroup) {
      this.scene.remove(this.marioGroup);
      this.marioGroup.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.marioGroup = null;
    }
  }

  /**
   * Gets Mario character group
   * @returns {THREE.Group|null} Mario group or null if not created
   */
  getMarioGroup() {
    return this.marioGroup;
  }

  /**
   * Checks if Mario character exists
   * @returns {boolean} True if Mario character exists
   */
  hasMario() {
    return this.marioGroup !== null;
  }

  /**
   * Recreates Mario character after ball growth
   * @param {Object} ball - Ball object
   */
  recreateMario(ball) {
    if (this.marioGroup && ball.isPlayer) {
      this.removeMario();
      this.createMarioCharacter(ball);
    }
  }
}