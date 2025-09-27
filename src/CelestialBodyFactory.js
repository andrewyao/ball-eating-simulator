import * as THREE from 'three';

/**
 * Factory for creating special celestial body transformations
 * Handles Sun, White Dwarf, Planet, and Moon transformations
 */
export class CelestialBodyFactory {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Transforms a ball into a Sun with glow effects
   * @param {Object} ball - Ball object to transform
   */
  makeSun(ball) {
    if (ball.isPlayer || ball.isSun) return; // Don't convert player or already converted sun
    
    ball.isSun = true;
    
    // Remove existing mesh
    if (ball.mesh) {
      this.scene.remove(ball.mesh);
      ball.mesh.geometry.dispose();
      if (ball.mesh.material.map) ball.mesh.material.map.dispose();
      ball.mesh.material.dispose();
    }
    
    // Remove Saturn ring if it exists
    if (ball.saturnRing) {
      this.scene.remove(ball.saturnRing);
      ball.saturnRing.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      ball.saturnRing = null;
    }
    
    // Create sun texture
    const sunTexture = this.createSunTexture();
    
    // Create new mesh with sun appearance
    const geometry = new THREE.SphereGeometry(ball.radius, 64, 32);
    const material = new THREE.MeshBasicMaterial({
      map: sunTexture,
      emissive: 0xffaa00,
      emissiveIntensity: 0.3
    });
    
    ball.mesh = new THREE.Mesh(geometry, material);
    ball.mesh.position.copy(ball.position);
    ball.mesh.castShadow = false; // Sun doesn't cast shadows
    ball.mesh.receiveShadow = false;
    
    this.scene.add(ball.mesh);
    
    // Add corona glow effect
    const coronaGeometry = new THREE.SphereGeometry(ball.radius * 1.3, 32, 16);
    const coronaMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    ball.mesh.add(corona);
    
    // Add outer glow
    const outerGlowGeometry = new THREE.SphereGeometry(ball.radius * 1.6, 32, 16);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    ball.mesh.add(outerGlow);
  }

  /**
   * Creates a procedural Sun texture
   * @returns {THREE.CanvasTexture} Sun texture
   */
  createSunTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Create radial gradient for sun surface
    const gradient = ctx.createRadialGradient(256, 128, 0, 256, 128, 200);
    gradient.addColorStop(0, '#ffff88');    // Bright yellow center
    gradient.addColorStop(0.3, '#ffaa00');  // Orange
    gradient.addColorStop(0.6, '#ff6600');  // Red-orange
    gradient.addColorStop(1, '#cc3300');    // Dark red edge
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add solar flares and surface activity
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 40 + 15;
      
      const flareGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      flareGradient.addColorStop(0, '#ffffff');      // White hot center
      flareGradient.addColorStop(0.3, '#ffff00');    // Yellow
      flareGradient.addColorStop(0.7, '#ff8800');    // Orange
      flareGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = flareGradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add sunspots (darker areas)
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 20 + 10;
      
      ctx.fillStyle = 'rgba(80, 40, 0, 0.6)';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Creates a white dwarf star
   * @param {Object} ball - Ball object to transform
   */
  createWhiteDwarf(ball) {
    // Dense white core
    const coreGeometry = new THREE.SphereGeometry(ball.radius * 0.9, 32, 16);
    const coreMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xccccff,
      emissive: 0xaaaaff,
      emissiveIntensity: 0.5
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    ball.mesh.add(core);
    
    // Bright white glow
    const glowGeometry = new THREE.SphereGeometry(ball.radius * 1.2, 32, 16);
    const glowMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    ball.mesh.add(glow);
  }

  /**
   * Creates a planet with surface features
   * @param {Object} ball - Ball object to transform
   */
  createPlanet(ball) {
    // Create planet texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Extract RGB from color
    const r = (ball.color >> 16) & 255;
    const g = (ball.color >> 8) & 255;
    const b = ball.color & 255;
    
    // Create surface pattern
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add surface features
    for (let i = 0; i < 15; i++) {
      const darker = `rgb(${Math.max(0, r-30)}, ${Math.max(0, g-30)}, ${Math.max(0, b-30)})`;
      ctx.fillStyle = darker;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 30 + 10,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    // Add bright spots
    for (let i = 0; i < 8; i++) {
      const lighter = `rgb(${Math.min(255, r+40)}, ${Math.min(255, g+40)}, ${Math.min(255, b+40)})`;
      ctx.fillStyle = lighter;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 20 + 5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    const planetTexture = new THREE.CanvasTexture(canvas);
    
    // Main planet body
    const planetGeometry = new THREE.SphereGeometry(ball.radius, 32, 16);
    const planetMaterial = new THREE.MeshPhongMaterial({ 
      map: planetTexture,
      shininess: 30
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    ball.mesh.add(planet);
    
    // Subtle atmosphere
    const atmGeometry = new THREE.SphereGeometry(ball.radius * 1.05, 32, 16);
    const atmMaterial = new THREE.MeshPhongMaterial({
      color: ball.color,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmGeometry, atmMaterial);
    ball.mesh.add(atmosphere);
  }

  /**
   * Creates a moon with craters
   * @param {Object} ball - Ball object to transform
   */
  createMoon(ball) {
    // Create moon texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Extract RGB from color and make it more gray/rocky
    const r = Math.min(200, ((ball.color >> 16) & 255) * 0.7 + 100);
    const g = Math.min(200, ((ball.color >> 8) & 255) * 0.7 + 100);
    const b = Math.min(200, (ball.color & 255) * 0.7 + 100);
    
    // Base rocky surface
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add craters
    for (let i = 0; i < 10; i++) {
      const craterR = Math.max(0, r - 40);
      const craterG = Math.max(0, g - 40);
      const craterB = Math.max(0, b - 40);
      
      ctx.fillStyle = `rgb(${craterR}, ${craterG}, ${craterB})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 15 + 5,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Crater rim (lighter)
      const rimR = Math.min(255, r + 20);
      const rimG = Math.min(255, g + 20);
      const rimB = Math.min(255, b + 20);
      
      ctx.strokeStyle = `rgb(${rimR}, ${rimG}, ${rimB})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Add surface roughness
    for (let i = 0; i < 50; i++) {
      const roughR = r + (Math.random() - 0.5) * 30;
      const roughG = g + (Math.random() - 0.5) * 30;
      const roughB = b + (Math.random() - 0.5) * 30;
      
      ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, roughR))}, ${Math.max(0, Math.min(255, roughG))}, ${Math.max(0, Math.min(255, roughB))})`;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        2,
        2
      );
    }
    
    const moonTexture = new THREE.CanvasTexture(canvas);
    
    // Rocky moon
    const moonGeometry = new THREE.SphereGeometry(ball.radius, 24, 16);
    const moonMaterial = new THREE.MeshPhongMaterial({ 
      map: moonTexture,
      shininess: 5,
      bumpMap: moonTexture,
      bumpScale: 0.1
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    ball.mesh.add(moon);
  }

  /**
   * Determines celestial body type based on radius
   * @param {number} radius - Ball radius
   * @returns {string} Celestial body type
   */
  getCelestialType(radius) {
    if (radius >= 15) return 'sun';
    if (radius >= 10) return 'white_dwarf';
    if (radius >= 5) return 'planet';
    return 'moon';
  }
}