import * as THREE from 'three';

export class Ball {
  constructor(x, y, z, radius, color, scene, name = 'AI') {
    this.position = new THREE.Vector3(x, y, z);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.radius = radius;
    this.baseRadius = radius;
    this.color = color;
    this.scene = scene;
    this.isPlayer = false;
    this.mass = 1;
    this.name = name;
    this.id = Math.random().toString(36).substr(2, 9);
    
    // Power-up properties
    this.speedMultiplier = 1;
    this.targetRadius = radius;
    this.growthSpeed = 0.1;
    this.currentSkin = 'default';
    this.saturnRing = null;
    this.pacmanGroup = null;

    this.createMesh();
  }

  createMesh() {
    // Choose texture based on ball size and type
    let texture, material;
    const geometry = new THREE.SphereGeometry(this.radius, 32, 16);
    
    if (this.isPlayer) {
      // Player ball appearance depends on current skin
      if (this.currentSkin === 'earth') {
        texture = this.createEarthTexture();
        material = new THREE.MeshPhongMaterial({ 
          map: texture,
          shininess: 20,
          transparent: true,
          opacity: 0.9,
          color: 0xffffff
        });
      } else if (this.currentSkin === 'saturn') {
        material = new THREE.MeshPhongMaterial({
          color: 0x8b4513, // Brown
          shininess: 30,
          transparent: false,
          opacity: 1
        });
        this.needsSaturnRing = true;
      } else if (this.currentSkin === 'pacman') {
        material = new THREE.MeshPhongMaterial({
          color: 0xffff00, // Yellow
          shininess: 20,
          transparent: false,
          opacity: 1
        });
      } else {
        // Default regular ball appearance
        material = new THREE.MeshPhongMaterial({ 
          color: this.color,
          shininess: 20,
          transparent: true,
          opacity: 0.4
        });
      }
    } else if (this.radius < 8) {
      // Small balls look like moon
      texture = this.createMoonTexture();
      material = new THREE.MeshPhongMaterial({ 
        map: texture,
        shininess: 20
      });
    } else if (this.radius < 15) {
      // Medium balls look like Mars
      texture = this.createMarsTexture();
      material = new THREE.MeshPhongMaterial({ 
        map: texture,
        shininess: 20
      });
    } else {
      // Large balls (15+) alternate between Jupiter and Saturn appearance
      // Use ball ID to determine which type
      const isJupiter = parseInt(this.id, 36) % 2 === 0;
      
      if (isJupiter) {
        // Jupiter appearance
        texture = this.createJupiterTexture();
        material = new THREE.MeshPhongMaterial({ 
          map: texture,
          shininess: 30
        });
      } else {
        // Saturn appearance (brown ball)
        material = new THREE.MeshPhongMaterial({
          color: 0x8b4513, // Brown
          shininess: 30
        });
        
        // Add Saturn ring after creating the mesh
        this.needsSaturnRing = true;
      }
    }
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    this.scene.add(this.mesh);
    
    // Add Saturn ring if needed
    if (this.needsSaturnRing) {
      this.createSaturnRing();
      this.needsSaturnRing = false;
    }
    
    // Add Mario character inside player ball (smaller)
    if (this.isPlayer) {
      this.createMarioCharacter();
    }
  }
  
  createSaturnRing() {
    // Create simple flat ring for Saturn balls
    this.saturnRing = new THREE.Group();
    const ringGeometry = new THREE.RingGeometry(this.radius * 1.4, this.radius * 2.2, 64, 1);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: 0xd2b48c, // Tan color for ring
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2.2; // Slight tilt
    this.saturnRing.add(ring);
    
    this.saturnRing.position.copy(this.position);
    this.scene.add(this.saturnRing);
  }
  
