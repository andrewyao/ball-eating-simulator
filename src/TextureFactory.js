import * as THREE from 'three';

/**
 * Factory class for creating procedural textures for celestial bodies
 * Handles generation of Moon, Mars, Earth, and Jupiter textures
 */
export class TextureFactory {
  
  /**
   * Creates high-resolution Earth texture with continents, oceans, and clouds
   * @returns {THREE.CanvasTexture} Earth texture
   */
  static createEarthTexture() {
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
  
  /**
   * Creates realistic Moon texture with craters and surface details
   * @returns {THREE.CanvasTexture} Moon texture
   */
  static createMoonTexture() {
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
  
  /**
   * Creates realistic Mars texture with rusty surface and geological features
   * @returns {THREE.CanvasTexture} Mars texture
   */
  static createMarsTexture() {
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
  
  /**
   * Creates realistic Jupiter texture with characteristic bands and Great Red Spot
   * @returns {THREE.CanvasTexture} Jupiter texture
   */
  static createJupiterTexture() {
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
}