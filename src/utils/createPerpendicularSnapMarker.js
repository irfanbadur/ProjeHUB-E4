// utils/createPerpendicularSnapMarker.js
import * as THREE from 'three';

export function createPerpendicularSnapMarker(size = 5) {
  const geometry = new THREE.PlaneGeometry(size, size);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
  return new THREE.Mesh(geometry, material);
}
