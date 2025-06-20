// src/commands/drawEllipticArcFromCode.js
import * as THREE from 'three';
import { generateUniqueId } from '../utils/generateUniqueId';

export function drawEllipticArcFromCode(target, {
  center,
  majorAxisEndPoint,
  axisRatio,
  startAngle,
  endAngle,
  color = 0xffffff,
  segments = 64,
}) {
  if (  !center || !majorAxisEndPoint || !axisRatio || startAngle == null || endAngle == null) return;

  const majorX = majorAxisEndPoint.x;
  const majorY = majorAxisEndPoint.y;

  const majorRadius = Math.sqrt(majorX ** 2 + majorY ** 2);
  const minorRadius = majorRadius * axisRatio;
  const rotation = Math.atan2(majorY, majorX); // major axis rotation

  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  const step = (endAngle - startAngle) / segments;

  for (let i = 0; i <= segments; i++) {
    const theta = startAngle + step * i;
    const x = center.x + majorRadius * Math.cos(theta) * Math.cos(rotation) - minorRadius * Math.sin(theta) * Math.sin(rotation);
    const y = center.y + majorRadius * Math.cos(theta) * Math.sin(rotation) + minorRadius * Math.sin(theta) * Math.cos(rotation);
    const z = center.z || 0;
    vertices.push(x, y, z);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.LineBasicMaterial({ color });
  const arc = new THREE.Line(geometry, material);

  arc.userData = {
    id: generateUniqueId('ellipticArc'),
    type: 'ellipticArc',
    isSelectable: true,
    originalColor: color,
    center,
    majorRadius,
    minorRadius,
    rotation,
    startAngle,
    endAngle,
  };

 // scene.add(arc);
 if (target) target.add(arc);
  return arc;
}
