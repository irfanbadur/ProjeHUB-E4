import * as THREE from 'three';

export function createWire(points, color = 0x00ffff, isPreview = false) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, linewidth: 2 });

  const line = new THREE.Line(geometry, material);
  
  line.userData = {
    type: 'wire',
    isPreview,
    isSelectable: !isPreview,
    id: `wire-${Date.now()}`
  };

  return line;
}
