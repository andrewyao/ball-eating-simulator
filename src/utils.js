export function randomColor() {
  const colors = [
    0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 
    0xff00ff, 0x00ffff, 0xffa500, 0x800080,
    0xffc0cb, 0x40e0d0, 0xff6347, 0x7fffd4
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function randomPosition(boundary) {
  return {
    x: (Math.random() - 0.5) * boundary * 2,
    y: 0,
    z: (Math.random() - 0.5) * boundary * 2
  };
}

export function randomSize(min, max) {
  return Math.random() * (max - min) + min;
}

export function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

export function calculateSpawnRate(score) {
  const baseRate = 2000;
  const minRate = 500;
  const scoreFactor = Math.floor(score / 100);
  
  return Math.max(minRate, baseRate - scoreFactor * 100);
}

export function calculateMaxEnemies(score) {
  const baseMax = 50;
  const increment = Math.floor(score / 200);
  
  return Math.min(baseMax + increment, 100);
}

export function generateAIName() {
  const names = [
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
    'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi',
    'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega',
    'Apex', 'Blaze', 'Cipher', 'Dash', 'Echo', 'Flux', 'Ghost', 'Hawk',
    'Ion', 'Jinx', 'Knox', 'Lynx', 'Max', 'Neo', 'Orb', 'Phoenix',
    'Quest', 'Rex', 'Storm', 'Titan', 'Ultra', 'Vex', 'Wolf', 'Zap'
  ];
  return names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 999);
}