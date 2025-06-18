// src/command/drawArcFromCode.js
import * as THREE from 'three';
import { generateUniqueId } from '../utils/generateUniqueId';

export function drawArcFromCode(  {
  center,
  radius,
  startAngle,
  endAngle,
  clockwise = false,
  segments = 64,
  color = 0xffffff
}) {
  if (  !center || typeof radius !== 'number' || typeof startAngle !== 'number' || typeof endAngle !== 'number') {
    console.warn('drawArcFromCode: Eksik veya hatalı parametre');
    return;
  }

  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  let normalizedStart = startAngle;
  let normalizedEnd = endAngle;

  // Normalize açı farkı
  if (clockwise && endAngle > startAngle) {
    normalizedStart += Math.PI * 2;
  }
  if (!clockwise && startAngle > endAngle) {
    normalizedEnd += Math.PI * 2;
  }

  const angleDiff = Math.abs(normalizedEnd - normalizedStart);
  const step = angleDiff / segments;

  for (let i = 0; i <= segments; i++) {
    const theta = clockwise
      ? normalizedStart - i * step
      : normalizedStart + i * step;

    const x = center.x + radius * Math.cos(theta);
    const y = center.y + radius * Math.sin(theta);
    const z = center.z || 0;

    vertices.push(x, y, z);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.LineBasicMaterial({ color });
  const arc = new THREE.Line(geometry, material);

  arc.userData = {
    id: generateUniqueId('arc'),
    type: 'arc',
    isSelectable: true,
    originalColor: color,
    center,
    radius,
    startAngle,
    endAngle,
    clockwise,
  };

 // scene.add(arc);
  return arc;
}



/*  KULLANIM 
drawArcFromCode(scene, {
  center: { x: 0, y: 0, z: 0 },
  radius: 80,
  startAngle: 0, // 0 radian (0°)
  endAngle: Math.PI / 2, // 90°
  clockwise: false,
  color: 0xffaa00,
});

*/