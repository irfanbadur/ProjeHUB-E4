// src/command/drawEllipseFromCode.js
import * as THREE from 'three';
import { generateUniqueId } from '../utils/generateUniqueId';

export function drawEllipseFromCode(target,  {
  center,
  radiusX,
  radiusY,
  rotation = 0, // radians
  segments = 64,
  color = 0xffffff
}) {
  if (  !center || typeof radiusX !== 'number' || typeof radiusY !== 'number') {
    console.warn('drawEllipseFromCode: Eksik veya hatalı parametre');
    return;
  }

  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = center.x + radiusX * Math.cos(angle) * Math.cos(rotation) - radiusY * Math.sin(angle) * Math.sin(rotation);
    const y = center.y + radiusX * Math.cos(angle) * Math.sin(rotation) + radiusY * Math.sin(angle) * Math.cos(rotation);
    const z = center.z || 0;

    vertices.push(x, y, z);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.LineBasicMaterial({ color });
  const ellipse = new THREE.LineLoop(geometry, material);

  ellipse.userData = {
    id: generateUniqueId('ellipse'),
    type: 'ellipse',
    isSelectable: true,
    originalColor: color,
    center,
    radiusX,
    radiusY,
    rotation,
  };

 // scene.add(ellipse);
 if (target) target.add(ellipse);
  return ellipse;
}


/*  KULLANIM 

drawEllipseFromCode(scene, {
  center: { x: 0, y: 0, z: 0 },
  radiusX: 100,
  radiusY: 60,
  rotation: Math.PI / 4, // 45 derece
  color: 0x00ffff,
});


*/