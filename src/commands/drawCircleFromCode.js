 
// src/command/drawCircleFromCode.js
import * as THREE from 'three';
import { generateUniqueId } from '../utils/generateUniqueId';

export function drawCircleFromCode(  { center, radius, color = 0xffffff }) {
  if (  !center || !radius) return;

  const segments = 64;
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = center.x + radius * Math.cos(theta);
    const y = center.y + radius * Math.sin(theta);
    const z = center.z || 0;
    vertices.push(x, y, z);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  const material = new THREE.LineBasicMaterial({ color });
  const circle = new THREE.LineLoop(geometry, material);

  circle.userData = {
    id: generateUniqueId('circle'),
    type: 'circle',
    isSelectable: true,
    originalColor: color,
    center,
    radius,
  };

  //scene.add(circle);
  return circle;
}



/* KULLANIM 
drawCircleFromCode(scene, {
  center: { x: 100, y: 50, z: 0 },
  radius: 40,
  color: 0xff0000, // kırmızı
});


*/