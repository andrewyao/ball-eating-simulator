import * as THREE from 'three';
import { TextureFactory } from './TextureFactory.js';

/**
 * Handles visual rendering and mesh creation for Ball objects
 * Manages materials, geometry, and celestial body appearance
 */
export class BallRenderer {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Creates a mesh for a ball based on its properties
   * @param {Object} ballData - Ball properties (radius, isPlayer, currentSkin, color, id)
   * @returns {Object} - { mesh, needsSaturnRing }
   */
  createMesh(ballData) {
    const { radius, isPlayer, currentSkin, color, id } = ballData;
    let texture, material;
    
    // Use lower quality geometry on mobile for better performance
    const isMobile = window.innerHeight > window.innerWidth;
    const widthSegments = isMobile ? 16 : 32;
    const heightSegments = isMobile ? 8 : 16;
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    let needsSaturnRing = false;
    
    if (isPlayer) {
      // Player ball appearance depends on current skin
      // Use simpler materials on mobile for better performance
      if (isMobile) {
        material = new THREE.MeshBasicMaterial({ 
          color: currentSkin === 'earth' ? 0x4169e1 : 
                currentSkin === 'saturn' ? 0x8b4513 :
                currentSkin === 'pacman' ? 0xffff00 : color,
          transparent: true,
          opacity: currentSkin === 'default' ? 0.4 : 1
        });
        if (currentSkin === 'saturn') needsSaturnRing = true;
      } else {
        if (currentSkin === 'earth') {
          texture = TextureFactory.createEarthTexture();
          material = new THREE.MeshPhongMaterial({ 
            map: texture,
            shininess: 20,
            transparent: true,
            opacity: 0.9,
            color: 0xffffff
          });
        } else if (currentSkin === 'saturn') {
          material = new THREE.MeshPhongMaterial({
            color: 0x8b4513, // Brown
            shininess: 30,
            transparent: false,
            opacity: 1
          });
          needsSaturnRing = true;
        } else if (currentSkin === 'pacman') {
          material = new THREE.MeshPhongMaterial({
            color: 0xffff00, // Yellow
            shininess: 20,
            transparent: false,
            opacity: 1
          });
        } else {
          // Default regular ball appearance
          material = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 20,
            transparent: true,
            opacity: 0.4
          });
        }
      }
    } else {
      // Enemy ball appearance - simplified on mobile
      if (isMobile) {
        // Use simple colors on mobile for better performance
        const enemyColor = radius < 8 ? 0x999999 : // Gray for small
                          radius < 15 ? 0xff6b35 : // Orange for medium 
                          0x8b4513; // Brown for large
        material = new THREE.MeshBasicMaterial({ 
          color: enemyColor
        });
        if (radius >= 15 && parseInt(id, 36) % 2 !== 0) {
          needsSaturnRing = true;
        }
      } else {
        // Full quality textures on desktop
        if (radius < 8) {
          // Small balls look like moon
          texture = TextureFactory.createMoonTexture();
          material = new THREE.MeshPhongMaterial({ 
            map: texture,
            shininess: 20
          });
        } else if (radius < 15) {
          // Medium balls look like Mars
          texture = TextureFactory.createMarsTexture();
          material = new THREE.MeshPhongMaterial({ 
            map: texture,
            shininess: 20
          });
        } else {
          // Large balls (15+) alternate between Jupiter and Saturn appearance
          const isJupiter = parseInt(id, 36) % 2 === 0;
          
          if (isJupiter) {
            // Jupiter appearance
            texture = TextureFactory.createJupiterTexture();
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
            needsSaturnRing = true;
          }
        }
      }
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    // Disable shadow casting/receiving on mobile for better performance
    mesh.castShadow = !isMobile;
    mesh.receiveShadow = !isMobile;
    
    return { mesh, needsSaturnRing };
  }

  /**
   * Creates a Saturn ring for large Saturn-type balls
   * @param {number} radius - Ball radius
   * @param {THREE.Vector3} position - Ball position
   * @returns {THREE.Group} Saturn ring group
   */
  createSaturnRing(radius, position) {
    const saturnRing = new THREE.Group();
    const ringGeometry = new THREE.RingGeometry(radius * 1.4, radius * 2.2, 64, 1);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: 0xd2b48c, // Tan color for ring
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2.2; // Slight tilt
    saturnRing.add(ring);
    
    saturnRing.position.copy(position);
    this.scene.add(saturnRing);
    
    return saturnRing;
  }

  /**
   * Creates a material for skin power-ups
   * @param {string} skinType - Type of skin ('earth', 'saturn', 'pacman')
   * @param {number} color - Base color for default skin
   * @returns {THREE.MeshPhongMaterial} Material for the skin
   */
  createSkinMaterial(skinType, color) {
    switch(skinType) {
      case 'earth':
        const earthTexture = TextureFactory.createEarthTexture();
        return new THREE.MeshPhongMaterial({ 
          map: earthTexture,
          shininess: 20,
          transparent: true,
          opacity: 0.9,
          color: 0xffffff
        });
      
      case 'saturn':
        return new THREE.MeshPhongMaterial({
          color: 0x8b4513, // Brown
          shininess: 30,
          transparent: false,
          opacity: 1
        });
      
      case 'pacman':
        return new THREE.MeshPhongMaterial({
          color: 0xffff00, // Yellow
          shininess: 20,
          transparent: false,
          opacity: 1
        });
      
      default:
        return new THREE.MeshPhongMaterial({ 
          color: color,
          shininess: 20,
          transparent: true,
          opacity: 0.4
        });
    }
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

  /**
   * Disposes of mesh resources properly
   * @param {THREE.Mesh} mesh - Mesh to dispose
   */
  disposeMesh(mesh) {
    if (mesh) {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (mesh.material.map) mesh.material.map.dispose();
        mesh.material.dispose();
      }
      if (mesh.parent) {
        mesh.parent.remove(mesh);
      }
    }
  }

  /**
   * Updates mesh position and scale
   * @param {THREE.Mesh} mesh - Mesh to update
   * @param {THREE.Vector3} position - New position
   * @param {number} radius - New radius for scaling
   */
  updateMesh(mesh, position, radius) {
    if (mesh) {
      mesh.position.copy(position);
      // Update scale if geometry needs to change significantly
      // For now, we recreate mesh when radius changes significantly
    }
  }
}