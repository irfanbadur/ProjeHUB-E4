// src/commands/createSolidHatchFromBoundary.js
import * as THREE from 'three';
import { generateUniqueId } from '../utils/generateUniqueId';

 
export function createSolidHatchFromBoundary( target, { segments, color = 0xff0000 }) {
  if (  !segments || !Array.isArray(segments)) return;

  const shape = new THREE.Shape();

  segments.forEach((segment, i) => {
    if (segment.type === 'line') {
      const from = segment.from;
      const to = segment.to;
      if (i === 0) shape.moveTo(from.x, from.y);
      shape.lineTo(to.x, to.y);
    }

    if (segment.type === 'arc') {
      const center = segment.center;
      const radius = segment.radius;
      const startAngle = segment.startAngle;
      const endAngle = segment.endAngle;
      const clockwise = segment.clockwise || false;

      const startX = center.x + radius * Math.cos(startAngle);
      const startY = center.y + radius * Math.sin(startAngle);
      if (i === 0) shape.moveTo(startX, startY);

      shape.absarc(center.x, center.y, radius, startAngle, endAngle, clockwise);
    }
  });

  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.userData = {
    id: generateUniqueId(),
    type: 'solidHatch',
    isSelectable: true,
    originalColor: color,
  };
 if (target) target.add(mesh);
  return mesh;
}
 