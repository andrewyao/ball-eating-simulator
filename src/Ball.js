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
    
    this.createMesh();
  }

  createMesh() {
    const geometry = new THREE.SphereGeometry(this.radius, 32, 16);
    
    let material;
    if (this.isPlayer) {
      // Translucent green ball for player
      material = new THREE.MeshPhongMaterial({ 
        color: this.color,
        shininess: 100,
        specular: 0x222222,
        transparent: true,
        opacity: 0.4
      });
    } else {
      material = new THREE.MeshPhongMaterial({ 
        color: this.color,
        shininess: 100,
        specular: 0x222222
      });
    }
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    this.scene.add(this.mesh);
    
    // Add Mario character inside player ball
    if (this.isPlayer) {
      this.createMarioCharacter();
    }
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
    
    // Scale Mario to fit inside the ball
    const scale = this.radius * 0.8;
    this.marioGroup.scale.set(scale, scale, scale);
    this.marioGroup.position.copy(this.position);
    
    this.scene.add(this.marioGroup);
    this.animationTime = 0;
  }

  update(deltaTime) {
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    this.mesh.position.copy(this.position);
    
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
    
    this.createMesh();
  }

  canEat(otherBall) {
    return this.radius > otherBall.radius * 1.0;
  }

  eat(otherBall) {
    const volumeGained = Math.pow(otherBall.radius, 3) * 0.5;
    const newVolume = Math.pow(this.radius, 3) + volumeGained;
    const newRadius = Math.cbrt(newVolume);
    
    this.grow(newRadius - this.radius);
    
    return Math.floor(otherBall.radius * 10);
  }

  distanceTo(otherBall) {
    return this.position.distanceTo(otherBall.position);
  }

  isColliding(otherBall) {
    return this.distanceTo(otherBall) < (this.radius + otherBall.radius);
  }

  applyForce(force) {
    this.velocity.add(force);
    
    const maxSpeed = this.isPlayer ? 30 : 20;
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
  }
}