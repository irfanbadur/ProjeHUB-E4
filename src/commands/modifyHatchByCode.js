// src/commands/modifyHatchByCode.js
import * as THREE from 'three';

export function modifyHatchByCode(scene, boundaries = [], color = 0xff0000) {
  if (!scene || boundaries.length === 0) return;

  const shape = new THREE.Shape();

  // İlk sınırı moveTo + lineTo ile çiz
  const first = boundaries[0];
  shape.moveTo(first.x, first.y);

  for (let i = 1; i < boundaries.length; i++) {
    shape.lineTo(boundaries[i].x, boundaries[i].y);
  }

  shape.lineTo(first.x, first.y); // Kapat

  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData = {
    type: 'solidHatch',
    isSelectable: false,
  };

  scene.add(mesh);
  return mesh;
}
