// utils/draw/drawRectFromCode.js
import * as THREE from 'three';
import { generateUniqueId } from '../utils/generateUniqueId';

export function drawRectFromCode( {
  start,
  end,
  color = 0xffffff
}) {
  if (  !start || !end) {
    console.warn('drawRectFromCode: start ve end noktaları gereklidir.');
    return;
  }

  const geometry = new THREE.BufferGeometry();

  const points = [
    new THREE.Vector3(start.x, start.y, 0),
    new THREE.Vector3(end.x, start.y, 0),
    new THREE.Vector3(end.x, end.y, 0),
    new THREE.Vector3(start.x, end.y, 0),
    new THREE.Vector3(start.x, start.y, 0), // başa dön
  ];

  const vertices = [];
  points.forEach((p) => vertices.push(p.x, p.y, p.z));

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  const material = new THREE.LineBasicMaterial({ color });
  const rect = new THREE.Line(geometry, material);

  rect.userData = {
    id: generateUniqueId('rect'),
    type: 'rect',
    isSelectable: true,
    originalColor: color,
    start,
    end,
  };

 // scene.add(rect);
  return rect;
}

/*  KULLANIM 
drawRectFromCode(scene, {
  start: { x: -50, y: -30 },
  end: { x: 50, y: 30 },
  color: 0xffa500,
});
 */