// utils/findClosestPointOnPolyline.js
import * as THREE from 'three';

export function findClosestPointOnPolyline(mouseWorldPos, vertices) {
  let closestPoint = null;
  let minDistance = Infinity;

  for (let i = 0; i < vertices.length - 1; i++) {
    const p1 = vertices[i];
    const p2 = vertices[i + 1];

    const closest = closestPointOnSegment(mouseWorldPos, p1, p2);
    const dist = closest.distanceTo(mouseWorldPos);

    if (dist < minDistance) {
      minDistance = dist;
      closestPoint = closest;
    }
  }

  return closestPoint;
}

function closestPointOnSegment(p, a, b) {
  const ab = new THREE.Vector3().subVectors(b, a);
  const t = (p.clone().sub(a)).dot(ab) / ab.lengthSq();
  const clampedT = Math.max(0, Math.min(1, t));
  return a.clone().add(ab.multiplyScalar(clampedT));
}
