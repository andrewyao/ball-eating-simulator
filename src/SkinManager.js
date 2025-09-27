import * as THREE from 'three';
import { TextureFactory } from './TextureFactory.js';

/**
 * Manages ball skins and visual transformations
 * Handles PacMan, Saturn, and Earth skins for player balls
 */
export class SkinManager {
  constructor(scene) {
    this.scene = scene;
    this.currentSkin = 'default';
    this.saturnRing = null;
    this.pacmanGroup = null;
    this.pacmanMouthAngle = 0;
  }

  /**
   * Applies a skin to the ball
   * @param {string} skinType - Type of skin to apply
   * @param {Object} ball - Ball object with mesh, radius, position, etc.
   */
  setSkin(skinType, ball) {
    // Remove current skin first
    this.removeSkin(ball);
    this.currentSkin = skinType;
    
    switch(skinType) {
      case 'pacman':
        this.applyPacManSkin(ball);
        break;
      case 'saturn':
        this.applySaturnSkin(ball);
        break;
      case 'earth':
        this.applyEarthSkin(ball);
        break;
      default:
        this.currentSkin = 'default';
        this.restoreDefaultSkin(ball);
    }
  }

  /**
   * Removes current skin and cleans up resources
   * @param {Object} ball - Ball object to clean up (optional)
   */
  removeSkin(ball = null) {
    // Remove Saturn ring
    if (this.saturnRing) {
      this.scene.remove(this.saturnRing);
      this.saturnRing.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.saturnRing = null;
    }
    
    // Also check if ball has Saturn ring (for consistency with Ball class)
    if (ball && ball.saturnRing) {
      this.scene.remove(ball.saturnRing);
      ball.saturnRing.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      ball.saturnRing = null;
    }
    
    // Remove PacMan
    if (this.pacmanGroup) {
      this.scene.remove(this.pacmanGroup);
      this.pacmanGroup.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.pacmanGroup = null;
    }
    
    // Clean up any children added to the mesh (like Earth's atmosphere)
    if (ball && ball.mesh && ball.mesh.children) {
      // Remove all children except the main mesh
      const childrenToRemove = [...ball.mesh.children];
      childrenToRemove.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
        ball.mesh.remove(child);
      });
    }
  }

  /**
   * Applies PacMan skin to the ball
   * @param {Object} ball - Ball object
   */
  applyPacManSkin(ball) {
    if (!ball.isPlayer) return;
    
    // Hide Mario
    if (ball.marioGroup) {
      ball.marioGroup.visible = false;
    }
    
    // Change ball to yellow and opaque
    ball.mesh.material.color.setHex(0xffff00);
    ball.mesh.material.transparent = false;
    ball.mesh.material.opacity = 1;
    
    // Create PacMan mouth group
    this.pacmanGroup = new THREE.Group();
    
    // Create mouth cutout using a box that cuts through the sphere
    const mouthWidth = ball.radius * 0.3;
    const mouthHeight = ball.radius * 2.1;
    const mouthDepth = ball.radius * 2.1;
    
    const mouthGeometry = new THREE.BoxGeometry(mouthWidth, mouthHeight, mouthDepth);
    const blackMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000
    });
    
    // Create animated mouth wedge
    const mouthWedge = new THREE.Mesh(mouthGeometry, blackMaterial);
    mouthWedge.position.x = ball.radius * 0.85;
    this.pacmanGroup.add(mouthWedge);
    
    // Create eye
    const eyeGeometry = new THREE.SphereGeometry(ball.radius * 0.12, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x000000,
      emissive: 0x000000,
      shininess: 100
    });
    const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye.position.set(ball.radius * 0.3, ball.radius * 0.4, ball.radius * 0.6);
    this.pacmanGroup.add(eye);
    
    // Add white eye reflection
    const eyeReflectionGeometry = new THREE.SphereGeometry(ball.radius * 0.04, 8, 8);
    const eyeReflectionMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeReflection = new THREE.Mesh(eyeReflectionGeometry, eyeReflectionMaterial);
    eyeReflection.position.set(ball.radius * 0.35, ball.radius * 0.45, ball.radius * 0.65);
    this.pacmanGroup.add(eyeReflection);
    
    // Store mouth for animation
    this.pacmanGroup.mouthWedge = mouthWedge;
    this.pacmanMouthAngle = 0;
    
    // Set render order to ensure mouth renders properly
    mouthWedge.renderOrder = 1;
    ball.mesh.renderOrder = 0;
    
    this.pacmanGroup.position.copy(ball.position);
    this.scene.add(this.pacmanGroup);
  }

  /**
   * Applies Saturn skin to the ball
   * @param {Object} ball - Ball object
   */
  applySaturnSkin(ball) {
    if (!ball.isPlayer) return;
    
    // Change ball to brown
    ball.mesh.material.color.setHex(0x8b4513); // Saddle brown
    ball.mesh.material.map = null;
    ball.mesh.material.transparent = false;
    ball.mesh.material.opacity = 1;
    ball.mesh.material.needsUpdate = true;
    
    // Create simple flat ring
    this.saturnRing = new THREE.Group();
    const ringGeometry = new THREE.RingGeometry(ball.radius * 1.4, ball.radius * 2.2, 64, 1);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: 0xd2b48c, // Tan color for ring
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2.2; // Slight tilt
    this.saturnRing.add(ring);
    
    this.saturnRing.position.copy(ball.position);
    this.scene.add(this.saturnRing);
  }

  /**
   * Applies Earth skin to the ball
   * @param {Object} ball - Ball object
   */
  applyEarthSkin(ball) {
    if (!ball.isPlayer) return;
    
    // Apply Earth texture to current mesh
    const earthTexture = TextureFactory.createEarthTexture();
    if (ball.mesh.children[0]) {
      ball.mesh.children[0].material.map = earthTexture;
      ball.mesh.children[0].material.transparent = false;
      ball.mesh.children[0].material.opacity = 1;
      ball.mesh.children[0].material.needsUpdate = true;
    } else {
      ball.mesh.material.map = earthTexture;
      ball.mesh.material.transparent = true;
      ball.mesh.material.opacity = 0.9;
      ball.mesh.material.color.setHex(0xffffff);
      ball.mesh.material.needsUpdate = true;
    }
    
    // Add subtle atmosphere glow
    const atmGeometry = new THREE.SphereGeometry(ball.radius * 1.02, 32, 16);
    const atmMaterial = new THREE.MeshBasicMaterial({
      color: 0x87CEEB,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmGeometry, atmMaterial);
    ball.mesh.add(atmosphere);
  }

  /**
   * Restores default ball appearance
   * @param {Object} ball - Ball object
   */
  restoreDefaultSkin(ball) {
    if (ball.isPlayer) {
      ball.mesh.material.map = null;
      ball.mesh.material.transparent = true;
      ball.mesh.material.opacity = 0.4;
      ball.mesh.material.color.setHex(ball.color);
      ball.mesh.material.needsUpdate = true;
      if (ball.marioGroup) {
        ball.marioGroup.visible = true;
      }
    }
  }

  /**
   * Updates skin animations (PacMan mouth, Saturn ring rotation)
   * @param {number} deltaTime - Time since last update
   * @param {Object} ball - Ball object
   */
  updateAnimations(deltaTime, ball) {
    // Update Saturn ring position and rotation
    if (this.saturnRing) {
      this.saturnRing.position.copy(ball.position);
      this.saturnRing.rotation.y += deltaTime * 0.5; // Rotate horizontally
    }
    
    // Update PacMan mouth animation
    if (this.pacmanGroup) {
      this.pacmanGroup.position.copy(ball.position);
      
      // Face direction of movement
      if (ball.velocity.length() > 0.1) {
        const angle = Math.atan2(ball.velocity.x, ball.velocity.z);
        this.pacmanGroup.rotation.y = angle;
      }
      
      // Animate mouth opening and closing
      this.pacmanMouthAngle += deltaTime * 8;
      const mouthOpenness = Math.abs(Math.sin(this.pacmanMouthAngle));
      
      if (this.pacmanGroup.mouthWedge) {
        // Scale the mouth wedge to create opening/closing effect
        this.pacmanGroup.mouthWedge.scale.y = 0.3 + mouthOpenness * 0.7;
        // Move it slightly to maintain centered appearance
        this.pacmanGroup.mouthWedge.position.x = ball.radius * (0.85 + mouthOpenness * 0.1);
      }
    }
  }

  /**
   * Updates skin positions when ball moves
   * @param {THREE.Vector3} position - New ball position
   */
  updatePosition(position) {
    if (this.saturnRing) {
      this.saturnRing.position.copy(position);
    }
    if (this.pacmanGroup) {
      this.pacmanGroup.position.copy(position);
    }
  }

  /**
   * Gets current skin type
   * @returns {string} Current skin type
   */
  getCurrentSkin() {
    return this.currentSkin;
  }

  /**
   * Checks if a specific skin is active
   * @param {string} skinType - Skin type to check
   * @returns {boolean} True if skin is active
   */
  hasSkin(skinType) {
    return this.currentSkin === skinType;
  }
}