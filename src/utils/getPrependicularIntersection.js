// utils/getPerpendicularIntersection.js
import * as THREE from 'three';

export function getPerpendicularIntersection(mousePoint, targetLine) {
  const a = targetLine.start;
  const b = targetLine.end;
  const ap = new THREE.Vector3().subVectors(mousePoint, a);
  const ab = new THREE.Vector3().subVectors(b, a).normalize();
  const projLength = ap.dot(ab);
  const projPoint = new THREE.Vector3().copy(ab).multiplyScalar(projLength).add(a);

  return projPoint;
}