  createEarthTexture() {
    // Create high-resolution Earth texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Draw ocean base with realistic blue gradient
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGradient.addColorStop(0, '#4a90e2');  // Lighter blue at poles
    oceanGradient.addColorStop(0.3, '#2563eb'); // Deep blue
    oceanGradient.addColorStop(0.5, '#1e40af'); // Deepest blue at equator
    oceanGradient.addColorStop(0.7, '#2563eb'); // Deep blue
    oceanGradient.addColorStop(1, '#4a90e2');   // Lighter blue at poles
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw continents with realistic shapes and colors
    
    // North America
    ctx.fillStyle = '#22c55e'; // Green
    ctx.beginPath();
    ctx.moveTo(150, 120);
    ctx.quadraticCurveTo(100, 80, 180, 60);
    ctx.quadraticCurveTo(220, 70, 250, 100);
    ctx.quadraticCurveTo(280, 140, 240, 180);
    ctx.quadraticCurveTo(200, 200, 150, 180);
    ctx.quadraticCurveTo(120, 150, 150, 120);
    ctx.fill();
    
    // South America
    ctx.beginPath();
    ctx.moveTo(180, 250);
    ctx.quadraticCurveTo(160, 220, 200, 230);
    ctx.quadraticCurveTo(220, 280, 200, 350);
    ctx.quadraticCurveTo(180, 400, 160, 380);
    ctx.quadraticCurveTo(140, 320, 160, 280);
    ctx.quadraticCurveTo(150, 250, 180, 250);
    ctx.fill();
    
    // Africa
    ctx.fillStyle = '#a3a380'; // Desert tan
    ctx.beginPath();
    ctx.moveTo(480, 140);
    ctx.quadraticCurveTo(460, 100, 520, 120);
    ctx.quadraticCurveTo(560, 160, 540, 220);
    ctx.quadraticCurveTo(530, 280, 510, 320);
    ctx.quadraticCurveTo(480, 360, 460, 340);
    ctx.quadraticCurveTo(440, 300, 450, 240);
    ctx.quadraticCurveTo(460, 180, 480, 140);
    ctx.fill();
    
    // Europe
    ctx.fillStyle = '#16a34a'; // Forest green
    ctx.beginPath();
    ctx.ellipse(460, 100, 30, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Asia
    ctx.fillStyle = '#ca8a04'; // Golden brown
    ctx.beginPath();
    ctx.moveTo(550, 80);
    ctx.quadraticCurveTo(600, 60, 700, 80);
    ctx.quadraticCurveTo(800, 100, 820, 140);
    ctx.quadraticCurveTo(800, 180, 750, 200);
    ctx.quadraticCurveTo(650, 220, 580, 200);
    ctx.quadraticCurveTo(520, 160, 550, 120);
    ctx.quadraticCurveTo(540, 100, 550, 80);
    ctx.fill();
    
    // Australia
    ctx.fillStyle = '#dc2626'; // Red/orange
    ctx.beginPath();
    ctx.ellipse(780, 340, 45, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add ice caps (white at poles)
    ctx.fillStyle = '#f8fafc';
    // North pole
    ctx.fillRect(0, 0, canvas.width, 30);
    // South pole  
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    
    // Add cloud formations
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 60 + 30;
      
      const cloudGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      cloudGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      cloudGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
      cloudGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = cloudGradient;
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }
    
    return new THREE.CanvasTexture(canvas);
  }
  
  createMoonTexture() {
    // Create realistic moon texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base moon color - light gray/beige
    const baseGradient = ctx.createRadialGradient(256, 128, 0, 256, 128, 200);
    baseGradient.addColorStop(0, '#f5f5dc');  // Beige center
    baseGradient.addColorStop(0.6, '#e6e6e6'); // Light gray
    baseGradient.addColorStop(1, '#d3d3d3');   // Darker gray at edges
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add maria (dark plains) - the dark spots on the moon
    const mariaSpots = [
      { x: 180, y: 120, w: 80, h: 60, color: '#a9a9a9' },
      { x: 320, y: 140, w: 100, h: 80, color: '#969696' },
      { x: 280, y: 80, w: 60, h: 40, color: '#b0b0b0' },
      { x: 150, y: 180, w: 70, h: 50, color: '#a0a0a0' },
      { x: 380, y: 100, w: 50, h: 70, color: '#9d9d9d' }
    ];
    
    mariaSpots.forEach(spot => {
      ctx.fillStyle = spot.color;
      ctx.beginPath();
      ctx.ellipse(spot.x, spot.y, spot.w/2, spot.h/2, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Add major craters with realistic shadows
    const majorCraters = [
      { x: 200, y: 100, radius: 25, depth: 0.3 },
      { x: 350, y: 180, radius: 30, depth: 0.4 },
      { x: 120, y: 150, radius: 20, depth: 0.25 },
      { x: 400, y: 120, radius: 18, depth: 0.35 },
      { x: 280, y: 200, radius: 22, depth: 0.3 },
      { x: 160, y: 80, radius: 15, depth: 0.2 }
    ];
    
    majorCraters.forEach(crater => {
      // Crater shadow (darker inside)
      const shadowGradient = ctx.createRadialGradient(
        crater.x, crater.y, 0,
        crater.x, crater.y, crater.radius
      );
      shadowGradient.addColorStop(0, `rgba(100, 100, 100, ${crater.depth})`);
      shadowGradient.addColorStop(0.7, `rgba(120, 120, 120, ${crater.depth * 0.5})`);
      shadowGradient.addColorStop(1, 'rgba(150, 150, 150, 0)');
      
      ctx.fillStyle = shadowGradient;
      ctx.beginPath();
      ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Crater rim (slightly brighter)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
      ctx.stroke();
    });
    
    // Add smaller craters and surface texture
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 8 + 2;
      const darkness = Math.random() * 0.2 + 0.1;
      
      // Small crater
      ctx.fillStyle = `rgba(80, 80, 80, ${darkness})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Crater rim highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Add surface roughness/texture
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const brightness = Math.random() * 40 - 20; // -20 to +20
      
      ctx.fillStyle = `rgba(${200 + brightness}, ${200 + brightness}, ${200 + brightness}, 0.3)`;
      ctx.fillRect(x, y, 1, 1);
    }
    
    return new THREE.CanvasTexture(canvas);
  }
  
  createMarsTexture() {
    // Create realistic Mars texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base Mars color - rusty red/orange gradient
    const baseGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    baseGradient.addColorStop(0, '#cd5c5c');    // Lighter red at north
    baseGradient.addColorStop(0.3, '#d2691e');  // Orange-red
    baseGradient.addColorStop(0.5, '#b22222');  // Deep red at equator  
    baseGradient.addColorStop(0.7, '#a0522d');  // Rusty brown
    baseGradient.addColorStop(1, '#8b4513');    // Dark brown at south
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add polar ice caps (small white areas)
    ctx.fillStyle = '#f0f8ff';
    // North polar cap
    ctx.beginPath();
    ctx.ellipse(256, 20, 40, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    // South polar cap
    ctx.beginPath();
    ctx.ellipse(256, 236, 35, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add major geological features
    
    // Valles Marineris (giant canyon system) - darker line across middle
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(150, 128);
    ctx.quadraticCurveTo(256, 120, 380, 135);
    ctx.stroke();
    
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#654321';
    ctx.beginPath();
    ctx.moveTo(150, 125);
    ctx.quadraticCurveTo(256, 117, 380, 132);
    ctx.stroke();
    
    // Olympus Mons and other volcanoes (darker circular spots)
    const volcanoes = [
      { x: 120, y: 100, radius: 12, color: '#654321' },
      { x: 140, y: 110, radius: 8, color: '#8b4513' },
      { x: 160, y: 95, radius: 6, color: '#a0522d' },
      { x: 100, y: 120, radius: 15, color: '#5d4037' }  // Olympus Mons
    ];
    
    volcanoes.forEach(volcano => {
      const volcanoGradient = ctx.createRadialGradient(
        volcano.x, volcano.y, 0,
        volcano.x, volcano.y, volcano.radius
      );
      volcanoGradient.addColorStop(0, volcano.color);
      volcanoGradient.addColorStop(0.7, '#8b4513');
      volcanoGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = volcanoGradient;
      ctx.beginPath();
      ctx.arc(volcano.x, volcano.y, volcano.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Add impact craters
    const craters = [
      { x: 300, y: 80, radius: 18, depth: 0.4 },
      { x: 400, y: 160, radius: 22, depth: 0.3 },
      { x: 200, y: 180, radius: 15, depth: 0.35 },
      { x: 350, y: 200, radius: 12, depth: 0.25 },
      { x: 80, y: 180, radius: 10, depth: 0.3 }
    ];
    
    craters.forEach(crater => {
      // Crater shadow
      const shadowGradient = ctx.createRadialGradient(
        crater.x, crater.y, 0,
        crater.x, crater.y, crater.radius
      );
      shadowGradient.addColorStop(0, `rgba(80, 0, 0, ${crater.depth})`);
      shadowGradient.addColorStop(0.8, `rgba(139, 69, 19, ${crater.depth * 0.3})`);
      shadowGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = shadowGradient;
      ctx.beginPath();
      ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Crater rim
      ctx.strokeStyle = 'rgba(210, 105, 30, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
      ctx.stroke();
    });
    
    // Add dust storm patterns and surface variations
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 30 + 10;
      
      // Dust patterns
      const dustGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      dustGradient.addColorStop(0, 'rgba(205, 92, 92, 0.3)');
      dustGradient.addColorStop(0.5, 'rgba(160, 82, 45, 0.2)');
      dustGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = dustGradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add surface roughness and color variation
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const variation = Math.random() * 30 - 15; // -15 to +15
      
      const r = Math.max(0, Math.min(255, 180 + variation));
      const g = Math.max(0, Math.min(255, 80 + variation * 0.8));
      const b = Math.max(0, Math.min(255, 40 + variation * 0.6));
      
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
      ctx.fillRect(x, y, 2, 2);
    }
    
    return new THREE.CanvasTexture(canvas);
  }
  
  createJupiterTexture() {
    // Create realistic Jupiter texture with bands
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create horizontal bands with Jupiter's characteristic colors
    const bands = [
      { y: 0, height: 40, color: '#d4af8c' },      // North polar region
      { y: 40, height: 35, color: '#e6c499' },     // Light band
      { y: 75, height: 25, color: '#b8956a' },     // Dark band
      { y: 100, height: 40, color: '#f0d5aa' },    // Light band
      { y: 140, height: 30, color: '#a67c52' },    // Dark band (North Equatorial Belt)
      { y: 170, height: 45, color: '#e8c896' },    // Light band
      { y: 215, height: 25, color: '#8b6f47' },    // Dark band
      { y: 240, height: 40, color: '#ddbf85' },    // Light band
      { y: 280, height: 30, color: '#9d7a56' },    // Dark band (South Equatorial Belt)
      { y: 310, height: 35, color: '#f2d8a8' },    // Light band
      { y: 345, height: 25, color: '#b8956a' },    // Dark band
      { y: 370, height: 35, color: '#e0c088' },    // Light band
      { y: 405, height: 40, color: '#c9a165' },    // South polar region
      { y: 445, height: 67, color: '#b8956a' }     // South polar region
    ];
    
    // Draw base bands
    bands.forEach(band => {
      ctx.fillStyle = band.color;
      ctx.fillRect(0, band.y, canvas.width, band.height);
    });
    
    // Add Great Red Spot
    const spotX = 300;
    const spotY = 250;
    const spotW = 120;
    const spotH = 60;
    
    const spotGradient = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, spotW/2);
    spotGradient.addColorStop(0, '#cd5c5c');    // Red center
    spotGradient.addColorStop(0.4, '#a0522d');  // Brown
    spotGradient.addColorStop(0.8, '#d2b48c');  // Tan edge
    spotGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = spotGradient;
    ctx.beginPath();
    ctx.ellipse(spotX, spotY, spotW/2, spotH/2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add smaller spots and storms
    const storms = [
      { x: 700, y: 180, w: 40, h: 25, color: '#8b4513' },
      { x: 150, y: 320, w: 30, h: 20, color: '#cd853f' },
      { x: 800, y: 280, w: 25, h: 15, color: '#a0522d' },
      { x: 500, y: 150, w: 35, h: 22, color: '#daa520' }
    ];
    
    storms.forEach(storm => {
      const stormGradient = ctx.createRadialGradient(storm.x, storm.y, 0, storm.x, storm.y, storm.w/2);
      stormGradient.addColorStop(0, storm.color);
      stormGradient.addColorStop(0.7, '#d2b48c');
      stormGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = stormGradient;
      ctx.beginPath();
      ctx.ellipse(storm.x, storm.y, storm.w/2, storm.h/2, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Add atmospheric turbulence and band mixing
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const width = Math.random() * 80 + 20;
      const height = Math.random() * 8 + 3;
      
      // Create swirling patterns
      const turbulenceColors = ['rgba(240, 213, 170, 0.4)', 'rgba(184, 149, 106, 0.3)', 'rgba(205, 175, 149, 0.3)'];
      ctx.fillStyle = turbulenceColors[Math.floor(Math.random() * turbulenceColors.length)];
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI / 6 - Math.PI / 12); // Slight rotation
      ctx.fillRect(-width/2, -height/2, width, height);
      ctx.restore();
    }
    
    // Add horizontal flow patterns to emphasize bands
    for (let y = 0; y < canvas.height; y += 3) {
      const opacity = Math.sin(y * 0.1) * 0.1 + 0.05;
      const flowColor = y % 60 < 30 ? 'rgba(255, 255, 255, ' + opacity + ')' : 'rgba(139, 111, 71, ' + opacity + ')';
      
      ctx.fillStyle = flowColor;
      for (let x = 0; x < canvas.width; x += 20) {
        const flowWidth = Math.random() * 15 + 5;
        ctx.fillRect(x, y, flowWidth, 1);
      }
    }
    
    // Add subtle vertical mixing between bands
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const height = Math.random() * 20 + 10;
      
      ctx.fillStyle = 'rgba(210, 180, 140, 0.2)';
      ctx.fillRect(x, y, 2, height);
    }
    
    return new THREE.CanvasTexture(canvas);
  }
  
  getCelestialType() {
    if (this.radius >= 15) return 'sun';
    if (this.radius >= 10) return 'white_dwarf';
    if (this.radius >= 5) return 'planet';
    return 'moon';
  }
  
  createSun() {
    // Create sun texture using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Create radial gradient for sun surface
    const gradient = ctx.createRadialGradient(256, 128, 0, 256, 128, 200);
    gradient.addColorStop(0, '#ffff88');
    gradient.addColorStop(0.3, '#ffaa00');
    gradient.addColorStop(0.6, '#ff6600');
    gradient.addColorStop(1, '#cc3300');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add solar flares/surface activity
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 30 + 10;
      
      const flareGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      flareGradient.addColorStop(0, '#ffffff');
      flareGradient.addColorStop(0.5, '#ffff00');
      flareGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = flareGradient;
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }
    
    const sunTexture = new THREE.CanvasTexture(canvas);
    
    // Main sun sphere with custom shader material
    const sunGeometry = new THREE.SphereGeometry(this.radius, 64, 32);
    const sunMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        sunTexture: { value: sunTexture }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform sampler2D sunTexture;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vec2 animatedUv = vUv + vec2(time * 0.1, sin(time * 0.5) * 0.05);
          vec4 textureColor = texture2D(sunTexture, animatedUv);
          
          // Add pulsing glow
          float pulse = sin(time * 2.0) * 0.2 + 0.8;
          vec3 glowColor = textureColor.rgb * pulse;
          
          gl_FragColor = vec4(glowColor, 1.0);
        }
      `
    });
    
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    this.mesh.add(sun);
    this.sunMaterial = sunMaterial; // Store for animation
    
    // Corona glow
    const coronaGeometry = new THREE.SphereGeometry(this.radius * 1.2, 32, 16);
    const coronaMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    this.mesh.add(corona);
  }
  
  createWhiteDwarf() {
    // Dense white core
    const coreGeometry = new THREE.SphereGeometry(this.radius * 0.9, 32, 16);
    const coreMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xccccff,
      emissive: 0xaaaaff,
      emissiveIntensity: 0.5
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    this.mesh.add(core);
    
    // Bright white glow
    const glowGeometry = new THREE.SphereGeometry(this.radius * 1.2, 32, 16);
    const glowMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.mesh.add(glow);
  }
  
  createPlanet() {
    // Create planet texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Extract RGB from color
    const r = (this.color >> 16) & 255;
    const g = (this.color >> 8) & 255;
    const b = this.color & 255;
    
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
    const planetGeometry = new THREE.SphereGeometry(this.radius, 32, 16);
    const planetMaterial = new THREE.MeshPhongMaterial({ 
      map: planetTexture,
      shininess: 30
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    this.mesh.add(planet);
    
    // Subtle atmosphere
    const atmGeometry = new THREE.SphereGeometry(this.radius * 1.05, 32, 16);
    const atmMaterial = new THREE.MeshPhongMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmGeometry, atmMaterial);
    this.mesh.add(atmosphere);
  }
  
  createMoon() {
    // Create moon texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Extract RGB from color and make it more gray/rocky
    const r = Math.min(200, ((this.color >> 16) & 255) * 0.7 + 100);
    const g = Math.min(200, ((this.color >> 8) & 255) * 0.7 + 100);
    const b = Math.min(200, (this.color & 255) * 0.7 + 100);
    
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
    const moonGeometry = new THREE.SphereGeometry(this.radius, 24, 16);
    const moonMaterial = new THREE.MeshPhongMaterial({ 
      map: moonTexture,
      shininess: 5,
      bumpMap: moonTexture,
      bumpScale: 0.1
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    this.mesh.add(moon);
  }

  createMarioCharacter() {
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
    
    // Scale Mario to fit inside the core (much smaller for star theme)
    const scale = this.radius * 0.2;
    this.marioGroup.scale.set(scale, scale, scale);
    this.marioGroup.position.copy(this.position);
    
    this.scene.add(this.marioGroup);
    this.animationTime = 0;
  }

  update(deltaTime) {
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    this.mesh.position.copy(this.position);
    
    // Handle size boost animation
    if (Math.abs(this.radius - this.targetRadius) > 0.01) {
      const diff = this.targetRadius - this.radius;
      const growth = diff * this.growthSpeed;
      this.grow(growth);
    }
    
    // Update Mario character if this is the player
    if (this.isPlayer && this.marioGroup) {
      this.marioGroup.position.copy(this.position);
      
      // Animate Mario (running motion)
      this.animationTime += deltaTime * 10;
      const bobAmount = Math.sin(this.animationTime) * 0.1;
      this.marioGroup.position.y += bobAmount;
      
      // Rotate Mario slightly while moving
      if (this.velocity.length() > 0.1) {
        const rotationSpeed = this.velocity.length() * 0.1;
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
    
    // Update Saturn ring position
    if (this.saturnRing) {
      this.saturnRing.position.copy(this.position);
      this.saturnRing.rotation.y += deltaTime * 0.5; // Rotate horizontally
    }
    
    
    // Update PacMan mouth
    if (this.pacmanGroup) {
      this.pacmanGroup.position.copy(this.position);
      
      // Face direction of movement
      if (this.velocity.length() > 0.1) {
        const angle = Math.atan2(this.velocity.x, this.velocity.z);
        this.pacmanGroup.rotation.y = angle;
      }
      
      // Animate mouth opening and closing
      this.pacmanMouthAngle += deltaTime * 8;
      const mouthOpenness = Math.abs(Math.sin(this.pacmanMouthAngle)) * 0.4 + 0.1;
      
      if (this.pacmanGroup.upperJaw && this.pacmanGroup.lowerJaw) {
        this.pacmanGroup.upperJaw.rotation.x = -mouthOpenness;
        this.pacmanGroup.lowerJaw.rotation.x = Math.PI + mouthOpenness;
      }
    }
    
    if (!this.isPlayer) {
      this.velocity.multiplyScalar(0.92);
    } else {
      this.velocity.multiplyScalar(0.95);
    }
    
    const boundaryLimit = 250;
    if (Math.abs(this.position.x) > boundaryLimit) {
      this.position.x = Math.sign(this.position.x) * boundaryLimit;
      this.velocity.x *= -0.8;
    }
    if (Math.abs(this.position.z) > boundaryLimit) {
      this.position.z = Math.sign(this.position.z) * boundaryLimit;
      this.velocity.z *= -0.8;
    }
    
    this.position.y = this.radius;
    this.mesh.position.y = this.radius;
  }

  grow(amount) {
    this.radius += amount;
    this.mass = Math.pow(this.radius / this.baseRadius, 3);
    
    // Store current skin state to preserve it
    const currentSkin = this.currentSkin;
    
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    
    // Remove Mario if it exists
    if (this.marioGroup) {
      this.scene.remove(this.marioGroup);
      this.marioGroup.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
    
    // Remove PacMan if it exists (will be recreated by createMesh if needed)
    if (this.pacmanGroup) {
      this.scene.remove(this.pacmanGroup);
      this.pacmanGroup.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.pacmanGroup = null;
    }
    
    this.createMesh();
    
    // If PacMan skin was active, recreate PacMan group
    if (currentSkin === 'pacman' && this.isPlayer) {
      this.applyPacManSkin();
    }
  }

  canEat(otherBall) {
    return this.radius > otherBall.radius * 1.0;
  }

  eat(otherBall) {
    const volumeGained = Math.pow(otherBall.radius, 3) * 0.5;
    const newVolume = Math.pow(this.radius, 3) + volumeGained;
    const newRadius = Math.cbrt(newVolume);
    
    this.grow(newRadius - this.radius);
    
    // Update base radius when growing normally
    this.baseRadius = this.radius;
    
    return Math.floor(otherBall.radius * 10);
  }

  distanceTo(otherBall) {
    return this.position.distanceTo(otherBall.position);
  }

  isColliding(otherBall) {
    return this.distanceTo(otherBall) < (this.radius + otherBall.radius);
  }

  applyForce(force) {
    // Apply speed multiplier for power-ups
    const adjustedForce = force.clone().multiplyScalar(this.speedMultiplier);
    this.velocity.add(adjustedForce);
    
    const baseMaxSpeed = this.isPlayer ? 30 : 20;
    const maxSpeed = baseMaxSpeed * this.speedMultiplier;
    if (this.velocity.length() > maxSpeed) {
      this.velocity.normalize().multiplyScalar(maxSpeed);
    }
  }

  randomWalk() {
    const force = new THREE.Vector3(
      (Math.random() - 0.5) * 1.0,
      0,
      (Math.random() - 0.5) * 1.0
    );
    this.applyForce(force);
  }

  seekTarget(target) {
    const direction = target.position.clone().sub(this.position).normalize();
    const force = direction.multiplyScalar(2.2);
    this.applyForce(force);
  }

  avoidThreat(threat) {
    const direction = this.position.clone().sub(threat.position).normalize();
    const force = direction.multiplyScalar(2.0);
    this.applyForce(force);
  }

  findNearestTarget(allBalls) {
    let nearestTarget = null;
    let nearestDistance = Infinity;
    
    for (const ball of allBalls) {
      if (ball === this || !this.canEat(ball)) continue;
      
      const distance = this.distanceTo(ball);
      if (distance < nearestDistance && distance < 80) {
        nearestDistance = distance;
        nearestTarget = ball;
      }
    }
    
    return nearestTarget;
  }

  findIdealTarget(allBalls) {
    let idealTarget = null;
    let largestEatableSize = 0;
    let shortestDistance = Infinity;
    
    for (const ball of allBalls) {
      if (ball === this || !this.canEat(ball)) continue;
      
      const distance = this.distanceTo(ball);
      if (distance > 100) continue; // Too far away
      
      // Prioritize larger eatable balls first, then closer ones
      if (ball.radius > largestEatableSize || 
          (Math.abs(ball.radius - largestEatableSize) < 0.1 && distance < shortestDistance)) {
        largestEatableSize = ball.radius;
        shortestDistance = distance;
        idealTarget = ball;
      }
    }
    
    return idealTarget;
  }

  findNearestThreat(allBalls) {
    let nearestThreat = null;
    let nearestDistance = Infinity;
    
    for (const ball of allBalls) {
      if (ball === this || !ball.canEat(this)) continue;
      
      const distance = this.distanceTo(ball);
      if (distance < nearestDistance && distance < 60) {
        nearestDistance = distance;
        nearestThreat = ball;
      }
    }
    
    return nearestThreat;
  }

  destroy() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    
    // Remove Mario if it exists
    if (this.marioGroup) {
      this.scene.remove(this.marioGroup);
      this.marioGroup.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
    
    this.removeSkin();
  }
  
  setSkin(skinType) {
    // Remove current skin first
    this.removeSkin();
    this.currentSkin = skinType;
    
    switch(skinType) {
      case 'pacman':
        this.applyPacManSkin();
        break;
      case 'saturn':
        this.applySaturnSkin();
        break;
      case 'earth':
        this.applyEarthSkin();
        break;
      default:
        this.currentSkin = 'default';
        // Restore default regular ball appearance for player
        if (this.isPlayer) {
          this.mesh.material.map = null;
          this.mesh.material.transparent = true;
          this.mesh.material.opacity = 0.4;
          this.mesh.material.color.setHex(this.color);
          this.mesh.material.needsUpdate = true;
          if (this.marioGroup) {
            this.marioGroup.visible = true;
          }
        }
    }
  }
  
  removeSkin() {
    // Remove Saturn ring
    if (this.saturnRing) {
      this.scene.remove(this.saturnRing);
      // Dispose of all ring segments
      this.saturnRing.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.saturnRing = null;
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
    
    // Reset material
    if (this.mesh) {
      this.mesh.material.map = null;
      this.mesh.material.needsUpdate = true;
    }
  }
  
  applyPacManSkin() {
    if (!this.isPlayer) return;
    
    // Hide Mario
    if (this.marioGroup) {
      this.marioGroup.visible = false;
    }
    
    // Change ball to yellow and opaque
    this.mesh.material.color.setHex(0xffff00);
    this.mesh.material.transparent = false;
    this.mesh.material.opacity = 1;
    
    // Create PacMan mouth group
    this.pacmanGroup = new THREE.Group();
    
    // Create upper jaw
    const upperJawGeometry = new THREE.SphereGeometry(
      this.radius * 1.01, 
      32, 
      16,
      0, 
      Math.PI * 2,
      0,
      Math.PI / 3
    );
    const blackMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      side: THREE.BackSide 
    });
    const upperJaw = new THREE.Mesh(upperJawGeometry, blackMaterial);
    upperJaw.rotation.x = -Math.PI / 6;
    this.pacmanGroup.add(upperJaw);
    
    // Create lower jaw
    const lowerJawGeometry = new THREE.SphereGeometry(
      this.radius * 1.01, 
      32, 
      16,
      0, 
      Math.PI * 2,
      0,
      Math.PI / 3
    );
    const lowerJaw = new THREE.Mesh(lowerJawGeometry, blackMaterial);
    lowerJaw.rotation.x = Math.PI + Math.PI / 6;
    this.pacmanGroup.add(lowerJaw);
    
    // Create eye
    const eyeGeometry = new THREE.SphereGeometry(this.radius * 0.1, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye.position.set(0, this.radius * 0.3, this.radius * 0.8);
    this.pacmanGroup.add(eye);
    
    // Store jaws for animation
    this.pacmanGroup.upperJaw = upperJaw;
    this.pacmanGroup.lowerJaw = lowerJaw;
    this.pacmanMouthAngle = 0;
    
    this.pacmanGroup.position.copy(this.position);
    this.scene.add(this.pacmanGroup);
  }
  
  applySaturnSkin() {
    if (!this.isPlayer) return;
    
    // Change ball to brown
    this.mesh.material.color.setHex(0x8b4513); // Saddle brown
    this.mesh.material.map = null;
    this.mesh.material.transparent = false;
    this.mesh.material.opacity = 1;
    this.mesh.material.needsUpdate = true;
    
    // Create simple flat ring
    this.saturnRing = new THREE.Group();
    const ringGeometry = new THREE.RingGeometry(this.radius * 1.4, this.radius * 2.2, 64, 1);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: 0xd2b48c, // Tan color for ring
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2.2; // Slight tilt
    this.saturnRing.add(ring);
    
    this.saturnRing.position.copy(this.position);
    this.scene.add(this.saturnRing);
  }
  
  applyEarthSkin() {
    if (!this.isPlayer) return;
    
    // Create detailed Earth texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Draw ocean base
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGradient.addColorStop(0, '#4682B4');
    oceanGradient.addColorStop(0.5, '#006994');
    oceanGradient.addColorStop(1, '#003366');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw continents with more detail
    ctx.fillStyle = '#228B22';
    
    // North America
    ctx.beginPath();
    ctx.moveTo(100, 120);
    ctx.quadraticCurveTo(80, 80, 120, 60);
    ctx.quadraticCurveTo(180, 70, 200, 120);
    ctx.quadraticCurveTo(190, 180, 150, 200);
    ctx.quadraticCurveTo(100, 190, 100, 120);
    ctx.fill();
    
    // South America
    ctx.beginPath();
    ctx.ellipse(130, 280, 30, 80, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Africa
    ctx.beginPath();
    ctx.ellipse(420, 180, 40, 100, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Europe
    ctx.beginPath();
    ctx.ellipse(400, 100, 25, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Asia
    ctx.beginPath();
    ctx.ellipse(600, 120, 120, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Australia
    ctx.beginPath();
    ctx.ellipse(750, 320, 40, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add mountain ranges (darker green)
    ctx.fillStyle = '#1F5F1F';
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 15 + 5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    // Add cloud layer with shader-like effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 40 + 20;
      
      const cloudGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      cloudGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      cloudGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
      cloudGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = cloudGradient;
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }
    
    // Apply texture to current mesh
    const earthTexture = new THREE.CanvasTexture(canvas);
    if (this.mesh.children[0]) {
      this.mesh.children[0].material.map = earthTexture;
      this.mesh.children[0].material.transparent = false;
      this.mesh.children[0].material.opacity = 1;
      this.mesh.children[0].material.needsUpdate = true;
    }
    
    // Add subtle atmosphere glow
    const atmGeometry = new THREE.SphereGeometry(this.radius * 1.02, 32, 16);
    const atmMaterial = new THREE.MeshBasicMaterial({
      color: 0x87CEEB,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmGeometry, atmMaterial);
    this.mesh.add(atmosphere);
  }
  
  setSpeedBoost(multiplier) {
    this.speedMultiplier = multiplier;
  }
  
  setSizeBoost(multiplier) {
    if (multiplier === 1) {
      // Returning to normal size - shrink back
      const currentBoost = this.radius / this.baseRadius;
      if (currentBoost > 1.1) {
        // Was boosted, shrink back
        this.targetRadius = this.baseRadius;
      }
    } else {
      // Growing to boosted size - immediate 20% increase
      this.baseRadius = this.radius; // Save current size as base
      this.targetRadius = this.radius * multiplier;
    }
    this.growthSpeed = 0.1; // Faster transition
  }
  
  makeSun() {
    if (this.isPlayer || this.isSun) return; // Don't convert player or already converted sun
    
    this.isSun = true;
    
    // Remove existing mesh
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      if (this.mesh.material.map) this.mesh.material.map.dispose();
      this.mesh.material.dispose();
    }
    
    // Remove Saturn ring if it exists
    if (this.saturnRing) {
      this.scene.remove(this.saturnRing);
      this.saturnRing.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.saturnRing = null;
    }
    
    // Create sun texture
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
    
    const sunTexture = new THREE.CanvasTexture(canvas);
    
    // Create new mesh with sun appearance
    const geometry = new THREE.SphereGeometry(this.radius, 64, 32);
    const material = new THREE.MeshBasicMaterial({
      map: sunTexture,
      emissive: 0xffaa00,
      emissiveIntensity: 0.3
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.mesh.castShadow = false; // Sun doesn't cast shadows
    this.mesh.receiveShadow = false;
    
    this.scene.add(this.mesh);
    
    // Add corona glow effect
    const coronaGeometry = new THREE.SphereGeometry(this.radius * 1.3, 32, 16);
    const coronaMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    this.mesh.add(corona);
    
    // Add outer glow
    const outerGlowGeometry = new THREE.SphereGeometry(this.radius * 1.6, 32, 16);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    this.mesh.add(outerGlow);
  }
}