import * as THREE from 'three';

export class CameraController {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target;
    this.angle = 0;
    this.distance = 50;
    this.height = 30;
    this.smoothness = 0.1;
    this.updateOffset();
  }
  
  updateOffset() {
    this.offset = new THREE.Vector3(
      Math.sin(this.angle) * this.distance,
      this.height,
      Math.cos(this.angle) * this.distance
    );
  }
  
  rotate(delta) {
    this.angle += delta;
    this.updateOffset();
  }

  update() {
    if (!this.target) return;

    const desiredPosition = this.target.position.clone().add(this.offset);
    
    this.camera.position.lerp(desiredPosition, this.smoothness);
    
    this.camera.lookAt(this.target.position);
  }

  setTarget(target) {
    this.target = target;
  }

  shake(intensity = 1, duration = 200) {
    const startTime = Date.now();
    const originalPosition = this.camera.position.clone();
    
    const shakeAnimation = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < duration) {
        const progress = elapsed / duration;
        const currentIntensity = intensity * (1 - progress);
        
        this.camera.position.x = originalPosition.x + (Math.random() - 0.5) * currentIntensity;
        this.camera.position.y = originalPosition.y + (Math.random() - 0.5) * currentIntensity;
        this.camera.position.z = originalPosition.z + (Math.random() - 0.5) * currentIntensity;
        
        requestAnimationFrame(shakeAnimation);
      }
    };
    
    shakeAnimation();
  }
}